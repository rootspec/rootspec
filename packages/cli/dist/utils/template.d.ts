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
export declare function replaceTemplates(template: string, data: TemplateData): string;
export {};
//# sourceMappingURL=template.d.ts.map