# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概览

本仓库是一个基于 **Vite 7 + React 19 + TypeScript 5 + Tailwind CSS 4** 的前端单页应用，用于展示农业 AI 多场景能力（病害识别、虫害识别、养分分析、杂草识别等）。

应用采用前后端分离架构：前端通过 **MSW (Mock Service Worker)** + 本地 mock 数据与“虚拟后端”交互，所有页面都基于这些模拟 API 构建真实业务流转和数据联动效果。

## 基本命令

使用 npm + `package-lock.json`，请统一使用 npm。

```bash
# 安装依赖
npm install

# 本地开发（Vite dev server）
npm run dev

# 构建生产包（先 tsc -b 再 vite build）
npm run build

# 预览构建结果
npm run preview

# 代码检查（ESLint flat config）
npm run lint

# 单元 / 集成测试（Vitest，CI 模式）
npm run test

# 单元 / 集成测试（Vitest，watch 模式）
npm run test:watch

# 端到端测试（Playwright）
# 首次运行前需要：npx playwright install
npm run test:e2e
```

### 运行单个测试文件

Vitest 已通过 `vitest.config.ts` 配置好，支持 `@` 路径别名：

```bash
# 运行指定测试文件（一次性）
npx vitest run src/pages/DashboardPage.test.tsx

# 运行指定测试文件（watch 模式）
npx vitest src/stores/dashboardStore.test.ts
```

所有前端测试均在 JSDOM 环境中运行，测试入口和 MSW 初始化位于 `src/test/setup.ts`。

## 目录与架构

### 顶层配置

- 构建与开发：`vite.config.ts`
- 单元测试：`vitest.config.ts`
- 端到端测试：`playwright.config.ts`
- TypeScript：`tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`
- Lint：`eslint.config.js`

路径别名：

```ts
// Vite / Vitest 均配置：
alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
```

请优先使用 `@/…` 导入，而非 `../../../` 这类相对路径。

### 源码结构（src）

只列出关键目录，详细内容可通过文件树自行探索。

- `src/main.tsx`
  - 应用入口，挂载 React 根节点。
- `src/app/`
  - 应用级组装与基础设施：
    - `App.tsx`：根组件，负责布局骨架和路由入口。
    - `router.ts`：路由配置（页面级路由）。
    - `providers/QueryProvider.tsx`：React Query Provider，统一数据获取层。
- `src/pages/`
  - 页面级组件，负责**场景组合与布局**，不承担复杂业务逻辑：
    - `DashboardPage.tsx`：主看板页。
    - `DataCenterPage.tsx`：数据中心页。
  - 页面只负责拼装 `layout` / `common` / `scene-*` 组件，将状态与请求逻辑下沉到 hooks 和 stores。
- `src/components/`
  - 可复用 UI 组件，按功能分组：
    - `layout/`：整体布局结构（Header、左右侧边栏、时间轴、地图/对比面板等）。
    - `common/`：通用组件，如 `PanelCard`、`KpiGrid`、`LoadingBlock`、`EmptyState`、`StatusBadge`、`SceneToggle`、`FilterPanel`、`ReportDrawer`、`SuggestionList`、`HotAreaList` 等。
    - `charts/`：图表卡片组件（柱状、折线、饼图等），封装统一样式和交互。
    - `map/`：地图相关组件（如 `AgriMap`）及样式配置。
    - `scene-*`：按业务场景划分的概览组件，例如：
      - `scene-disease/DiseaseOverview.tsx`
      - `scene-pest/PestOverview.tsx`
      - `scene-nutrient/NutrientOverview.tsx`
      - `scene-weed/WeedOverview.tsx`
- `src/stores/`
  - 全局状态管理，使用 **Zustand**：
    - `dashboardStore.ts`：仪表盘核心状态（场景、时间轴、选中对象、过滤条件等）。
    - 相应测试：`dashboardStore.test.ts`。
