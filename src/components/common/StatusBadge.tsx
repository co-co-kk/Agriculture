// 该文件提供状态标签组件，用于告警等级与建议优先级展示。
import { clsx } from 'clsx'

interface StatusBadgeProps {
  text: string
  tone: 'success' | 'warn' | 'danger' | 'neutral'
}

// 导出状态标签组件，统一颜色映射规则。
export const StatusBadge = ({ text, tone }: StatusBadgeProps): JSX.Element => {
  const toneClass = {
    success: 'bg-emerald-100 text-emerald-700',
    warn: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    neutral: 'bg-slate-100 text-slate-700',
  }[tone]

  return (
    <span className={clsx('rounded-full px-2 py-1 text-xs font-medium', toneClass)}>
      {text}
    </span>
  )
}
