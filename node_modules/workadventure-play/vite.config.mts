import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import legacy from "@vitejs/plugin-legacy";
import Icons from "unplugin-icons/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    
    return {
        // --- ENVIRONMENT VARIABLE OVERRIDES ---
        define: {
            // Networking and Auth overrides for local development
            'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:8081'),
            'import.meta.env.VITE_PUSHER_URL': JSON.stringify('ws://localhost:8081'),
            'import.meta.env.VITE_MAP_STORAGE_URL': JSON.stringify('http://localhost:8080'),
            'import.meta.env.VITE_AUTHENTICATION_STRATEGY': JSON.stringify('none'),
            'import.meta.env.VITE_IGNORE_ADMIN_API': JSON.stringify('true'),
            
            // Legacy process.env fallbacks
            'process.env.VITE_API_URL': JSON.stringify('http://localhost:8081'),
            'process.env.VITE_PUSHER_URL': JSON.stringify('ws://localhost:8081'),

            // --- GLOBAL COMPATIBILITY FIXES ---
            'process.env': {},
            'global': 'globalThis',
            // This is the CRITICAL fix for "exports is not defined"
            'exports': {}, 
        },

        server: {
            host: "0.0.0.0",
            port: 3000,
            strictPort: true,
            hmr: { 
                clientPort: 3000 
            },
            watch: { ignored: ["./src/pusher"] },
        },

        build: {
            sourcemap: env.GENERATE_SOURCEMAP !== "false",
            outDir: "./dist/public",
            assetsInclude: ["**/*.tflite", "**/*.wasm"],
        },

        plugins: [
            nodePolyfills({ 
                include: ["events", "buffer"], 
                globals: { Buffer: true } 
            }),
            svelte({
                preprocess: sveltePreprocess(),
                onwarn(warning, defaultHandler) {
                    if (warning.code.includes("a11y")) return;
                    if (defaultHandler) defaultHandler(warning);
                },
            }),
            Icons({ compiler: "svelte" }),
            legacy({ 
                polyfills: ["web.structured-clone"], 
                modernPolyfills: ["web.structured-clone"] 
            }),
            tsconfigPaths(),
        ],

        resolve: { 
            alias: { events: "events" } 
        },

        optimizeDeps: { 
            // We EXCLUDE the broken library and only include stable dependencies
            include: ["olm", "zod"], 
            exclude: ["svelte-modals", "@anatine/zod-openapi"], 
            esbuildOptions: { 
                define: { 
                    global: "globalThis",
                } 
            } 
        },
    };
});