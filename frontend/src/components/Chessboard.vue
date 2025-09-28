<template>
  <div ref="container"></div>
</template>

<style scoped>
div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, inject, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default defineComponent({
  name: 'Chessboard',
  props: {
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const container = ref<HTMLDivElement | null>(null);
    const scene = inject<THREE.Scene>('scene');
    if (!scene) {
      throw new Error('Chessboard must be a child of a component that provides a scene.');
    }

    // --- START: Reactive Label Management ---
    const labels: CSS2DObject[] = [];

    const createLabel = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      div.style.color = '#000000';
      div.style.fontFamily = 'Verdana, sans-serif';
      div.style.fontSize = '14px';
      div.style.fontWeight = 'bold';
      return new CSS2DObject(div);
    };

    watch(() => props.showLabels, (isVisible) => {
      if (isVisible) {
        const boardSize = 8;
        // Add letters (a-h)
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < files.length; i++) {
          const label1 = createLabel(files[i]);
          label1.position.set(i - boardSize / 2 + 0.5, 0, -boardSize / 2 - 0.5);
          scene.add(label1);
          labels.push(label1);

          const label2 = createLabel(files[i]);
          label2.position.set(i - boardSize / 2 + 0.5, 0, boardSize / 2 + 0.5);
          scene.add(label2);
          labels.push(label2);
        }

        // Add numbers (1-8)
        for (let i = 0; i < boardSize; i++) {
          const label1 = createLabel((i + 1).toString());
          label1.position.set(-boardSize / 2 - 0.5, 0, i - boardSize / 2 + 0.5);
          scene.add(label1);
          labels.push(label1);

          const label2 = createLabel((i + 1).toString());
          label2.position.set(boardSize / 2 + 0.5, 0, i - boardSize / 2 + 0.5);
          scene.add(label2);
          labels.push(label2);
        }
      } else {
        // Remove all labels
        labels.forEach(label => scene.remove(label));
        labels.length = 0; // Clear the array
      }
    }, { immediate: true }); // Run on mount
    // --- END: Reactive Label Management ---

    onMounted(() => {
      if (!container.value) return;

      const width = container.value.clientWidth;
      const height = container.value.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      container.value.appendChild(renderer.domElement);

      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(width, height);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      labelRenderer.domElement.style.pointerEvents = 'none';
      container.value.appendChild(labelRenderer.domElement);

      scene.background = new THREE.Color(0xcccccc);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 8, 8);
      camera.lookAt(scene.position);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(-5, 10, 5);
      scene.add(directionalLight);

      const boardSize = 8;
      const board = new THREE.Group();
      const geometry = new THREE.BoxGeometry(1, 0.1, 1);

      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          const color = (i + j) % 2 === 0 ? 0xffffff : 0x444444;
          const material = new THREE.MeshStandardMaterial({ color });
          const square = new THREE.Mesh(geometry, material);
          square.position.set(i - boardSize / 2 + 0.5, 0, j - boardSize / 2 + 0.5);
          board.add(square);
        }
      }
      scene.add(board);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (container.value) {
          const newWidth = container.value.clientWidth;
          const newHeight = container.value.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
          labelRenderer.setSize(newWidth, newHeight);
        }
      };
      window.addEventListener('resize', handleResize);

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
      });
    });

    return {
      container,
    };
  },
});
</script>
