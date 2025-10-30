/**
 * Template System Types
 * Defines the structure for pre-built website templates
 */

export type SectionType = 'hero' | 'about' | 'schedule' | 'contact' | 'roster' | 'gallery' | 'custom';

export interface TemplateSection {
  name: string;
  section_type: SectionType;
  content: Record<string, any>;
  styles?: Record<string, string>;
  version?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  preview_url?: string;
  sections: TemplateSection[];
  metadata?: {
    author?: string;
    created_at?: string;
    tags?: string[];
  };
}

export interface TemplateManifest {
  templates: {
    id: string;
    name: string;
    description: string;
    preview_url: string;
    file: string;
  }[];
  version: string;
}

/**
 * Template variable replacement
 * Replaces {{variable}} placeholders with actual values
 */
export function replaceTemplateVariables(
  content: Record<string, any>,
  variables: Record<string, string>
): Record<string, any> {
  const replaced: Record<string, any> = {};

  for (const [key, value] of Object.entries(content)) {
    if (typeof value === 'string') {
      let newValue = value;
      for (const [varName, varValue] of Object.entries(variables)) {
        newValue = newValue.replace(new RegExp(`{{${varName}}}`, 'g'), varValue);
      }
      replaced[key] = newValue;
    } else if (typeof value === 'object' && value !== null) {
      replaced[key] = replaceTemplateVariables(value, variables);
    } else {
      replaced[key] = value;
    }
  }

  return replaced;
}

/**
 * Load template from public/templates directory
 */
export async function loadTemplate(templateFile: string): Promise<Template> {
  try {
    const response = await fetch(`/templates/${templateFile}`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load template ${templateFile}:`, error);
    throw error;
  }
}

/**
 * Load template manifest
 */
export async function loadTemplateManifest(): Promise<TemplateManifest> {
  try {
    const response = await fetch('/templates/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load template manifest:', error);
    throw error;
  }
}
