// 该文件保留历史导出接口，内部改为从快照仓库读取数据。
import { queryCurrentSnapshotId, queryDashboardBySnapshot } from '@/mocks/data/snapshotStore'
import type { DiseaseDashboardData, NutrientDashboardData, PestDashboardData, WeedDashboardData } from '@/types/domain'

export const buildDiseaseDashboard = (): DiseaseDashboardData => {
  return queryDashboardBySnapshot({
    scene: 'disease',
    snapshotId: queryCurrentSnapshotId(),
  }) as DiseaseDashboardData
}

export const buildPestDashboard = (): PestDashboardData => {
  return queryDashboardBySnapshot({
    scene: 'pest',
    snapshotId: queryCurrentSnapshotId(),
  }) as PestDashboardData
}

export const buildNutrientDashboard = (): NutrientDashboardData => {
  return queryDashboardBySnapshot({
    scene: 'nutrient',
    snapshotId: queryCurrentSnapshotId(),
  }) as NutrientDashboardData
}

export const buildWeedDashboard = (): WeedDashboardData => {
  return queryDashboardBySnapshot({
    scene: 'weed',
    snapshotId: queryCurrentSnapshotId(),
  }) as WeedDashboardData
}