- `src/hooks/`
  - 自定义 Hooks，负责数据获取、派生状态和复杂交互：
    - `useDashboardData.ts`：仪表盘数据获取与组合，基于 React Query。
    - `usePlayback.ts`：时间轴/历史回放控制，将时间、地图和图表联动起来。
- `src/services/`
  - 请求与接口封装层：
    - `api.ts`：封装所有对“后端”的请求，实际由 MSW 拦截并返回 mock 数据。
- `src/mocks/`
  - MSW 配置与 mock 数据，是本项目的“虚拟后端”：
    - `browser.ts`、`server.ts`：MSW 初始化。
    - `handlers/`：按业务模块划分的 handler，例如 `dashboardHandlers.ts`、`missionHandlers.ts`、`detectionHandlers.ts`、`alertHandlers.ts`、`reportHandlers.ts`、`farmHandlers.ts`、`dataCenterHandlers.ts`。
    - `data/`：mock 数据集与选择器（`dataset.ts`、`dashboardSelectors.ts`、`querySelectors.ts`、`selectorUtils.ts`、`realImagePool.ts`、`snapshotStore.ts` 等）。
    - `factory/`：各种实体的工厂函数（`alertFactory.ts`、`detectionFactory.ts`、`farmFactory.ts`、`missionFactory.ts`、`reportFactory.ts`、`seed.ts`）。
  - **注意**：`public/mockServiceWorker.js` 为自动生成文件，请不要手工修改。
- `src/types/`
  - TypeScript 类型定义，约定前端与“后端”之间的数据契约：
    - `domain.ts`、`dataCenter.ts`、`api.ts`、`jsx-global.d.ts` 等。
- `src/test/setup.ts`
  - 测试环境初始化，包括 Testing Library 与 MSW。未被 MSW 处理的网络请求应当视为测试问题并修复。

### 文档与需求

- `README.md`
  - 项目简介、技术栈与基本使用方式。
- `docs/agri-ai-demo/`
  - `01-PRD.md`：需求文档（业务场景与目标）。
  - `02-交互说明.md`：交互设计与页面行为说明。
  - `03-Mock数据字典.md`：mock 数据字段定义与含义。
  - `04-组件拆分与注释规范.md`：前端组件拆分规范与注释要求，是实现/修改组件时的重要参考。
- `农业AI应用案例汇总.md`
  - 更上层的应用案例汇总与业务背景。

在调整业务逻辑、mock 数据或交互行为时，请优先查阅上述文档，确保实现与 PRD/交互说明保持一致。

## 测试与质量保证

### Vitest（单元 / 集成）

- 配置文件：`vitest.config.ts`
- 关键设置：
  - `environment: 'jsdom'`
  - `globals: true`（直接使用 `describe` / `it` 等全局 API）
  - `setupFiles: ['./src/test/setup.ts']`
  - `alias: { '@': './src' }`
  - 覆盖率：使用 `v8`，输出到 `./coverage`（`text` + `html` 报告）。
- 测试文件位置：
  - `src/**/*.test.ts`
  - `src/**/*.test.tsx`

编写新功能时，请在同目录下新增对应的 `*.test.ts[x]` 文件，并使用 React Testing Library + MSW 进行集成级别的校验。

### Playwright（端到端）

- 配置文件：`playwright.config.ts`
- 关键设置：
  - `testDir: './tests/e2e'`
  - `webServer`：自动启动 `npm run dev -- --host 127.0.0.1 --port 4173`，并等待可用。
  - `use.baseURL: 'http://127.0.0.1:4173'`
  - 默认仅配置 `chromium`（桌面 Chrome）项目。

E2E 测试主要用于验证关键业务流转（例如场景切换、时间轴回放、地图联动等）是否按 PRD 工作。

### MSW 与 mock 策略

- 客户端所有“后端请求”均应通过 `src/services/api.ts` 与 MSW mock 层交互。
- MSW handler 按业务模块拆分；新增接口时应同时更新：
  - 类型定义（`src/types`）
  - mock 数据与 factory（`src/mocks/data`、`src/mocks/factory`）
  - 对应 handler（`src/mocks/handlers`）
  - 相关单元/集成测试
