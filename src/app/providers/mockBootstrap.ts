// 该文件负责在浏览器环境启动 Mock Service Worker。
export const enableMocking = async (): Promise<void> => {
  const { worker } = await import('@/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      // 部署到子路径时需拼接 BASE_URL，避免线上找不到 worker。
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}
