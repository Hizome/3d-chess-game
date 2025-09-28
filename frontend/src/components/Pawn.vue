<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

// 1. Define Props that the component accepts (e.g., from Chessboard.vue)
const props = defineProps({
  position: {
    type: String,
    required: true, // e.g., "e2"
  },
  color: {
    type: String,
    required: true, // "white" or "black"
  },
});

// 2. Inject the 'scene' object provided by a parent component
const scene = inject<THREE.Scene>('scene');

// Throw an error if the component is used outside of a provider
if (!scene) {
  throw new Error('Pawn component must be a child of a component that provides a scene.');
}

/**
 * Converts algebraic chess notation (e.g., "e2") into 3D coordinates
 * that match the chessboard's coordinate system.
 * @param pos The algebraic position string.
 * @returns An object with x and z coordinates.
 */
const getCoordsFromPosition = (pos: string): { x: number; z: number } => {
  const file = pos.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, ... h=7
  const rank = parseInt(pos.substring(1), 10) - 1;    // 1=0, 2=1, ... 8=7

  const boardSize = 8;
  // This logic mirrors the board creation in Chessboard.vue
  const x = file - boardSize / 2 + 0.5;
  const z = rank - boardSize / 2 + 0.5;
  
  return { x, z };
};

// 3. Create the 3D Object (Mesh) for the pawn
const pieceColor = props.color === 'white' ? 0xe0e0e0 : 0x333333;
const pawnGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 32);
const pawnMaterial = new THREE.MeshStandardMaterial({ color: pieceColor });
const pawnMesh = new THREE.Mesh(pawnGeometry, pawnMaterial);

// 4. Manage the object's lifecycle within the scene
onMounted(() => {
  const { x, z } = getCoordsFromPosition(props.position);
  // The board's top surface is at y=0.05. Lift the pawn by half its height
  // so its base rests perfectly on the board.
  pawnMesh.position.set(x, 0.6 / 2 + 0.05, z);
  scene.add(pawnMesh);
});

onUnmounted(() => {
  // Clean up the mesh from the scene when the component is destroyed
  scene.remove(pawnMesh);
  // Also dispose of geometry and material to free up GPU memory
  pawnGeometry.dispose();
  pawnMaterial.dispose();
});

// 5. Watch for prop changes to enable piece movement in the future
watch(() => props.position, (newPosition) => {
    const { x, z } = getCoordsFromPosition(newPosition);
    pawnMesh.position.set(x, 0.6 / 2 + 0.05, z);
});

</script>

<!-- This component is a "logical" or "renderless" component. -->
<!-- It renders a 3D object in a Three.js scene, not any HTML to the DOM. -->
