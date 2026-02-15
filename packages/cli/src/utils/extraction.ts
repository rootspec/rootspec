import fs from 'fs-extra';
import path from 'path';

/**
 * Extract Design Pillars from Level 1 (01.FOUNDATIONAL_PHILOSOPHY.md)
 *
 * @param specDir - Specification directory path (relative to cwd)
 * @param cwd - Current working directory (optional, defaults to process.cwd())
 * @returns Array of Design Pillar names
 */
export async function extractDesignPillars(specDir: string, cwd?: string): Promise<string[]> {
  const workingDir = cwd || process.cwd();
  const l1Path = path.join(workingDir, specDir, '01.FOUNDATIONAL_PHILOSOPHY.md');

  if (!await fs.pathExists(l1Path)) {
    return [];
  }

  try {
    const content = await fs.readFile(l1Path, 'utf-8');
    const pillars: string[] = [];

    // Extract Design Pillars section - capture content into group
    // Pattern: ## Design Pillars followed by content until next ## or end
    // Note: Using greedy * instead of *? to ensure all content is captured
    const pillarSection = content.match(/##\s+Design Pillars\s+([\s\S]*)(?=\n##|$)/i);

    if (pillarSection && pillarSection[1]) {
      // Extract all ### headers from the captured section
      // Using ^ and $ anchors with gm flags for proper multiline matching
      const matches = Array.from(pillarSection[1].matchAll(/^###\s+(.+?)$/gm));
      for (const match of matches) {
        pillars.push(match[1].trim());
      }
    }

    return pillars;
  } catch (e) {
    return [];
  }
}

/**
 * Extract Stable Truths from Level 2 (02.STABLE_TRUTHS.md)
 *
 * @param specDir - Specification directory path (relative to cwd)
 * @param cwd - Current working directory (optional, defaults to process.cwd())
 * @returns Array of Stable Truth names
 */
export async function extractStableTruths(specDir: string, cwd?: string): Promise<string[]> {
  const workingDir = cwd || process.cwd();
  const l2Path = path.join(workingDir, specDir, '02.STABLE_TRUTHS.md');

  if (!await fs.pathExists(l2Path)) {
    return [];
  }

  try {
    const content = await fs.readFile(l2Path, 'utf-8');
    const truths: string[] = [];

    // Look for ## headers (Stable Truths are top-level sections)
    const matches = Array.from(content.matchAll(/^##\s+(.+?)$/gm));
    for (const match of matches) {
      const name = match[1].trim();
      // Skip common metadata sections
      if (name !== 'Overview' && name !== 'Summary') {
        truths.push(name);
      }
    }

    return truths;
  } catch (e) {
    return [];
  }
}

/**
 * Extract Interaction Patterns from Level 3 (03.INTERACTION_ARCHITECTURE.md)
 *
 * @param specDir - Specification directory path (relative to cwd)
 * @param cwd - Current working directory (optional, defaults to process.cwd())
 * @returns Array of interaction pattern names
 */
export async function extractInteractionPatterns(specDir: string, cwd?: string): Promise<string[]> {
  const workingDir = cwd || process.cwd();
  const l3Path = path.join(workingDir, specDir, '03.INTERACTION_ARCHITECTURE.md');

  if (!await fs.pathExists(l3Path)) {
    return [];
  }

  try {
    const content = await fs.readFile(l3Path, 'utf-8');
    const patterns: string[] = [];

    // Extract pattern names from:
    // 1. Section headings (## Pattern Name, ### Pattern Name)
    // 2. Loop names (often in bold or as table headers)

    const headingMatches = content.match(/###?\s+([^\n]+)/g);
    if (headingMatches) {
      patterns.push(...headingMatches.map(m => m.replace(/###?\s+/, '').trim()));
    }

    // Also look for "Loop:" or "Pattern:" prefixed items
    const loopMatches = content.match(/(?:Loop|Pattern):\s*([^\n]+)/gi);
    if (loopMatches) {
      patterns.push(...loopMatches.map(m => m.replace(/(?:Loop|Pattern):\s*/i, '').trim()));
    }

    // Deduplicate and filter out common headings
    const filtered = [...new Set(patterns)]
      .filter(p => !['Overview', 'Introduction', 'Summary', 'Interaction Architecture', 'Level 3'].includes(p));

    return filtered;
  } catch (e) {
    return [];
  }
}
