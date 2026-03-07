// 该文件定义通用面板卡片，用于统一各区域的容器风格。
import type { PropsWithChildren, ReactNode } from 'react'
import { clsx } from 'clsx'

interface PanelCardProps extends PropsWithChildren {
  title: string
  subtitle?: string
  className?: string
  action?: ReactNode
}

// 导出通用面板组件，减少重复布局代码。
export const PanelCard = ({ title, subtitle, className, action, children }: PanelCardProps): JSX.Element => {
  return (
    <section className={clsx('panel-border rounded-2xl bg-white p-4 shadow-sm', className)}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      {children}
    </section>
  )
}
