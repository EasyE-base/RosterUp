/**
 * Layers Panel - Figma-style hierarchy view of page components
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react';
import { DetectedComponent } from '../../lib/componentDetector';

interface LayersPanelProps {
  components: DetectedComponent[];
  onSelectComponent: (component: DetectedComponent) => void;
  selectedComponent?: DetectedComponent | null;
}

export default function LayersPanel({
  components,
  onSelectComponent,
  selectedComponent,
}: LayersPanelProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set());
  const [lockedComponents, setLockedComponents] = useState<Set<string>>(new Set());

  const toggleExpanded = (componentId: string) => {
    setExpandedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  const toggleVisibility = (componentId: string, elem: HTMLElement) => {
    setHiddenComponents((prev) => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
        elem.style.display = '';
      } else {
        next.add(componentId);
        elem.style.display = 'none';
      }
      return next;
    });
  };

  const toggleLock = (componentId: string) => {
    setLockedComponents((prev) => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  const getComponentIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      navbar: '🧭',
      header: '📰',
      hero: '🎯',
      footer: '📍',
      card: '🃏',
      'card-grid': '🎴',
      form: '📝',
      sidebar: '📋',
      gallery: '🖼️',
      carousel: '🎠',
      cta: '📣',
      testimonial: '💬',
      pricing: '💰',
      'feature-list': '⭐',
    };
    return icons[type] || '📦';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBadge = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Med';
    return 'Low';
  };

  // Build hierarchy (group by parent-child relationships)
  const buildHierarchy = (comps: DetectedComponent[]): DetectedComponent[] => {
    // For now, just return top-level components
    // In the future, we can build nested hierarchy
    return comps.filter((c) => c.type !== 'card' || !comps.some((parent) => parent.type === 'card-grid' && parent.element.contains(c.element)));
  };

  const hierarchy = buildHierarchy(components);

  const ComponentLayer = ({ component, depth = 0 }: { component: DetectedComponent; depth?: number }) => {
    const componentId = `${component.type}-${component.element.tagName}-${depth}`;
    const isExpanded = expandedComponents.has(componentId);
    const isHidden = hiddenComponents.has(componentId);
    const isLocked = lockedComponents.has(componentId);
    const isSelected = selectedComponent?.element === component.element;
    const hasChildren = component.children && component.children.length > 0;

    return (
      <div className="select-none">
        <div
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-100 border border-blue-300'
              : 'hover:bg-slate-100 border border-transparent'
          } ${isLocked ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => !isLocked && onSelectComponent(component)}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(componentId);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-600" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Icon */}
          <span className="text-sm flex-shrink-0">{getComponentIcon(component.type)}</span>

          {/* Label */}
          <span className="flex-1 text-xs font-medium text-slate-900 truncate">
            {component.label}
          </span>

          {/* Confidence Badge */}
          <span className={`text-[10px] font-semibold ${getConfidenceColor(component.confidence)}`}>
            {getConfidenceBadge(component.confidence)}
          </span>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(componentId, component.element);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title={isHidden ? 'Show' : 'Hide'}
          >
            {isHidden ? (
              <EyeOff className="w-3 h-3 text-slate-400" />
            ) : (
              <Eye className="w-3 h-3 text-slate-600" />
            )}
          </button>

          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(componentId);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title={isLocked ? 'Unlock' : 'Lock'}
          >
            {isLocked ? (
              <Lock className="w-3 h-3 text-slate-400" />
            ) : (
              <Unlock className="w-3 h-3 text-slate-600" />
            )}
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {component.children!.map((child, index) => (
              <ComponentLayer
                key={`${child.type}-${index}`}
                component={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (components.length === 0) {
    return (
      <div className="h-full bg-white border-l border-slate-200 flex items-center justify-center p-8">
        <div className="text-center text-slate-400">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No components detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900">Layers</h3>
          </div>
          <div className="text-xs text-slate-500">
            {components.length} component{components.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {hierarchy.map((component, index) => (
          <div key={`${component.type}-${index}`} className="group">
            <ComponentLayer component={component} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
        <div className="text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Component Detection:</span>
            <span className="font-semibold">Active</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-green-600 font-semibold">●  High confidence</span>
            <span className="text-yellow-600 font-semibold">●  Medium</span>
            <span className="text-orange-600 font-semibold">●  Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
