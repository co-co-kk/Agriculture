// 该文件提供场景切换按钮组，控制病害与虫害看板切换。
import { clsx } from 'clsx'
import type { SceneType } from '@/types/domain'

interface SceneToggleProps {
  value: SceneType
  onChange: (scene: SceneType) => void
}

// 导出场景切换组件，保证统一的交互和样式反馈。
export const SceneToggle = ({ value, onChange }: SceneToggleProps): JSX.Element => {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange('disease')}
        className={clsx(
          'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
          value === 'disease' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
        )}
      >
        病害识别
      </button>
      <button
        type="button"
        onClick={() => onChange('pest')}
        className={clsx(
          'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
          value === 'pest' ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
        )}
      >
        虫害检测
      </button>
    </div>
  )
}
