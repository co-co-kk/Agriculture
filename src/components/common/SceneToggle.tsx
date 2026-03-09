// 该文件提供场景切换按钮组，控制四场景看板切换。
import { clsx } from 'clsx'
import type { SceneType } from '@/types/domain'

interface SceneToggleProps {
  value: SceneType
  onChange: (scene: SceneType) => void
}

const sceneItems: Array<{ key: SceneType; label: string; activeClass: string }> = [
  { key: 'disease', label: '病害识别', activeClass: 'bg-emerald-700 text-white shadow-sm' },
  { key: 'pest', label: '虫害检测', activeClass: 'bg-cyan-700 text-white shadow-sm' },
  { key: 'nutrient', label: '营养诊断', activeClass: 'bg-lime-700 text-white shadow-sm' },
  { key: 'weed', label: '杂草喷洒规划', activeClass: 'bg-teal-700 text-white shadow-sm' },
]

export const SceneToggle = ({ value, onChange }: SceneToggleProps): JSX.Element => {
  return (
    <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1">
      {sceneItems.map((item) => (
        <button
          type="button"
          key={item.key}
          onClick={() => onChange(item.key)}
          className={clsx(
            'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
            value === item.key ? item.activeClass : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
