# 农业AI双场景前端Demo

基于 `Vite + React + TypeScript + Tailwind` 的农业 AI 作战看板前端项目，包含两个场景：

1. 真菌/细菌/病毒感染识别
2. 害虫种类、数量、分布检测

## 快速启动

```bash
npm install
npm run dev
```

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

## E2E 测试

首次执行 Playwright 需要先安装浏览器：

```bash
npx playwright install
npm run test:e2e
```

## 目录说明

- `src/components`：组件层（布局、场景、通用、图表、地图）
- `src/mocks`：Mock 工厂、数据选择器、MSW handlers
- `src/stores`：Zustand 状态管理
- `src/hooks`：业务 Hook（数据请求、时间轴回放）
- `docs/agri-ai-demo`：PRD、交互说明、Mock 字典、规范文档

## 备注

- 所有业务代码已按“中文注释 + 组件化 + 单文件不超过 300 行”执行。
- `public/mockServiceWorker.js` 为 MSW 自动生成文件。
