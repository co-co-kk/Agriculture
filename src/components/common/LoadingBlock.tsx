// 该文件定义加载骨架组件，提升异步请求过程的体验。
interface LoadingBlockProps {
  rows?: number
}

// 导出骨架屏组件，支持按行数配置占位数量。
export const LoadingBlock = ({ rows = 4 }: LoadingBlockProps): JSX.Element => {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`loading-row-${index + 1}`}
          className="h-3 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
        />
      ))}
    </div>
  )
}
