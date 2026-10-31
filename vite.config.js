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
      // One ~1 MB bundle (~300 KB gzipped), mostly the chart and animation
      // libraries. Splitting it would not help: the zip build inlines everything
      // into one file anyway, and there is no server to stream chunks from.
      chunkSizeWarningLimit: 1200,
    },
  }
})
