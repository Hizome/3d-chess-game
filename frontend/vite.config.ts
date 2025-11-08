import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 复制资源的函数
function copyCmChessboardAssets() {
  const fs = require('fs')
  const path = require('path')

  const srcDir = path.join(__dirname, 'node_modules/cm-chessboard/src')
  const destDir = path.join(__dirname, 'public/cm-chessboard')

  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  if (fs.existsSync(srcDir)) {
    copyDir(srcDir, destDir)
    console.log('✓ Copied cm-chessboard assets to public/')
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 自定义插件：复制 cm-chessboard 资源到 public
    {
      name: 'copy-cm-chessboard-assets',
      configureServer() {
        copyCmChessboardAssets()
      },
      writeBundle() {
        copyCmChessboardAssets()
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.svg'],
  server: {
    fs: {
      allow: ['..']
    }
  }
})
