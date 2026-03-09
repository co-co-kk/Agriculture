// 该文件提供默认快照数据聚合导出，兼容已有测试与调试读取。
import { queryCurrentSnapshotId, queryMissionsBySnapshot } from '@/mocks/data/snapshotStore'

// 兼容旧测试：导出当前快照的任务视图。
const currentSnapshotId = queryCurrentSnapshotId()

export const dataset = {
  missions: {
    disease: queryMissionsBySnapshot('disease', currentSnapshotId),
    pest: queryMissionsBySnapshot('pest', currentSnapshotId),
    nutrient: queryMissionsBySnapshot('nutrient', currentSnapshotId),
    weed: queryMissionsBySnapshot('weed', currentSnapshotId),
  },
}
