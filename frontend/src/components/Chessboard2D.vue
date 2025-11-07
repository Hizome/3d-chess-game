<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chess } from 'chess.js'

// 声明全局 Chessboard 和 jQuery
declare global {
  interface Window {
    Chessboard: any
    jQuery: any
  }
}

const boardEl = ref<HTMLDivElement>()
const boardId = `chessboard-${Math.random().toString(36).substr(2, 9)}`
let board: any = null
let chess = new Chess()

// 等待依赖加载
const waitForDependencies = (callback: () => void, retries = 50) => {
  if (retries <= 0) {
    return
  }

  // 检查是否有 ChessBoard 函数（未暴露到 window）
  const hasChessBoard = typeof (window as any).ChessBoard === 'function'
  const hasJQuery = typeof window.jQuery === 'function'

  if (hasChessBoard && hasJQuery) {
    // 如果 ChessBoard 没有暴露到 window，手动暴露
    if (typeof window.Chessboard === 'undefined') {
      ;(window as any).Chessboard = (window as any).ChessBoard
    }
    callback()
  } else {
    setTimeout(() => waitForDependencies(callback, retries - 1), 100)
  }
}

// 初始化棋盘
const initBoard = () => {
  if (!boardEl.value) {
    return
  }

  if (typeof window.Chessboard === 'undefined') {
    setTimeout(initBoard, 200)
    return
  }

  try {
    // 使用字符串 ID（推荐方式）
    const containerId = boardId

    // 创建棋盘实例
    board = new window.Chessboard(containerId, {
      position: 'start',
      orientation: 'white',
      draggable: true,
      width: 600,
      pieceTheme: (piece: string) => `/chessboardjs/www/img/chesspieces/wikipedia/${piece}.png`,
      onPieceDrop: (source: string, target: string) => {
        const move = chess.move({ from: source, to: target, promotion: 'q' })
        if (move) {
          board.position(chess.fen())
        }
        return !!move
      }
    })
  } catch (error) {
    console.error('Failed to initialize chessboard:', error)
  }
}

// 组件挂载时初始化
onMounted(() => {
  waitForDependencies(() => {
    initBoard()
  })
})
</script>

<template>
  <div class="chessboard-2d-wrapper">
    <div :id="boardId" ref="boardEl" class="chessboard-2d-container"></div>
  </div>
</template>

<style scoped>
.chessboard-2d-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 为 chessboard 容器设置明确的尺寸 */
.chessboard-2d-container {
  width: 600px;
  max-width: 100%;
  position: relative;
}

/* 确保 chessboard 可以正确渲染 - 使用通配符选择器 */
:deep([id^="chessboard"]) {
  width: 100% !important;
  max-width: 600px;
  margin: 0 auto;
}

:deep([id^="chessboard"] .board-b72b1) {
  width: 100% !important;
}

/* 确保棋盘方格可以正确显示 */
:deep([id^="chessboard"] .square-55d63) {
  width: calc(600px / 8) !important;
  height: calc(600px / 8) !important;
}

/* 确保棋子图片可以正确显示 */
:deep([id^="chessboard"] .piece-417db) {
  width: 100% !important;
  height: 100% !important;
}
</style>
