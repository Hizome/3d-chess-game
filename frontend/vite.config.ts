import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import * as fs from 'fs'
import { join } from 'path'

// 复制资源的函数
function copyChessboardAssets() {
  const srcDir = join(__dirname, 'node_modules/chessboardjs/www')
  const destDir = join(__dirname, 'public/chessboardjs/www')

  function copyDir(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  if (fs.existsSync(srcDir)) {
    copyDir(srcDir, destDir)
    console.log('✓ Copied chessboardjs assets to public/')
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 自定义插件：复制 chessboardjs 资源到 public
    {
      name: 'copy-chessboardjs-assets',
      configureServer(server) {
        // 在开发服务器启动时复制资源
        copyChessboardAssets()
      },
      writeBundle() {
        // 在构建时也复制资源
        copyChessboardAssets()
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.svg'],
  server: {
    fs: {
      allow: ['..']
    }
  }
})
