/**
 * Apply element style overrides to DOM elements
 * This runs after a section renders to apply persisted custom styles
 */
export function applyElementOverrides(
  containerRef: HTMLElement | null,
  elementOverrides: Record<string, Record<string, string>> | undefined
) {
  if (!containerRef || !elementOverrides) return;

  Object.entries(elementOverrides).forEach(([elementId, styles]) => {
    const element = containerRef.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
    if (element) {
      Object.entries(styles).forEach(([property, value]) => {
        // Convert camelCase to kebab-case for CSS properties
        const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        element.style.setProperty(cssProperty, value);
      });
    }
  });
}
