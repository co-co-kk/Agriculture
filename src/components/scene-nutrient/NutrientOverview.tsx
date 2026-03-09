// 该文件定义营养诊断场景概览模块，展示缺素分布与严重度分级。
import { BarChartCard } from '@/components/charts/BarChartCard'
import { PieChartCard } from '@/components/charts/PieChartCard'
import type { NutrientDashboardData } from '@/types/domain'

interface NutrientOverviewProps {
  dashboard: NutrientDashboardData
}

export const NutrientOverview = ({ dashboard }: NutrientOverviewProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <PieChartCard
        title="缺素类型分布"
        subtitle="缺氮 / 缺磷 / 缺钾识别占比"
        seriesName="缺素类型"
        data={dashboard.deficiencyDistribution}
      />
      <BarChartCard
        title="营养缺失严重度"
        subtitle="轻度 / 中度 / 重度区域数量"
        data={dashboard.severityDistribution}
        color="#65a30d"
      />
    </div>
  )
}
