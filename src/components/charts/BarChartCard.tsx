// 该文件封装柱状图卡片组件，用于数量与级别统计。
import ReactECharts from 'echarts-for-react'
import { PanelCard } from '@/components/common/PanelCard'
import { buildBarOption } from '@/utils/chartOptions'

interface BarChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ name: string; value: number }>
  color?: string
}

// 导出柱状图卡片组件，复用于病害分级等统计模块。
export const BarChartCard = ({ title, subtitle, data, color }: BarChartCardProps): JSX.Element => {
  return (
    <PanelCard title={title} subtitle={subtitle}>
      <ReactECharts option={buildBarOption(data, color)} style={{ height: 220, width: '100%' }} />
    </PanelCard>
  )
}
