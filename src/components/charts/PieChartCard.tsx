// 该文件封装饼图卡片组件，用于类别分布展示。
import ReactECharts from 'echarts-for-react'
import { PanelCard } from '@/components/common/PanelCard'
import { buildPieOption } from '@/utils/chartOptions'

interface PieChartCardProps {
  title: string
  subtitle?: string
  seriesName: string
  data: Array<{ name: string; value: number }>
}

// 导出饼图卡片组件，统一图表尺寸与容器风格。
export const PieChartCard = ({ title, subtitle, seriesName, data }: PieChartCardProps): JSX.Element => {
  return (
    <PanelCard title={title} subtitle={subtitle}>
      <ReactECharts option={buildPieOption(seriesName, data)} style={{ height: 220, width: '100%' }} />
    </PanelCard>
  )
}
