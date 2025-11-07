<script setup lang="ts">
import { provide, ref } from 'vue'
import * as THREE from 'three'
import Chessboard from '../components/Chessboard.vue'
import Pawn from '../components/Pawn.vue'
import Chessboard2D from '../components/Chessboard2D.vue'

// Create the scene here, in the parent component
const scene = new THREE.Scene()
// Provide it to all child components
provide('scene', scene)

// 1. State for view mode (3D or 2D)
const viewMode = ref<'3d' | '2d'>('3d')

// 2. State for label visibility (only in 3D mode)
const showLabels = ref(true)

function toggleViewMode() {
  viewMode.value = viewMode.value === '3d' ? '2d' : '3d'
}

function toggleLabels() {
  showLabels.value = !showLabels.value
}

// 3D Chess positions (for demonstration)
const chessPieces = ref([
  { position: 'e2', color: 'white', type: 'pawn' },
  { position: 'd7', color: 'black', type: 'pawn' }
])

// 2D Board event handlers
const handlePieceDrop = (source: string, target: string) => {
  console.log(`Piece moved from ${source} to ${target}`)
}

const handlePositionChange = (fen: string) => {
  console.log('Position changed:', fen)
}
</script>

<template>
  <main>
    <!-- View Mode Toggle Button -->
    <button @click="toggleViewMode" class="mode-toggle-button">
      {{ viewMode === '3d' ? 'Switch to 2D' : 'Switch to 3D' }} Mode
    </button>

    <!-- 3D Mode -->
    <div v-if="viewMode === '3d'" class="mode-container">
      <Chessboard :show-labels="showLabels" />
      <Pawn
        v-for="(piece, index) in chessPieces"
        :key="index"
        :position="piece.position"
        :color="piece.color"
      />
      <button @click="toggleLabels" class="settings-button">
        {{ showLabels ? 'Hide' : 'Show' }} Labels
      </button>
    </div>

    <!-- 2D Mode -->
    <div v-else class="mode-container">
      <Chessboard2D
        @piece-drop="handlePieceDrop"
        @position-change="handlePositionChange"
      />
    </div>
  </main>
</template>

<style scoped>
main {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.mode-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.mode-toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  font-family: Verdana, sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s, transform 0.1s;
  user-select: none;
}

.mode-toggle-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.mode-toggle-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.settings-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10; /* Ensure it's above the 3D canvas */
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  color: black;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
  font-family: Verdana, sans-serif;
  transition: background-color 0.2s;
}

.settings-button:hover {
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
