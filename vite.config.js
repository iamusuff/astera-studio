import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Two build outputs:
//   npm run build         -> dist/         normal multi-file build for GitHub Pages
//   npm run build:single  -> dist-single/  one self-contained index.html for the zip,
//                                          so reviewers can open it by double-clicking
export default defineConfig(({ mode }) => {
  const single = mode === 'single'

  return {
    // Relative paths so the build works under /astera-studio/ on GitHub Pages
    // and when opened straight from disk.
    base: './',
    plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
    build: {
      outDir: single ? 'dist-single' : 'dist',
    },
  }
})
