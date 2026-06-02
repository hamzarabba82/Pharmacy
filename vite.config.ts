import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

function mockEntryPlugin(useMock: boolean): Plugin {
  return {
    name: 'mock-entry',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        if (useMock) return html.replace('/src/main.ts', '/src/main.mock.ts')
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const useMock = env.VITE_USE_MOCK === 'true' || mode === 'mock'
  return {
    plugins: [vue(), mockEntryPlugin(useMock)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
