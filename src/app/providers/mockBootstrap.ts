// 该文件负责在开发环境启动 Mock Service Worker。
export const enableMocking = async (): Promise<void> => {
  // 仅在开发环境启用 mock，生产构建不注册 worker。
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('@/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}
