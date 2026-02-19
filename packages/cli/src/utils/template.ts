/**
 * Simple template engine for replacing placeholders in markdown files
 *
 * Supports:
 * - Variables: {{VAR_NAME}}
 * - Conditionals: {{#IF VAR}}...{{/IF}}
 * - Lists: {{#EACH VAR}}...{{/EACH}}
 */

interface TemplateData {
  [key: string]: string | string[] | boolean | undefined;
}

/**
 * Replace template placeholders with actual values
 */
export function replaceTemplates(template: string, data: TemplateData): string {
  let result = template;

  // Process conditionals: {{#IF VAR}}...{{/IF}}
  result = result.replace(/\{\{#IF\s+(\w+)\}\}([\s\S]*?)\{\{\/IF\}\}/g, (_, varName, content) => {
    const value = data[varName];
    // Show content if variable is truthy (exists, non-empty array, true boolean)
    if (Array.isArray(value)) {
      return value.length > 0 ? content : '';
    }
    return value ? content : '';
  });

  // Process negative conditionals: {{#IF_NOT VAR}}...{{/IF_NOT}}
  result = result.replace(/\{\{#IF_NOT\s+(\w+)\}\}([\s\S]*?)\{\{\/IF_NOT\}\}/g, (_, varName, content) => {
    const value = data[varName];
    if (Array.isArray(value)) {
      return value.length === 0 ? content : '';
    }
    return value ? '' : content;
  });

  // Process lists: {{#EACH VAR}}{{ITEM}}{{/EACH}}
  result = result.replace(/\{\{#EACH\s+(\w+)\}\}([\s\S]*?)\{\{\/EACH\}\}/g, (_, varName, itemTemplate) => {
    const items = data[varName];
    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    // For each item, replace {{ITEM}} with the item value
    return items.map(item => {
      return itemTemplate.replace(/\{\{ITEM\}\}/g, item);
    }).join('');
  });

  // Process simple variables: {{VAR_NAME}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const value = data[varName];
    if (value === undefined || value === null) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    return String(value);
  });

  return result;
}
