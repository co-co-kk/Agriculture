// 该文件封装折线图卡片组件，用于趋势类数据展示。
import ReactECharts from 'echarts-for-react'
import { PanelCard } from '@/components/common/PanelCard'
import { buildLineOption } from '@/utils/chartOptions'

interface LineChartCardProps {
  title: string
  subtitle?: string
  data: Array<{ time: string; value: number }>
  color?: string
}

// 导出折线图卡片组件，复用于虫口密度趋势模块。
export const LineChartCard = ({ title, subtitle, data, color }: LineChartCardProps): JSX.Element => {
  return (
    <PanelCard title={title} subtitle={subtitle}>
      <ReactECharts option={buildLineOption(data, color)} style={{ height: 220, width: '100%' }} />
    </PanelCard>
  )
}
