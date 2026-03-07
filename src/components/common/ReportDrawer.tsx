// 该文件定义报告抽屉组件，展示分析总结并支持导出 JSON。
import { AnimatePresence, motion } from 'framer-motion'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { AnalysisReport } from '@/types/domain'

interface ReportDrawerProps {
  open: boolean
  report?: AnalysisReport
  onClose: () => void
}

// 将报告对象序列化下载为 JSON，便于演示导出能力。
const exportReport = (report: AnalysisReport): void => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.scene}-analysis-report.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 导出报告抽屉，提供可交互的侧边报告视图。
export const ReportDrawer = ({ open, report, onClose }: ReportDrawerProps): JSX.Element => {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-slate-50 p-4 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          >
            <PanelCard
              title="智能分析报告"
              subtitle="基于无人机巡检任务自动生成"
              action={
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-slate-200 px-2 py-1 text-xs text-slate-700"
                >
                  关闭
                </button>
              }
            >
              {!report ? (
                <p className="text-sm text-slate-500">暂无报告数据</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">生成时间：{new Date(report.generatedAt).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-slate-700">{report.summary}</p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">高风险区域</p>
                    <div className="space-y-2">
                      {report.topAreas.map((area) => (
                        <div key={area.plotId} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                          <div>
                            <p className="text-sm text-slate-800">{area.plotName}</p>
                            <p className="text-xs text-slate-500">{area.issue}</p>
                          </div>
                          <StatusBadge text={`${Math.round(area.score * 100)}分`} tone="warn" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">建议措施</p>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                      {report.measures.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportReport(report)}
                    className="w-full rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    导出 JSON 报告
                  </button>
                </div>
              )}
            </PanelCard>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
