/**
 * Hit-Test Quadtree
 * Spatial indexing for fast element lookup by point
 * V2.0: Performance instrumentation with telemetry logging
 */

import { analytics } from './analytics';
import type { CanvasElement } from './types';

/**
 * Bounding box for quadtree nodes
 */
interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Quadtree item (element with bounding box)
 */
interface QuadtreeItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Simple Quadtree implementation for spatial indexing
 */
class Quadtree {
  private bounds: Bounds;
  private capacity: number;
  private items: QuadtreeItem[];
  private divided: boolean;
  private northeast?: Quadtree;
  private northwest?: Quadtree;
  private southeast?: Quadtree;
  private southwest?: Quadtree;

  constructor(bounds: Bounds, capacity: number = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.items = [];
    this.divided = false;
  }

  /**
   * Insert item into quadtree
   */
  insert(item: QuadtreeItem): boolean {
    // Check if item intersects bounds
    if (!this.intersects(item)) {
      return false;
    }

    // If capacity not reached, add item
    if (this.items.length < this.capacity) {
      this.items.push(item);
      return true;
    }

    // Subdivide if needed
    if (!this.divided) {
      this.subdivide();
    }

    // Insert into subdivisions
    return (
      this.northeast!.insert(item) ||
      this.northwest!.insert(item) ||
      this.southeast!.insert(item) ||
      this.southwest!.insert(item)
    );
  }

  /**
   * Subdivide quadtree into four quadrants
   */
  private subdivide(): void {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;

    this.northeast = new Quadtree({ x: x + w, y, width: w, height: h }, this.capacity);
    this.northwest = new Quadtree({ x, y, width: w, height: h }, this.capacity);
    this.southeast = new Quadtree({ x: x + w, y: y + h, width: w, height: h }, this.capacity);
    this.southwest = new Quadtree({ x, y: y + h, width: w, height: h }, this.capacity);

    this.divided = true;
  }

  /**
   * Check if item intersects quadtree bounds
   */
  private intersects(item: QuadtreeItem): boolean {
    return !(
      item.x + item.width < this.bounds.x ||
      item.x > this.bounds.x + this.bounds.width ||
      item.y + item.height < this.bounds.y ||
      item.y > this.bounds.y + this.bounds.height
    );
  }

  /**
   * Query items at a point
   */
  query(point: { x: number; y: number }): QuadtreeItem[] {
    const found: QuadtreeItem[] = [];

    // Check if point is in bounds
    if (
      point.x < this.bounds.x ||
      point.x > this.bounds.x + this.bounds.width ||
      point.y < this.bounds.y ||
      point.y > this.bounds.y + this.bounds.height
    ) {
      return found;
    }

    // Check items in this node
    for (const item of this.items) {
      if (
        point.x >= item.x &&
        point.x <= item.x + item.width &&
        point.y >= item.y &&
        point.y <= item.y + item.height
      ) {
        found.push(item);
      }
    }

    // Recursively check subdivisions
    if (this.divided) {
      found.push(...this.northeast!.query(point));
      found.push(...this.northwest!.query(point));
      found.push(...this.southeast!.query(point));
      found.push(...this.southwest!.query(point));
    }

    return found;
  }
}

/**
 * Hit-test quadtree manager
 * Manages quadtree rebuild and queries with performance tracking
 */
export class HitTestQuadtree {
  private tree: Quadtree;
  private bounds: Bounds;

  constructor(bounds: Bounds = { x: 0, y: 0, width: 10000, height: 10000 }) {
    this.bounds = bounds;
    this.tree = new Quadtree(bounds);
  }

  /**
   * Rebuild quadtree from canvas elements
   * Includes performance instrumentation
   */
  rebuild(elements: Map<string, CanvasElement>): void {
    // Performance marks
    performance.mark('quadtree-rebuild-start');

    // Create new quadtree
    this.tree = new Quadtree(this.bounds);

    // Insert all absolute elements
    for (const [id, elem] of elements) {
      if (elem.mode === 'absolute' && elem.breakpoints?.desktop) {
        const t = elem.breakpoints.desktop;
        this.tree.insert({
          id,
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
        });
      }
    }

    // Performance measurement
    performance.mark('quadtree-rebuild-end');
    performance.measure(
      'quadtree-rebuild',
      'quadtree-rebuild-start',
      'quadtree-rebuild-end'
    );

    const measure = performance.getEntriesByName('quadtree-rebuild')[0];
    const duration = measure.duration;

    // Log to telemetry
    analytics.track('performance', 'quadtreeRebuild', {
      duration,
      elementCount: elements.size,
      exceeded: duration > 50,
    });

    // Warn if exceeded budget
    if (duration > 50) {
      console.warn(`⚠️ Quadtree rebuild: ${duration.toFixed(2)}ms > 50ms budget`);
    }

    // Clean up performance entries
    performance.clearMarks('quadtree-rebuild-start');
    performance.clearMarks('quadtree-rebuild-end');
    performance.clearMeasures('quadtree-rebuild');
  }

  /**
   * Query elements at a point
   * Returns element IDs sorted by z-index (highest first)
   */
  query(point: { x: number; y: number }): string[] {
    const items = this.tree.query(point);
    return items.map((item) => item.id);
  }

  /**
   * Query elements in a rectangular region
   * Useful for selection boxes
   */
  queryRegion(region: Bounds): string[] {
    // Sample points in region for now (simple implementation)
    // Could be optimized with region-based quadtree query
    const found = new Set<string>();

    // Sample grid of points
    const step = 50; // Sample every 50px
    for (let x = region.x; x <= region.x + region.width; x += step) {
      for (let y = region.y; y <= region.y + region.height; y += step) {
        const items = this.tree.query({ x, y });
        items.forEach((id) => found.add(id));
      }
    }

    return Array.from(found);
  }

  /**
   * Clear quadtree
   */
  clear(): void {
    this.tree = new Quadtree(this.bounds);
  }
}

/**
 * Singleton instance
 */
export const hitTestQuadtree = new HitTestQuadtree();
