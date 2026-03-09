// 该文件定义中部地图与影像面板，负责空间分布和识别框展示。
import { EmptyState } from '@/components/common/EmptyState'
import { PanelCard } from '@/components/common/PanelCard'
import { AgriMap } from '@/components/map/AgriMap'
import type { DetectionResponse } from '@/types/api'
import type {
  DiseaseDetection,
  DroneMission,
  GeoGridCell,
  LngLat,
  NutrientDetection,
  PestDetection,
  Plot,
  SceneType,
  WeedDetection,
} from '@/types/domain'

interface MapPanelProps {
  scene: SceneType
  plots: Plot[]
  mapCells: GeoGridCell[]
  mission?: DroneMission
  detections?: DetectionResponse
  selectedPlotId: string | null
  onSelectPlot: (plotId: string) => void
}

type SceneDetection = DiseaseDetection | PestDetection | NutrientDetection | WeedDetection

const resolveActivePoint = (framePlotId: string | undefined, plotList: Plot[]): LngLat | null => {
  if (!framePlotId) {
    return null
  }
  return plotList.find((item) => item.id === framePlotId)?.center ?? null
}

const pickDetections = (scene: SceneType, detections: DetectionResponse | undefined): SceneDetection[] => {
  if (!detections) {
    return []
  }
  if (scene === 'disease') {
    return detections.diseaseDetections
  }
  if (scene === 'pest') {
    return detections.pestDetections
  }
  if (scene === 'nutrient') {
    return detections.nutrientDetections
  }
  return detections.weedDetections
}

const detectionTag = (scene: SceneType, item: SceneDetection): string => {
  if (scene === 'disease') {
    return (item as DiseaseDetection).agentType
  }
  if (scene === 'pest') {
    return (item as PestDetection).pestType
  }
  if (scene === 'nutrient') {
    return (item as NutrientDetection).deficiencyType
  }
  return (item as WeedDetection).weedType
}

export const MapPanel = ({
  scene,
  plots,
  mapCells,
  mission,
  detections,
  selectedPlotId,
  onSelectPlot,
}: MapPanelProps): JSX.Element => {
  const frame = detections?.frame
  const frameDetections = pickDetections(scene, detections)
  const activePoint = resolveActivePoint(frame?.plotId, plots)

  return (
    <section className="space-y-3 xl:col-span-6">
      <PanelCard title="农田风险分布地图" subtitle="基于无人机影像识别生成风险热力网格">
        <AgriMap
          plots={plots}
          cells={mapCells}
          path={mission?.path ?? []}
          selectedPlotId={selectedPlotId}
          activePoint={activePoint}
          onSelectPlot={onSelectPlot}
        />
      </PanelCard>

      <PanelCard title="当前帧识别预览" subtitle="支持目标框叠加与结果明细联动">
        {!frame ? (
          <EmptyState title="暂无帧数据" description="请先选择任务后查看识别详情" />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 lg:col-span-2">
              <img src={frame.imageUrl} alt="无人机识别帧" className="h-full w-full object-cover" />

              {frameDetections.map((item) => (
                <div
                  key={item.id}
                  className="absolute border-2 border-rose-500/90"
                  style={{
                    left: `${item.bbox.x * 100}%`,
                    top: `${item.bbox.y * 100}%`,
                    width: `${item.bbox.width * 100}%`,
                    height: `${item.bbox.height * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">帧信息</p>
              <p className="text-xs text-slate-500">时间：{new Date(frame.capturedAt).toLocaleString()}</p>
              <p className="text-xs text-slate-500">NDVI：{frame.ndvi.toFixed(2)}</p>
              <p className="text-xs text-slate-500">温度：{frame.temperature.toFixed(1)}℃</p>
              <p className="text-xs text-slate-500">湿度：{frame.humidity.toFixed(1)}%</p>
              <p className="mt-2 text-xs font-medium text-slate-700">识别目标：{frameDetections.length} 个</p>

              <div className="max-h-36 space-y-1 overflow-y-auto">
                {frameDetections.slice(0, 6).map((item) => (
                  <button
                    type="button"
                    key={`detail-${item.id}`}
                    className="w-full rounded-lg bg-white px-2 py-1 text-left text-xs text-slate-600 hover:bg-emerald-50"
                    onClick={() => onSelectPlot(item.plotId)}
                  >
                    地块{item.plotId} · {detectionTag(scene, item)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </PanelCard>
    </section>
  )
}
