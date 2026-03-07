// 该文件定义处置建议列表组件，用于右侧行动建议展示。
import { StatusBadge } from '@/components/common/StatusBadge'
import type { SuggestionItem } from '@/types/domain'

interface SuggestionListProps {
  suggestions: SuggestionItem[]
}

// 将建议优先级映射为标签色调，强化视觉区分。
const priorityTone = (priority: SuggestionItem['priority']) => {
  if (priority === '高') {
    return 'danger' as const
  }
  if (priority === '中') {
    return 'warn' as const
  }
  return 'success' as const
}

// 导出处置建议列表组件。
export const SuggestionList = ({ suggestions }: SuggestionListProps): JSX.Element => {
  return (
    <ul className="space-y-2">
      {suggestions.map((item) => (
        <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">{item.title}</p>
            <StatusBadge text={`${item.priority}优先`} tone={priorityTone(item.priority)} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
        </li>
      ))}
    </ul>
  )
}
