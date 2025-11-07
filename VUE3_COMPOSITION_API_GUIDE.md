# Vue 3 组合式API vs 选项式API 完整指南

## 目录
- [概述](#概述)
- [核心区别](#核心区别)
- [代码对比](#代码对比)
- [项目实例分析](#项目实例分析)
- [优缺点对比](#优缺点对比)
- [选择指南](#选择指南)
- [最佳实践](#最佳实践)
- [总结](#总结)

---

## 概述

**Vue 3 Composition API（组合式API）** 是Vue 3引入的全新API设计，旨在提供更灵活的逻辑组合和复用方式。与Vue 2的**Options API（选项式API）**相比，组合式API更适合复杂组件和TypeScript项目。

本指南基于3D国际象棋游戏项目（`/home/harry/harry/3d-chess-game`）的实际代码进行讲解。

---

## 核心区别

### 📊 快速对比表

| 特性 | 选项式API (Vue 2) | 组合式API (Vue 3) |
|------|------------------|------------------|
| **适用版本** | Vue 2.x | Vue 3.x |
| **代码组织** | 按选项类型组织（data/methods/computed） | 按逻辑功能组织 |
| **逻辑复用** | Mixins（有命名冲突风险） | Composition函数（无冲突） |
| **TypeScript支持** | 有限 | 优秀 |
| **学习曲线** | 平缓 | 较陡峭 |
| **代码可读性** | 简单组件清晰，复杂组件分散 | 复杂组件逻辑集中 |
| **Tree-shaking** | 困难 | 优秀 |

### 🏗️ 架构差异

#### 选项式API - 基于"选项"
```typescript
export default {
  // 数据
  data() {
    return {
      count: 0
    }
  },
  // 方法
  methods: {
    increment() {
      this.count++
    }
  },
  // 计算属性
  computed: {
    double() {
      return this.count * 2
    }
  },
  // 生命周期
  mounted() {
    console.log('mounted')
  }
}
```

#### 组合式API - 基于"函数"
```typescript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 1️⃣ 所有逻辑在setup函数中
    const count = ref(0)

    const increment = () => {
      count.value++
    }

    const double = computed(() => count.value * 2)

    onMounted(() => {
      console.log('mounted')
    })

    // 2️⃣ 返回模板需要的数据
    return {
      count,
      increment,
      double
    }
  }
}
```

---

## 代码对比

### 1. 基本响应式数据

#### ❌ 选项式API
```typescript
data() {
  return {
    // 类型推断较弱
    count: 0,
    message: 'Hello',
    isVisible: true,
    items: []
  }
}
```

#### ✅ 组合式API
```typescript
import { ref, Ref } from 'vue'

const count = ref<number>(0)
const message = ref<string>('Hello')
const isVisible = ref<boolean>(true)
const items = ref<string[]>([])

// 或者使用接口定义
interface State {
  count: number
  message: string
  isVisible: boolean
  items: string[]
}

const state: State = {
  count: 0,
  message: 'Hello',
  isVisible: true,
  items: []
}
```

### 2. 方法和函数

#### ❌ 选项式API
```typescript
methods: {
  increment() {
    this.count++
  },
  decrement() {
    this.count--
  },
  reset() {
    this.count = 0
  }
}
```

#### ✅ 组合式API
```typescript
const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const reset = () => {
  count.value = 0
}
```

### 3. 计算属性

#### ❌ 选项式API
```typescript
computed: {
  double() {
    return this.count * 2
  },
  isEven() {
    return this.count % 2 === 0
  }
}
```

#### ✅ 组合式API
```typescript
import { computed } from 'vue'

const double = computed(() => count.value * 2)

const isEven = computed(() => count.value % 2 === 0)
```

### 4. 监听器

#### ❌ 选项式API
```typescript
watch: {
  count(newVal, oldVal) {
    console.log(`Count changed from ${oldVal} to ${newVal}`)
  },
  immediate: true
}
```

#### ✅ 组合式API
```typescript
import { watch } from 'vue'

watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`)
}, { immediate: true })

// 监听多个数据
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log('Multiple watcher triggered')
})
```

### 5. 生命周期钩子

#### ❌ 选项式API
```typescript
export default {
  mounted() {
    console.log('Component mounted')
  },
  updated() {
    console.log('Component updated')
  },
  unmounted() {
    console.log('Component unmounted')
  }
}
```

#### ✅ 组合式API
```typescript
import {
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount
} from 'vue'

onBeforeMount(() => {
  console.log('Before mount')
})

onMounted(() => {
  console.log('Component mounted')
})

onUpdated(() => {
  console.log('Component updated')
})

onUnmounted(() => {
  console.log('Component unmounted')
})
```

### 6. 组件通信（Props和Emit）

#### ❌ 选项式API
```typescript
export default {
  props: {
    title: String,
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update', 'change'],
  methods: {
    handleClick() {
      this.$emit('update')
    }
  }
}
```

#### ✅ 组合式API
```typescript
interface Props {
  title?: string
  isVisible?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: []
  change: [value: string]
}>()

const handleClick = () => {
  emit('update')
  emit('change', 'new value')
}
```

---

## 项目实例分析

### 实例1：Chessboard.vue - 3D场景管理

**项目位置**: `frontend/src/components/Chessboard.vue:29`

该项目使用`defineComponent` + `setup`函数的组合式API：

```typescript
export default defineComponent({
  name: 'Chessboard',
  props: {
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    // ✅ 响应式引用
    const container = ref<HTMLDivElement | null>(null)
    const scene = inject<THREE.Scene>('scene')

    // ✅ 响应式标签管理
    const labels: CSS2DObject[] = []

    // ✅ 工厂函数
    const createLabel = (text: string) => {
      const div = document.createElement('div')
      div.textContent = text
      div.style.color = '#000000'
      return new CSS2DObject(div)
    }

    // ✅ 监听器
    watch(() => props.showLabels, (isVisible) => {
      if (isVisible) {
        // 添加标签逻辑
        // ...
      } else {
        // 移除标签逻辑
        // ...
      }
    }, { immediate: true })

    // ✅ 生命周期
    onMounted(() => {
      // 3D场景初始化
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      // ...
    })

    onUnmounted(() => {
      // 清理资源
      window.removeEventListener('resize', handleResize)
    })

    // ✅ 返回模板需要的数据
    return {
      container,
    }
  },
})
```

**为什么选择组合式API？**
- ✅ 复杂的3D场景初始化逻辑可以集中管理
- ✅ TypeScript类型支持更好
- ✅ 可以提取`useLabels`等组合式函数复用
- ✅ 逻辑与UI分离，代码更清晰

### 实例2：HomeView.vue - 场景根组件

**项目位置**: `frontend/src/views/HomeView.vue:1`

该项目使用`<script setup>`语法糖：

```vue
<script setup lang="ts">
import { provide, ref } from 'vue'

// ✅ 所有变量直接声明，无需return
const scene = new THREE.Scene()
provide('scene', scene)

// ✅ 响应式数据
const showLabels = ref(true)

// ✅ 方法直接声明
function toggleLabels() {
  showLabels.value = !showLabels.value
}
</script>

<template>
  <main>
    <!-- 使用数据 -->
    <Chessboard :show-labels="showLabels" />
    <Pawn position="e2" color="white" />

    <!-- 使用方法 -->
    <button @click="toggleLabels">
      {{ showLabels ? 'Hide' : 'Show' }} Labels
    </button>
  </main>
</template>
```

**`<script setup>`的优势：**
- ✅ 更简洁的语法
- ✅ 无需`return`语句
- ✅ 自动解包ref
- ✅ 更好的IDE支持
- ✅ 编译时优化

### 实例3：Pawn.vue - 3D棋子组件

**项目位置**: `frontend/src/components/Pawn.vue`

可优化的组合式函数提取：

```typescript
// composables/useChessPiece.ts
import { ref, onUnmounted } from 'vue'
import * as THREE from 'three'

interface ChessPieceOptions {
  color: 'white' | 'black'
  position: string
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
}

export function useChessPiece(scene: THREE.Scene, options: ChessPieceOptions) {
  const pieceRef = ref<THREE.Mesh>()

  // 坐标转换函数
  const getCoordsFromPosition = (pos: string) => {
    const file = pos.charCodeAt(0) - 'a'.charCodeAt(0)
    const rank = parseInt(pos.substring(1), 10) - 1
    return { x: file, z: rank }
  }

  // 移动函数
  const moveTo = (position: string) => {
    if (pieceRef.value) {
      const coords = getCoordsFromPosition(position)
      pieceRef.value.position.set(coords.x, 0, coords.z)
    }
  }

  // 清理函数
  onUnmounted(() => {
    if (pieceRef.value) {
      scene.remove(pieceRef.value)
    }
  })

  return {
    pieceRef,
    moveTo,
    getCoordsFromPosition
  }
}
```

在组件中使用：
```vue
<script setup lang="ts">
const { pieceRef, moveTo } = useChessPiece(scene, {
  color: 'white',
  position: 'e2',
  type: 'pawn'
})
</script>
```

---

## 优缺点对比

### 选项式API

#### ✅ 优点
- **学习曲线平缓**：按数据类型组织，直观易懂
- **结构清晰**：简单组件的逻辑一目了然
- **团队接受度高**：Vue 2用户熟悉
- **初学者友好**：降低Vue 3入门门槛

#### ❌ 缺点
- **逻辑分散**：复杂组件的同一功能代码分散在不同选项中
- **命名冲突**：使用mixins时容易产生命名冲突
- **TypeScript支持有限**：类型推断不够精确
- **难以复用**：逻辑复用需要mixins或HOC
- **Tree-shaking差**：所有选项都会被包含在最终包中

### 组合式API

#### ✅ 优点
- **逻辑聚合**：相关逻辑紧密组织在一起
- **类型安全**：TypeScript支持完美
- **逻辑复用**：通过Composition函数，无命名冲突
- **Tree-shaking优化**：未使用的函数不会被打包
- **灵活组合**：可以根据需要组合不同功能
- **性能更好**：编译时优化更多

#### ❌ 缺点
- **学习成本高**：需要理解响应式系统
- **代码组织**：初学者可能不知道如何组织代码
- **调试困难**：函数调用栈可能较深

---

## 选择指南

### 何时使用选项式API

#### ✅ 推荐场景
1. **简单组件**
   - 纯展示组件
   - 数据和逻辑简单
   - 不需要复用逻辑

2. **Vue 2项目迁移**
   - 渐进式迁移
   - 保持现有代码结构

3. **团队熟悉Vue 2**
   - 快速上手
   - 降低培训成本

4. **学习Vue 3**
   - 从选项式开始
   - 逐步过渡到组合式

#### 📝 示例
```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World'
    }
  },
  methods: {
    handleClick() {
      alert('Clicked!')
    }
  }
}
</script>
```

### 何时使用组合式API

#### ✅ 推荐场景
1. **复杂组件**
   - 多个相关功能模块
   - 大量业务逻辑

2. **TypeScript项目**
   - 需要类型安全
   - 团队使用TS

3. **逻辑复用**
   - 多个组件需要相同逻辑
   - 需要抽取为hooks

4. **性能优化**
   - 大型应用
   - 需要Tree-shaking

5. **本项目**（3D国际象棋游戏）
   - 3D场景管理复杂
   - 棋子逻辑需要复用

#### 📝 示例
```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello World')

const handleClick = () => {
  alert('Clicked!')
}
</script>

<template>
  <div @click="handleClick">{{ message }}</div>
</template>
```

---

## 最佳实践

### 1. `<script setup>` + TypeScript 推荐写法

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const count = ref(0)
const message = ref('Hello')

// 计算属性
const double = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('Mounted')
})

// Props
interface Props {
  title?: string
}

defineProps<Props>()

// Emits
interface Emits {
  update: [value: number]
}

const emit = defineEmits<Emits>()

const handleUpdate = () => {
  emit('update', count.value)
}
</script>
```

### 2. 组合式函数命名规范

```typescript
// ✅ use 开头
function useCounter() { /* ... */ }
function useFetchData() { /* ... */ }
function useChessLogic() { /* ... */ }

// ✅ 描述性名称
function useLabelsManagement() { /* ... */ }
function use3DSceneSetup() { /* ... */ }
function useGameState() { /* ... */ }
```

### 3. 组合式函数结构

```typescript
export function useFeature() {
  // 1️⃣ 响应式数据
  const state = ref(/* ... */)

  // 2️⃣ 纯函数和计算
  const transform = (data: Type) => { /* ... */ }
  const computedValue = computed(() => { /* ... */ })

  // 3️⃣ 方法
  const action = () => { /* ... */ }

  // 4️⃣ 生命周期
  onMounted(() => { /* ... */ })
  onUnmounted(() => { /* ... */ })

  // 5️⃣ 监听器
  watch(state, (newVal) => { /* ... */ })

  // 6️⃣ 返回需要暴露的数据
  return {
    state,
    action,
    computedValue
  }
}
```

### 4. 项目中的实际应用

#### ✅ 提取Chessboard的标签管理

```typescript
// composables/useLabels.ts
import { ref } from 'vue'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export function useLabels(scene: THREE.Scene) {
  const labels = ref<CSS2DObject[]>([])

  const createLabel = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#000000'
    return new CSS2DObject(div)
  }

  const addLabels = () => {
    // 添加标签逻辑
    // ...
  }

  const removeLabels = () => {
    // 移除标签逻辑
    // ...
  }

  const toggleLabels = (show: boolean) => {
    if (show) {
      addLabels()
    } else {
      removeLabels()
    }
  }

  return {
    labels,
    createLabel,
    toggleLabels
  }
}
```

#### ✅ 提取Pawn的棋子逻辑

```typescript
// composables/useChessPiece.ts
import { ref } from 'vue'

interface Position {
  x: number
  z: number
}

export function useChessPiece() {
  const pieceRef = ref<THREE.Mesh>()

  const getCoordsFromPosition = (pos: string): Position => {
    const file = pos.charCodeAt(0) - 'a'.charCodeAt(0)
    const rank = parseInt(pos.substring(1), 10) - 1
    return { x: file, z: rank }
  }

  const isValidMove = (from: string, to: string): boolean => {
    // 验证移动逻辑
    // 根据棋子类型实现不同规则
    return true
  }

  const moveTo = (position: string) => {
    if (pieceRef.value) {
      const coords = getCoordsFromPosition(position)
      pieceRef.value.position.set(coords.x, 0, coords.z)
    }
  }

  return {
    pieceRef,
    getCoordsFromPosition,
    isValidMove,
    moveTo
  }
}
```

### 5. 错误处理和边界情况

```typescript
export function useChessLogic() {
  const state = ref<GameState>({
    board: [],
    currentPlayer: 'white',
    gameStatus: 'playing'
  })

  const error = ref<string | null>(null)

  const makeMove = (move: Move) => {
    try {
      error.value = null

      // 验证移动
      if (!isValidMove(move)) {
        throw new Error('Invalid move')
      }

      // 执行移动
      executeMove(move)

    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  return {
    state,
    error,
    makeMove
  }
}
```

---

## 常见问题解答

### Q1: 什么时候使用 `ref`，什么时候使用 `reactive`？

**A: 选择指南**

```typescript
// ✅ 使用 ref
const count = ref(0)                    // 基础类型
const message = ref('Hello')            // 字符串
const isVisible = ref(true)             // 布尔值
const items = ref([])                   // 数组
const user = ref(null)                  // 可能为null的对象

// ✅ 使用 reactive
const state = reactive({                // 对象
  count: 0,
  message: 'Hello',
  isVisible: true,
  items: []
})

// ✅ 推荐：ref + 对象（组合式API推荐）
const state = ref({
  count: 0,
  message: 'Hello',
  isVisible: true,
  items: []
})
```

**区别：**
- `ref`: 包装任何值为响应式，访问需要 `.value`
- `reactive`: 直接将对象变为响应式，直接访问属性

### Q2: `<script setup>` vs `setup()` 函数？

**A: 推荐使用 `<script setup>`**

```vue
<!-- ✅ 推荐：<script setup> -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>{{ count }}</div>
</template>
```

```vue
<!-- ❌ 复杂且冗余：setup() -->
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    return {
      count
    }
  }
})
</script>
```

**`<script setup>`优势：**
- 语法更简洁
- 无需`return`
- 自动解包ref
- 更好的编译优化
- 更好的IDE支持

### Q3: 如何在组合式API中获取组件实例？

**A: 使用 `ref` + 模板引用**

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'

// 模板引用
const myComponent = ref<InstanceType<typeof MyComponent> | null>(null)

const focusInput = async () => {
  await nextTick()
  myComponent.value?.focus()
}
</script>

<template>
  <MyComponent ref="myComponent" />
</template>
```

### Q4: 如何调试组合式API？

**A: 使用开发工具**

```typescript
export function useDebug() {
  const state = ref(0)

  // 1️⃣ 使用 watch 调试
  watch(state, (newVal) => {
    console.log('State changed:', newVal)
  })

  // 2️⃣ 使用 computed 调试
  const stateDebug = computed(() => {
    console.log('Computed recalculated')
    return state.value * 2
  })

  // 3️⃣ 使用 Vue DevTools
  // 安装 Vue DevTools 浏览器扩展
  // 可以查看 ref 的变化和调用栈
}
```

---

## 总结

### 🎯 核心要点

1. **组合式API是Vue 3的未来**
   - 更好的TypeScript支持
   - 更灵活的逻辑复用
   - 更优的性能

2. **本项目（3D国际象棋游戏）非常适合使用组合式API**
   - 复杂的3D场景管理
   - 需要提取棋子逻辑复用
   - TypeScript项目

3. **建议**
   - 新项目默认使用组合式API + `<script setup>`
   - 简单组件可以继续使用选项式API
   - 渐进式迁移，无需一次性改造

### 📚 学习路径

1. **基础阶段**：理解响应式系统（ref/reactive/computed/watch）
2. **进阶阶段**：学习`<script setup>`语法
3. **高级阶段**：提取组合式函数，实现逻辑复用
4. **专家阶段**：TypeScript高级类型、错误处理、性能优化

### 🚀 项目建议

针对您的3D国际象棋游戏项目：

1. **继续使用组合式API**（已完成）
2. **提取以下组合式函数**：
   - `useLabels` - 标签管理
   - `useChessPiece` - 棋子逻辑
   - `use3DScene` - 3D场景管理
   - `useGameState` - 游戏状态管理
3. **添加TypeScript接口**：
   - `ChessPiece`
   - `GameState`
   - `Move`
4. **实现完整功能**：
   - 所有棋子类型
   - 移动规则验证
   - 特殊规则（王车易位、吃过路兵等）

### 📖 更多资源

- [Vue 3 官方文档 - 组合式API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 RFC - 组合式API](https://composition-api.vuejs.org/)
- [Vue 3 + TypeScript 指南](https://cn.vuejs.org/guide/typescript/overview.html)

---

**文档作者**: Claude Code (AI Assistant)
**创建日期**: 2025-11-07
**项目位置**: `/home/harry/harry/3d-chess-game`
**基于代码**: 3D国际象棋游戏项目的实际实现
