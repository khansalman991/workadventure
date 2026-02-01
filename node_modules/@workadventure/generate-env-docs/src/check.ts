#!/usr/bin/env tsx

import { readFileSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { extractEnvVariables } from "./extractor.js";
import { generateMarkdown } from "./markdown-generator.js";

// Use a safer way to define __dirname that works in tsx ESM mode
const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
    console.log("🔍 Checking environment variables documentation...");

    // Path to the root of the metaverse repository
    const projectRoot = resolve(__dirname, "../../../../");

    /**
     * FIX: Dynamic imports of external validators.
     * We use the absolute path to ensure TypeScript doesn't try to 
     * include these in the 'src' rootDir of the tool.
     */
    const playModule = await import(join(projectRoot, "play/src/pusher/enums/EnvironmentVariableValidator.js"));
    const backModule = await import(join(projectRoot, "back/src/Enum/EnvironmentVariableValidator.js"));
    const mapStorageModule = await import(join(projectRoot, "map-storage/src/Enum/EnvironmentVariableValidator.js"));

    // Extract variables
    const playVars = extractEnvVariables(playModule.EnvironmentVariables);
    const backVars = extractEnvVariables(backModule.EnvironmentVariables);
    const mapStorageVars = extractEnvVariables(mapStorageModule.EnvironmentVariables);

    // Generate expected markdown
    const expectedMarkdown = generateMarkdown(playVars, backVars, mapStorageVars);

    // Read current documentation
    const docPath = resolve(projectRoot, "docs/others/self-hosting/env-variables.md");
    let currentMarkdown: string;

    try {
        currentMarkdown = readFileSync(docPath, "utf-8");
    } catch (error) {
        console.error(`\n❌ Error: Documentation file not found at ${docPath}`);
        console.error("   Run 'npm run generate-env-docs' to generate it.\n");
        process.exit(1);
    }

    // Compare
    if (currentMarkdown.trim() !== expectedMarkdown.trim()) {
        console.error("\n❌ Error: env-variables.md is out of date.");
        console.error("   Run 'npm run generate-env-docs' to update it.\n");
        process.exit(1);
    }

    console.log("\n✅ Documentation is up to date!");
}

main().catch((error) => {
    console.error("❌ Error checking documentation:", error);
    process.exit(1);
});