// 该文件定义数据中心页面，承载采集、解析、版本管理和历史回看流程。
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createIngestionJob,
  listJobs,
  listSnapshots,
  setCurrentSnapshot,
  startAnalysis,
  fetchSources,
} from '@/services/api'
import type { IngestionJob } from '@/types/dataCenter'

interface DataCenterPageProps {
  onOpenDashboard: () => void
}

const statusLabelMap: Record<IngestionJob['status'], string> = {
  collecting: '采集中',
  ready_to_parse: '待解析',
  parsing: '解析中',
  analyzed: '已分析',
  active: '已生效',
  failed: '失败',
}

const statusToneMap: Record<IngestionJob['status'], string> = {
  collecting: 'bg-slate-800 text-slate-100',
  ready_to_parse: 'bg-amber-900/60 text-amber-200',
  parsing: 'bg-cyan-900/70 text-cyan-200',
  analyzed: 'bg-emerald-900/70 text-emerald-200',
  active: 'bg-emerald-600/90 text-emerald-50',
  failed: 'bg-rose-900/70 text-rose-200',
}

export const DataCenterPage = ({ onOpenDashboard }: DataCenterPageProps): JSX.Element => {
  const queryClient = useQueryClient()
  const [selectedJob, setSelectedJob] = useState<IngestionJob | null>(null)

  const sourceQuery = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
  })

  const jobQuery = useQuery({
    queryKey: ['ingestion-jobs'],
    queryFn: listJobs,
  })

  const snapshotQuery = useQuery({
    queryKey: ['snapshots'],
    queryFn: listSnapshots,
  })

  const collectMutation = useMutation({
    mutationFn: (sourceId: string) => createIngestionJob(sourceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['snapshots'] }),
      ])
    },
  })

  const parseMutation = useMutation({
    mutationFn: (jobId: string) => startAnalysis(jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['snapshots'] }),
      ])
    },
  })

  const setCurrentMutation = useMutation({
    mutationFn: (snapshotId: string) => setCurrentSnapshot(snapshotId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['snapshots'] }),
        queryClient.invalidateQueries({ queryKey: ['ingestion-jobs'] }),
      ])
    },
  })

  const sources = sourceQuery.data?.sources ?? []
  const jobs = jobQuery.data?.jobs ?? []
  const snapshots = snapshotQuery.data?.snapshots ?? []

  return (
    // 使用与 Dashboard 一致的深色驾驶舱背景
    <main className="min-h-screen bg-slate-950/95 px-2 py-3 md:px-4 md:py-4">
      {/* 中央容器：保持最大宽度和深色卡片风格，与仪表盘统一 */}
      <div className="mx-auto max-w-6xl space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-[0_0_40px_rgba(15,23,42,0.85)] backdrop-blur">
        {/* 顶部标题区域 */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 p-5 shadow-[0_0_24px_rgba(15,23,42,0.9)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">数据中心 · Data Center</h1>
              <p className="mt-1 text-xs text-slate-400">
                采集 → 解析 → 自动生效 → 历史回看 → 双版本对比
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              返回作战看板
            </button>
          </div>
        </motion.header>

        {/* 上方数据源卡片区域 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {sources.map((source, index) => (
            <motion.article
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:shadow-[0_18px_40px_rgba(16,185,129,0.45)]"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-300">{source.provider}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-50">{source.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{source.description}</p>
              <p className="mt-3 rounded-xl bg-slate-900/90 px-3 py-2 text-xs text-slate-500">
                {source.endpoint}
              </p>
              <button
                type="button"
                disabled={collectMutation.isPending}
                onClick={() => collectMutation.mutate(source.id)}
                className="mt-4 w-full rounded-xl border border-emerald-500/70 bg-slate-900/90 px-3 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.7)] transition hover:-translate-y-0.5 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                点击采集
              </button>
            </motion.article>
          ))}
        </section>

        {/* 任务流转表 */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.9)]">
          <h3 className="text-base font-semibold text-slate-50">任务流转表</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-2 pr-3">任务</th>
                  <th className="py-2 pr-3">来源</th>
                  <th className="py-2 pr-3">状态</th>
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2">动作</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90"
                  >
                    <td className="py-3 pr-3 font-medium text-slate-50">{job.id}</td>
                    <td className="py-3 pr-3 text-slate-300">{job.sourceName}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-lg px-2 py-1 text-xs ${statusToneMap[job.status]}`}
                      >
                        {statusLabelMap[job.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-400">
                      {new Date(job.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={job.status !== 'ready_to_parse' || parseMutation.isPending}
                          onClick={() => parseMutation.mutate(job.id)}
                          className="rounded-lg border border-slate-700/80 px-2 py-1 text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:opacity-40"
                        >
                          解析
                        </button>
                        <button
                          type="button"
                          disabled={!job.snapshotId || setCurrentMutation.isPending}
                          onClick={() => {
                            if (job.snapshotId) {
                              setCurrentMutation.mutate(job.snapshotId)
                            }
                          }}
                          className="rounded-lg border border-slate-700/80 px-2 py-1 text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:opacity-40"
                        >
                          设为当前
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="rounded-lg border border-slate-700/80 px-2 py-1 text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                        >
                          详情
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 历史快照区域 */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.9)]">
          <h3 className="text-base font-semibold text-slate-50">历史快照</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {snapshots.map((snapshot) => (
              <article
                key={snapshot.id}
                className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-50">{snapshot.date}</p>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs ${snapshot.active ? 'bg-emerald-600/90 text-emerald-50' : 'bg-slate-700 text-slate-200'}`}
                  >
                    {snapshot.active ? '当前' : '历史'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">来源：{snapshot.sourceName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  生成时间：{new Date(snapshot.createdAt).toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentMutation.mutate(snapshot.id)}
                  className="mt-3 rounded-xl border border-emerald-500/70 bg-slate-900/80 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  设为当前
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 任务详情区域 */}
        {selectedJob ? (
          <section className="rounded-2xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-50">任务详情</h3>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-slate-700/80 px-2 py-1 text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              >
                关闭
              </button>
            </div>
            <pre className="mt-3 max-h-80 overflow-x-auto overflow-y-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
{JSON.stringify(selectedJob, null, 2)}
            </pre>
          </section>
        ) : null}
      </div>
    </main>
  )
}
