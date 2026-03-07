// 该文件定义 KPI 指标网格组件，用于顶部状态卡展示。
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import type { DashboardKpi } from '@/types/domain'

interface KpiGridProps {
  items: DashboardKpi[]
}

// 导出 KPI 网格组件，提供数值状态和动态过渡效果。
export const KpiGrid = ({ items }: KpiGridProps): JSX.Element => {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="panel-border rounded-xl bg-white/90 px-3 py-2"
        >
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
          <p
            className={clsx(
              'text-xs font-medium',
              item.trend === 'up' ? 'text-emerald-600' : 'text-amber-600',
            )}
          >
            {item.trend === 'up' ? '↑' : '↓'} {item.delta}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
