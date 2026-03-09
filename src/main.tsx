// 该文件是前端应用入口，负责初始化 Mock 与全局样式。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/index.css'
import { App } from '@/app/App'
import { enableMocking } from '@/app/providers/mockBootstrap'

const bootstrap = async (): Promise<void> => {
  await enableMocking()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
