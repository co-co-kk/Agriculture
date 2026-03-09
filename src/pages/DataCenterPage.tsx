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
  collecting: 'bg-slate-100 text-slate-700',
  ready_to_parse: 'bg-amber-100 text-amber-700',
  parsing: 'bg-blue-100 text-blue-700',
  analyzed: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-200 text-emerald-900',
  failed: 'bg-rose-100 text-rose-700',
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_90%_85%,rgba(15,23,42,0.12),transparent_34%),#f6f7f9] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Data Center</h1>
              <p className="mt-1 text-sm text-slate-500">采集 → 解析 → 自动生效 → 历史回看 → 双版本对比</p>
            </div>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              返回看板
            </button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {sources.map((source, index) => (
            <motion.article
              key={source.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-700">{source.provider}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{source.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{source.description}</p>
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{source.endpoint}</p>
              <button
                type="button"
                disabled={collectMutation.isPending}
                onClick={() => collectMutation.mutate(source.id)}
                className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50"
              >
                点击采集
              </button>
            </motion.article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
          <h3 className="text-base font-semibold text-slate-900">任务流转表</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-3">任务</th>
                  <th className="py-2 pr-3">来源</th>
                  <th className="py-2 pr-3">状态</th>
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2">动作</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3 font-medium text-slate-800">{job.id}</td>
                    <td className="py-3 pr-3 text-slate-600">{job.sourceName}</td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-lg px-2 py-1 text-xs ${statusToneMap[job.status]}`}>
                        {statusLabelMap[job.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-500">{new Date(job.updatedAt).toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={job.status !== 'ready_to_parse' || parseMutation.isPending}
                          onClick={() => parseMutation.mutate(job.id)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
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
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
                        >
                          设为当前
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
          <h3 className="text-base font-semibold text-slate-900">历史快照</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {snapshots.map((snapshot) => (
              <article
                key={snapshot.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{snapshot.date}</p>
                  <span className={`rounded-lg px-2 py-1 text-xs ${snapshot.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {snapshot.active ? '当前' : '历史'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">来源：{snapshot.sourceName}</p>
                <p className="mt-1 text-xs text-slate-500">生成时间：{new Date(snapshot.createdAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => setCurrentMutation.mutate(snapshot.id)}
                  className="mt-3 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
                >
                  设为当前
                </button>
              </article>
            ))}
          </div>
        </section>

        {selectedJob ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">任务详情</h3>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
              >
                关闭
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
{JSON.stringify(selectedJob, null, 2)}
            </pre>
          </section>
        ) : null}
      </div>
    </div>
  )
}
