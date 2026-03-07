// 该文件定义虫害场景概览模块，展示虫种分布与密度趋势。
import { LineChartCard } from '@/components/charts/LineChartCard'
import { PieChartCard } from '@/components/charts/PieChartCard'
import type { PestDashboardData } from '@/types/domain'

interface PestOverviewProps {
  dashboard: PestDashboardData
}

// 导出虫害场景概览组件，聚焦虫种结构和时间趋势。
export const PestOverview = ({ dashboard }: PestOverviewProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <PieChartCard
        title="害虫种类占比"
        subtitle="虫种识别与数量占比分布"
        seriesName="虫种"
        data={dashboard.pestDistribution}
      />
      <LineChartCard
        title="虫口密度趋势"
        subtitle="按时间窗口统计高风险区域密度"
        data={dashboard.densityTrend}
        color="#0e7490"
      />
    </div>
  )
}
