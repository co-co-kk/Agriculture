// 该文件用于验证快照仓库的状态流转与历史版本行为。
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createIngestionJob,
  listJobs,
  listSnapshots,
  queryCurrentSnapshotId,
  querySnapshotCompare,
  resetSnapshotStoreForTest,
  setCurrentSnapshot,
  startAnalysis,
} from '@/mocks/data/snapshotStore'

beforeEach(() => {
  resetSnapshotStoreForTest()
})

describe('snapshotStore', () => {
  it('创建采集任务后应进入待解析状态', () => {
    const job = createIngestionJob('source-a')
    expect(job.status).toBe('ready_to_parse')
  })

  it('解析任务后应自动生成快照并设为当前', () => {
    const job = createIngestionJob('source-a')
    const result = startAnalysis(job.id)
    expect(result.job.status).toBe('active')
    expect(result.snapshot.active).toBe(true)
    expect(queryCurrentSnapshotId()).toBe(result.snapshot.id)
  })

  it('支持手动设为当前版本', () => {
    const snapshots = listSnapshots().snapshots
    expect(snapshots.length).toBeGreaterThan(1)
    const target = snapshots[snapshots.length - 1]
    const currentSnapshotId = setCurrentSnapshot(target.id)
    expect(currentSnapshotId).toBe(target.id)
  })

  it('支持双版本对比结果输出', () => {
    const snapshots = listSnapshots().snapshots
    const left = snapshots[0]
    const right = snapshots[1]
    const compare = querySnapshotCompare({
      leftSnapshotId: left.id,
      rightSnapshotId: right.id,
      scene: 'disease',
    })
    expect(compare.metrics.length).toBeGreaterThan(0)
  })

  it('任务列表按时间降序返回', () => {
    createIngestionJob('source-a')
    createIngestionJob('source-b')
    const jobs = listJobs()
    expect(new Date(jobs[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(jobs[1].createdAt).getTime())
  })
})
