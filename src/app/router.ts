// 该文件提供轻量路由能力，支持看板页和数据中心页切换。
export type AppPath = '/dashboard' | '/data-center'

export const normalizePath = (path: string): AppPath => {
  if (path === '/data-center') {
    return '/data-center'
  }
  return '/dashboard'
}

export const navigateTo = (path: AppPath): void => {
  if (window.location.pathname === path) {
    return
  }
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
