# Vue 3 vs React Hooks: 通过 3D 棋盘实例深入对比

## 摘要

本文通过将一个功能复杂的 Vue 3 组件 (`Chessboard.vue`) “翻译”成等效的 React 组件 (`Chessboard.jsx`)，来深入剖析 Vue 3 (组合式 API) 和 React (Hooks) 在现代前端开发中的核心异同点。这个实例非常典型，因为它涉及到 DOM 操作、生命周期管理、依赖注入和第三方库集成，是检验框架能力的绝佳场景。

## 一、核心概念对比：不同的心智模型

尽管最终目标一致，但 Vue 和 React 建立在不尽相同的心智模型之上。

| 核心概念 | Vue 3 (组合式 API) | React (Hooks) | 分析与差异 |
| :--- | :--- | :--- | :--- |
| **响应式系统** | **可变的响应式对象** | **不可变状态 (Immutability)** | **[哲学差异]** 这是两者最根本的区别。Vue 通过 `ref` 或 `reactive` 创建可直接修改的对象，框架在底层追踪变化。React 则推崇创建新状态替换旧状态 (`setState(newState)`)，函数组件在每次状态变更后会“重新执行”。 |
| **模板与视图** | **HTML 模板 + SFC** | **JSX (JavaScript XML)** | **[哲学差异]** Vue 遵循 Web 的经典分离原则 (HTML/CSS/JS)，`<template>` 语法更接近原生 HTML。React 则将 HTML 结构通过 JSX 直接嵌入 JavaScript，实现了“All in JS”的组件化。 |
| **生命周期** | **目的明确的钩子** | **统一的副作用钩子** | **[实现差异]** Vue 提供 `onMounted`, `onUnmounted` 等语义清晰的钩子。React 则用一个强大的 `useEffect` 来统一处理组件挂载、更新和卸载的副作用，通过依赖数组控制行为。 |
| **依赖注入** | **Provide / Inject** | **Context API** | **[实现差异]** 两者都用于跨层级组件通信。Vue 的 `provide/inject` API 更轻量、更直接。React 的 `Context` 功能更全面，但写法稍显繁琐。 |

---

## 二、代码实现对比：以 `Chessboard` 组件为例

下面我们逐一对比实现同一功能时，两者在代码组织上的具体差异。

### 1. 组件结构与模板

**Vue 3: 单文件组件 (SFC)**
```vue
<!-- Chessboard.vue -->
<template>
  <div ref="container" class="chessboard-container"></div>
</template>

<script setup>
  // ... JavaScript/TypeScript Logic ...
</script>

<style scoped>
  .chessboard-container {
    width: 100vw;
    height: 100vh;
    /* ... */
  }
</style>
```
- **特点**: 结构、逻辑、样式三者封装在同一文件，但清晰分离。`<template>` 语法非常接近原生 HTML。

**React: JSX 函数组件**
```jsx
// Chessboard.jsx
import React from 'react';
import './Chessboard.css'; // 样式通常是独立文件

export default function Chessboard() {
  // ... JavaScript Logic ...

  return (
    <div 
      ref={mountRef} 
      className="chessboard-container"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
```
- **特点**: 视图 (JSX) 和逻辑 (JS) 高度耦合，写在同一个函数体内。样式通常通过导入 CSS 文件或使用 CSS-in-JS 方案来管理。

### 2. 获取 DOM 元素引用

两者都提供了获取底层 DOM 节点引用的能力，这对于集成非框架管理的库（如 Three.js）至关重要。

- **Vue 3**: 使用 `ref()`
  ```javascript
  const container = ref(null);
  // <template> 中: <div ref="container"></div>
  ```
- **React**: 使用 `useRef()`
  ```javascript
  const mountRef = useRef(null);
  // JSX 中: <div ref={mountRef} />
  ```
- **对比**: 用法和心智模型几乎完全相同，是两者 API 设计上最相似的功能之一。

### 3. 生命周期管理 (挂载与卸载)

这是两者差异最明显的领域。我们的棋盘组件需要在挂载后初始化 Three.js 场景，并在卸载时进行清理。

- **Vue 3**: `onMounted` 和 `onUnmounted`
  ```javascript
  import { onMounted, onUnmounted } from 'vue';

  onMounted(() => {
    // 初始化 Three.js 场景...
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    // 清理工作...
    window.removeEventListener('resize', handleResize);
  });
  ```
  - **特点**: 语义清晰，职责单一。`onMounted` 负责初始化，`onUnmounted` 负责清理，逻辑分离。

- **React**: `useEffect`
  ```javascript
  import { useEffect } from 'react';

  useEffect(() => {
    // 初始化 Three.js 场景...
    window.addEventListener('resize', handleResize);

    // 返回一个“清理函数”，它会在组件卸载时被调用
    return () => {
      // 清理工作...
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 空依赖数组 `[]` 意味着这个 effect 只在挂载时运行一次
  ```
  - **特点**: 功能聚合。初始化和清理的逻辑被放在了同一个 `useEffect` 内部。这种设计哲学鼓励将“副作用的创建和销毁”放在一起，有助于避免因忘记清理而导致的内存泄漏。

### 4. 依赖注入 (共享 `scene` 对象)

我们的 `Chessboard` 和 `Pawn` 组件都需要访问由父组件 `HomeView` 创建的同一个 `THREE.Scene` 实例。

- **Vue 3**: `provide` 和 `inject`
  ```javascript
  // HomeView.vue
  import { provide } from 'vue';
  const scene = new THREE.Scene();
  provide('scene', scene);

  // Chessboard.vue
  import { inject } from 'vue';
  const scene = inject('scene');
  ```
  - **特点**: API 非常轻量和直接，通过字符串键值对进行注入。

- **React**: `Context` API
  ```jsx
  // HomeView.jsx
  import { createContext } from 'react';
  export const SceneContext = createContext(null);
  const scene = new THREE.Scene();
  // ...
  return (
    <SceneContext.Provider value={scene}>
      <Chessboard />
    </SceneContext.Provider>
  );

  // Chessboard.jsx
  import { useContext } from 'react';
  import { SceneContext } from './HomeView.jsx';
  const scene = useContext(SceneContext);
  ```
  - **特点**: 写法更结构化，需要先创建 `Context` 对象，然后通过 `Provider` 组件包裹子组件来提供值。虽然稍显繁琐，但与 JSX 的结构融合得很好，并且提供了更强的类型支持。

---

## 三、总结与哲学思考

通过 `Chessboard` 这个实例，我们可以清晰地看到 Vue 3 和 React 的设计取舍：

- **Vue 3：渐进式与开发者友好**
  - Vue 的设计更倾向于降低开发者的心智负担。它的 API（如 `onMounted`）更符合直觉，其模板语法也让从传统 Web 开发过渡来的开发者倍感亲切。它在提供强大功能的同时，努力保持 API 的简洁和语义化。

- **React：纯粹的 JavaScript 函数式思维**
  - React 更倾向于用纯粹的 JavaScript 和函数式编程思想来构建 UI。`useEffect` 就是这种思想的极致体现，它不是一个简单的生命周期钩子，而是一个用来描述“状态与 UI 外部世界同步”这一过程的通用工具。这种高度抽象虽然学习曲线更陡峭，但在处理复杂的、相互关联的副作用时，能提供更强的逻辑聚合能力。

最终，两者都是极其优秀、成熟的框架，都能用来构建任何复杂的应用。选择哪个往往取决于团队的技术背景、项目需求以及对不同编程范式的偏好。