- 测试环境中若出现未被 MSW 捕获的请求，应视为用例不完整或接口未对齐，需要补齐 handler 或修正请求路径。

## 代码风格与约定

以下约定主要来自仓库文档和现有实现风格，用于指导后续改动保持一致性。

### TypeScript / React 风格

- 使用函数式组件与 Hooks，避免 class 组件。
- 统一使用：
  - 2 空格缩进
  - 单引号
  - 通常不写分号（遵循现有代码风格）。
- 命名约定：
  - 组件：`PascalCase`（例如 `DiseaseOverview`、`MapPanel`）。
  - Hooks：`useXxx` 前缀（例如 `useDashboardData`、`usePlayback`）。
  - Zustand store：`xxxStore.ts`，导出 `useXxxStore` hook。
  - 工具函数与普通变量：`camelCase`，语义清晰。

### 组件拆分与职责

- 页面（`src/pages`）只做**组装**与**布局**：
  - 将布局组件（Header/Sidebar/Timeline/Map 等）、场景组件、图表组件组合在一起。
  - 不在页面组件中堆积复杂状态机或数据处理逻辑。
- 业务逻辑与状态：
  - 跨组件共享状态优先放在 `src/stores`（Zustand）。
  - 复杂数据获取、接口拼装和派生 state 放到 `src/hooks` 中，通过自定义 hooks 暴露给页面或 UI 组件。
- 公共 UI 结构抽到 `src/components/common` / `charts` 等目录，避免在业务组件中重复造轮子。

### Tailwind 与样式

- 主体样式通过 Tailwind 原子类完成，少量复杂情况可配合自定义类或样式文件。
- `className` 推荐按以下顺序书写以提升可读性：
  1. 布局（如 `flex`, `grid`, `items-center`, `justify-between`）
  2. 盒模型（如 `p-4`, `px-6`, `gap-2`, `rounded-lg`, `border`）
  3. 字体（如 `text-sm`, `font-medium`）
  4. 颜色（如 `bg-slate-900`, `text-slate-100`, `border-slate-700`）
  5. 状态 / 交互（如 `hover:bg-slate-800`, `disabled:opacity-50`）
- 当某个组件的 Tailwind 类过长且复用频繁时，优先通过拆分子组件或提取复用 UI 组件解决，而不是任由单个 JSX 块无限膨胀。

### 注释与文档习惯

（详细规范见 `docs/agri-ai-demo/04-组件拆分与注释规范.md`）

- 注释统一使用中文，重点解释“为什么这样做”，而非翻译代码字面含义。
- 对于下列内容，建议在顶部或导出处写明简要说明：
  - 页面组件与核心布局组件
  - 重要的 hooks（例如管理时间轴回放、复杂筛选逻辑等）
  - Zustand store（说明存了哪些核心状态、预期被哪些页面/组件使用）
  - 关键 mock 数据结构与 selector 工具
- 控制单文件体积，尽量在 300 行以内；如已接近上限，应考虑按职责拆分文件。

## 提交与 PR 指南（简要）

- 仓库历史中存在类似 Conventional Commits 的提交风格，例如：
  - `docs(readme): 更新农业AI双场景前端Demo项目文档`
- 建议后续提交尽量遵循该风格：`type(scope): message`，其中 message 可使用中文。
- 发起 PR 前建议至少本地执行：
  - `npm run lint`
  - `npm run test`
  - 如改动影响端到端流程，最好再跑一次：`npm run test:e2e`
- 若改动包含以下内容，请在 PR 描述中单独说明：
  - 调整 mock 数据 / factory / handler
  - 修改 PRD / 交互说明 / 数据字典
  - 变更公共组件、布局骨架或全局状态结构

遵循以上约定可以帮助未来在本仓库工作的 Claude Code 实例更快理解项目结构，避免破坏既有交互和数据约束。