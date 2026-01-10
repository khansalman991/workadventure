import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default defineConfig(() => {
    const config = {
        publicDir: "./src-ui/public/",
        // Ensure base path doesn't conflict with main frontend
        base: `${process.env.PATH_PREFIX || ""}/ui/`,
        
        server: {
            host: "0.0.0.0",
            port: 8080,          // Correct port for Map Storage
            strictPort: true,    // Prevent it from jumping to another port
            hmr: {
                // FIXED: Removed port 80 (Docker workaround) 
                // and set to 8080 for local development
                clientPort: 8080,
            },
        },

        define: {
            // Ensure the UI knows where the Map Storage API is
            'import.meta.env.VITE_MAP_STORAGE_API': JSON.stringify('http://localhost:8080'),
        },

        build: {
            sourcemap: true,
            outDir: "./dist-ui",
        },

        plugins: [
            svelte({
                preprocess: sveltePreprocess(),
                onwarn(warning, defaultHandler) {
                    // Suppress accessibility warnings to keep console clean
                    if (warning.code === "a11y-click-events-have-key-events") return;
                    if (warning.code === "security-anchor-rel-noreferrer") return;

                    if (defaultHandler) {
                        defaultHandler(warning);
                    }
                },
            }),
        ],
    };

    return config;
});