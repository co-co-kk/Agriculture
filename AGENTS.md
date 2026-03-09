# Repository Guidelines
# 文件加密
由于文件加密，你只能通过 cat、find、ls 等 bash 命令来查看文件详细内容，修改文件也使用 touch 命令或者 python3 脚本，nl/sed 在这个仓库会读到加密体（%TSD-Header-###%），但 cat 与 rg -n 仍能拿到可读内容。

## Project Structure & Module Organization
This repository is a Vite + React 19 + TypeScript demo for an agriculture AI dashboard. Keep page assembly in `src/pages`, app wiring in `src/app`, and reusable UI in `src/components`. Component groups are already split by concern: `layout`, `common`, `charts`, `map`, `scene-disease`, and `scene-pest`. Put request logic in `src/services`, shared state in `src/stores`, hooks in `src/hooks`, and typed contracts in `src/types`. Mock data, factories, and MSW handlers live in `src/mocks`. Use `docs/agri-ai-demo` for PRD, interaction notes, and mock dictionaries. Do not hand-edit `public/mockServiceWorker.js`.

## Build, Test, and Development Commands
Use `npm install` to sync dependencies from `package-lock.json`. Run `npm run dev` for local development, `npm run build` for a production build plus TypeScript project references, and `npm run preview` to inspect the built app. Run `npm run lint` before opening a PR. Use `npm run test` for the Vitest suite, `npm run test:watch` while developing, and `npm run test:e2e` for Playwright. On a new machine, install browsers once with `npx playwright install`.

## Coding Style & Naming Conventions
Follow the existing TypeScript/React style: 2-space indentation, single quotes, and no semicolons. Use PascalCase for React components and page files (`DashboardPage.tsx`), `useXxx` for hooks, and camelCase for utilities and store methods. Prefer the `@/` alias over deep relative imports. Keep page files focused on composition; move stateful logic into hooks or Zustand stores. Repository docs require Chinese responsibility comments at the top of code files, Chinese comments for exported components/functions, and file splits before a module grows beyond 300 lines.

## Testing Guidelines
Unit and integration tests use Vitest with Testing Library in `src/**/*.test.ts` and `src/**/*.test.tsx`. End-to-end coverage uses Playwright in `tests/e2e/*.spec.ts`. MSW is initialized in `src/test/setup.ts`, so mock-backed tests should fail on unhandled requests. Coverage is generated with V8 reporters to `coverage/` as text and HTML output; there is no enforced threshold yet, so add tests for new branches and state transitions.

## Commit & Pull Request Guidelines
Recent history is short, but it shows concise subjects and at least one Conventional Commit example: `docs(readme): ...`. Prefer `<type>(scope): summary` where practical, and keep the language consistent within a commit. PRs should explain the scenario changed, list verification steps (`npm run lint`, `npm run test`, `npm run test:e2e` when relevant), and include screenshots or screen recordings for UI changes. Call out updates to mocks, docs, or generated assets explicitly.
