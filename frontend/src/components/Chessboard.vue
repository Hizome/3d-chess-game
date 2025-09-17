<template>
  <div ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  name: 'Chessboard',
  setup() {
    const container = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      if (!container.value) return;

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // Renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.value.appendChild(renderer.domElement);

      // Board
      const boardSize = 8;
      const squareSize = 1;
      const board = new THREE.Group();

      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          const color = (i + j) % 2 === 0 ? 0xffffff : 0x000000;
          const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
          const material = new THREE.MeshBasicMaterial({ color });
          const square = new THREE.Mesh(geometry, material);
          square.position.set(i - boardSize / 2 + 0.5, 0, j - boardSize / 2 + 0.5);
          board.add(square);
        }
      }
      scene.add(board);
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      animate();
    });

    return {
      container,
    };
  },
});
</script>
