export interface RootSpecConfig {
    specDirectory: string;
    version?: string;
    cypressIntegration?: boolean;
}
/**
 * Load RootSpec config from project root
 * Returns null if config doesn't exist
 */
export declare function loadConfig(cwd: string): Promise<RootSpecConfig | null>;
/**
 * Save RootSpec config to project root
 */
export declare function saveConfig(cwd: string, config: RootSpecConfig): Promise<void>;
/**
 * Get spec directory, with fallback to scanning
 */
export declare function getSpecDirectory(cwd: string): Promise<string | null>;
//# sourceMappingURL=config.d.ts.map