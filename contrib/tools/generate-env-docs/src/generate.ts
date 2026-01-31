#!/usr/bin/env tsx

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url"; // Added pathToFileURL
// @ts-ignore
import { extractEnvVariables } from "./extractor.js";
// @ts-ignore
import { generateMarkdown } from "./markdown-generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log("🔍 Extracting environment variables from Zod schemas...");

    // 1. Resolve absolute paths
    const playPath = resolve(__dirname, "../../../../play/src/pusher/enums/EnvironmentVariableValidator.ts");
    const backPath = resolve(__dirname, "../../../../back/src/Enum/EnvironmentVariableValidator.ts");
    const mapStoragePath = resolve(__dirname, "../../../../map-storage/src/Enum/EnvironmentVariableValidator.ts");

    console.log("📂 Loading modules via file:// protocol...");

    /**
     * FIX: Convert Windows absolute paths (C:\...) to file URLs (file:///C:/...)
     * to satisfy the ESM loader requirement.
     */
    const playModule = await import(pathToFileURL(playPath).href);
    const backModule = await import(pathToFileURL(backPath).href);
    const mapStorageModule = await import(pathToFileURL(mapStoragePath).href);

    // Extracting data using helper functions
    const playVars = extractEnvVariables(playModule.EnvironmentVariables);
    const backVars = extractEnvVariables(backModule.EnvironmentVariables);
    const mapStorageVars = extractEnvVariables(mapStorageModule.EnvironmentVariables);

    console.log(`  ✓ Play: ${playVars.length} variables`);
    console.log(`  ✓ Back: ${backVars.length} variables`);
    console.log(`  ✓ Map Storage: ${mapStorageVars.length} variables`);

    // Generate markdown
    const markdown = generateMarkdown(playVars, backVars, mapStorageVars);

    // Final output path
    const outputPath = resolve(__dirname, "../../../../docs/others/self-hosting/env-variables.md");
    writeFileSync(outputPath, markdown, "utf-8");

    console.log(`\n✅ Documentation generated successfully!`);
    console.log(`   Output: ${outputPath}`);
}

main().catch((error) => {
    console.error("❌ Error generating documentation:", error);
    process.exit(1);
});