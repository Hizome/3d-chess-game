<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Chess } from 'chess.js'
import { Chessboard, COLOR, INPUT_EVENT_TYPE, FEN } from 'cm-chessboard'

// 声明全局类型（如果需要）
const boardEl = ref<HTMLDivElement>()
let board: Chessboard | null = null
let chess = new Chess()

// 棋盘输入事件处理器
const inputHandler = (event: any) => {
  switch (event.type) {
    case INPUT_EVENT_TYPE.validateMoveInput:
      // 验证移动是否合法
      const move = chess.move({
        from: event.squareFrom,
        to: event.squareTo,
        promotion: 'q' // 默认升变为后
      })
      if (move) {
        // 移动合法，更新棋盘位置
        board?.setPosition(chess.fen())
      }
      return !!move // 返回 true 允许移动，false 拒绝移动
  }
  return true
}

// 初始化棋盘
const initBoard = () => {
  if (!boardEl.value) {
    return
  }

  try {
    // 创建棋盘实例
    board = new Chessboard(boardEl.value, {
      position: FEN.start, // 初始位置
      orientation: COLOR.white, // 白方视角
      assetUrl: '/cm-chessboard/', // 资源路径
      responsive: true, // 自适应容器
      style: {
        cssClass: 'default',
        showCoordinates: true, // 显示坐标
        borderType: 'thin' // 边框类型
      }
    })

    // 启用用户输入
    board.enableMoveInput(inputHandler, COLOR.white)
  } catch (error) {
    console.error('Failed to initialize chessboard:', error)
  }
}

// 组件挂载时初始化
onMounted(() => {
  initBoard()
})

// 组件卸载时清理
onUnmounted(() => {
  if (board) {
    board.destroy()
  }
})

// 导出方法供父组件调用
defineExpose({
  getPosition: () => chess.fen(),
  setPosition: (fen: string) => {
    chess = new Chess(fen)
    board?.setPosition(fen)
  },
  reset: () => {
    chess = new Chess()
    board?.setPosition(FEN.start)
  }
})
</script>

<template>
  <div class="chessboard-2d-wrapper">
    <div ref="boardEl" class="chessboard-2d-container"></div>
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

.chessboard-2d-container {
  max-width: 100%;
  max-height: 100%;
  position: relative;
}

/* cm-chessboard 使用 SVG 渲染，默认样式已经很不错 */
.chessboard-2d-container svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* 自定义棋盘样式（如果需要） */
:deep(.cm-chessboard) {
  --light-color: #f0d9b5;
  --dark-color: #b58863;
  --hover-color: #6fa8dc;
  --focus-color: #99ccff;
}
</style>
