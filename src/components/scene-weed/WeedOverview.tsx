// 该文件定义杂草喷洒规划场景概览模块，展示杂草分布与喷洒趋势。
import { LineChartCard } from '@/components/charts/LineChartCard'
import { PieChartCard } from '@/components/charts/PieChartCard'
import type { WeedDashboardData } from '@/types/domain'

interface WeedOverviewProps {
  dashboard: WeedDashboardData
}

export const WeedOverview = ({ dashboard }: WeedOverviewProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <PieChartCard
        title="杂草类型占比"
        subtitle="阔叶 / 禾本科 / 莎草识别占比"
        seriesName="杂草类型"
        data={dashboard.weedDistribution}
      />
      <LineChartCard
        title="喷洒区域趋势"
        subtitle="按时间窗口统计建议喷洒覆盖率"
        data={dashboard.sprayAreaTrend}
        color="#0f766e"
      />
    </div>
  )
}
