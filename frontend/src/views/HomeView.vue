<script setup lang="ts">
import { provide, ref } from 'vue'
import * as THREE from 'three'
import Chessboard from '../components/Chessboard.vue'
import Pawn from '../components/Pawn.vue'

// Create the scene here, in the parent component
const scene = new THREE.Scene()
// Provide it to all child components
provide('scene', scene)

// 1. State for label visibility, managed by the parent.
const showLabels = ref(true)

function toggleLabels() {
  showLabels.value = !showLabels.value
}
</script>

<template>
  <main>
    <!-- 2. Pass the state down as a prop -->
    <Chessboard :show-labels="showLabels" />
    <Pawn position="e2" color="white" />
    <Pawn position="d7" color="black" />

    <!-- 3. Add the settings button -->
    <button @click="toggleLabels" class="settings-button">
      {{ showLabels ? 'Hide' : 'Show' }} Labels
    </button>
  </main>
</template>

<style scoped>
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
}
</style>
