// 该文件定义病害场景概览模块，展示病原分布与严重度分级。
import { BarChartCard } from '@/components/charts/BarChartCard'
import { PieChartCard } from '@/components/charts/PieChartCard'
import type { DiseaseDashboardData } from '@/types/domain'

interface DiseaseOverviewProps {
  dashboard: DiseaseDashboardData
}

// 导出病害场景概览组件，聚焦病原类型和分级信息。
export const DiseaseOverview = ({ dashboard }: DiseaseOverviewProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <PieChartCard
        title="病原类型分布"
        subtitle="真菌 / 细菌 / 病毒识别占比"
        seriesName="病原类型"
        data={dashboard.agentDistribution}
      />
      <BarChartCard
        title="严重度分级"
        subtitle="轻度 / 中度 / 重度区域数量"
        data={dashboard.severityDistribution}
        color="#b91c1c"
      />
    </div>
  )
}
