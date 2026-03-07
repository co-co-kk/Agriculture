// 该文件是前端应用入口，负责初始化 Mock 与全局 Provider。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 引入地图组件样式，确保 MapLibre 控件显示正常。
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/index.css'
import { App } from '@/app/App'
import { enableMocking } from '@/app/providers/mockBootstrap'

// 在开发环境先启动 MSW，再挂载 React 应用。
const bootstrap = async (): Promise<void> => {
  await enableMocking()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
