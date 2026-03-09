// 该文件定义左侧分析栏，按场景展示筛选与统计图表。
import { EmptyState } from '@/components/common/EmptyState'
import { FilterPanel } from '@/components/common/FilterPanel'
import { LoadingBlock } from '@/components/common/LoadingBlock'
import { PanelCard } from '@/components/common/PanelCard'
import { DiseaseOverview } from '@/components/scene-disease/DiseaseOverview'
import { NutrientOverview } from '@/components/scene-nutrient/NutrientOverview'
import { PestOverview } from '@/components/scene-pest/PestOverview'
import { WeedOverview } from '@/components/scene-weed/WeedOverview'
import type { DashboardResponse } from '@/types/api'
import type { SceneType, SeverityLevel } from '@/types/domain'

interface LeftSidebarProps {
  scene: SceneType
  dashboard?: DashboardResponse
  loading: boolean
  filter: {
    severity?: SeverityLevel
    agentType?: string
    pestType?: string
    deficiencyType?: string
    weedType?: string
  }
  onFilterChange: (
    patch: Partial<{
      severity?: SeverityLevel
      agentType?: string
      pestType?: string
      deficiencyType?: string
      weedType?: string
    }>,
  ) => void
}

export const LeftSidebar = ({
  scene,
  dashboard,
  loading,
  filter,
  onFilterChange,
}: LeftSidebarProps): JSX.Element => {
  return (
    <aside className="space-y-3 xl:col-span-3">
      <PanelCard title="筛选条件" subtitle="按场景维度过滤看板结果">
        <FilterPanel scene={scene} filter={filter} onFilterChange={onFilterChange} />
      </PanelCard>

      {loading ? <LoadingBlock rows={7} /> : null}
      {!loading && !dashboard ? <EmptyState title="暂无看板数据" description="请稍后重试或切换数据版本" /> : null}

      {!loading && dashboard?.scene === 'disease' ? <DiseaseOverview dashboard={dashboard} /> : null}
      {!loading && dashboard?.scene === 'pest' ? <PestOverview dashboard={dashboard} /> : null}
      {!loading && dashboard?.scene === 'nutrient' ? <NutrientOverview dashboard={dashboard} /> : null}
      {!loading && dashboard?.scene === 'weed' ? <WeedOverview dashboard={dashboard} /> : null}
    </aside>
  )
}
