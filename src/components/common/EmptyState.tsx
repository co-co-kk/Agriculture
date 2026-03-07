// 该文件定义空数据状态组件，统一无数据场景提示。
interface EmptyStateProps {
  title: string
  description: string
}

// 导出空态组件，避免各区域重复实现空态样式。
export const EmptyState = ({ title, description }: EmptyStateProps): JSX.Element => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  )
}
