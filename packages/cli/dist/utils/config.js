import fs from 'fs-extra';
import path from 'path';
const CONFIG_FILENAME = '.rootspecrc.json';
/**
 * Load RootSpec config from project root
 * Returns null if config doesn't exist
 */
export async function loadConfig(cwd) {
    const configPath = path.join(cwd, CONFIG_FILENAME);
    if (!await fs.pathExists(configPath)) {
        return null;
    }
    try {
        const config = await fs.readJSON(configPath);
        return config;
    }
    catch (e) {
        return null;
    }
}
/**
 * Save RootSpec config to project root
 */
export async function saveConfig(cwd, config) {
    const configPath = path.join(cwd, CONFIG_FILENAME);
    await fs.writeJSON(configPath, config, { spaces: 2 });
}
/**
 * Get spec directory, with fallback to scanning
 */
export async function getSpecDirectory(cwd) {
    // Try loading from config first
    const config = await loadConfig(cwd);
    if (config?.specDirectory) {
        return config.specDirectory;
    }
    // Fall back to scanning common locations
    const commonDirs = ['./spec', './docs/spec', '.'];
    for (const dir of commonDirs) {
        const testPath = path.join(cwd, dir, '00.SPEC_FRAMEWORK.md');
        if (await fs.pathExists(testPath)) {
            return dir;
        }
    }
    return null;
}
//# sourceMappingURL=config.js.map