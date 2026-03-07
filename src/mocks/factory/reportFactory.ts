// 该文件负责构建场景报告数据，供右侧抽屉与导出演示。
import type { AnalysisReport, HotAreaItem, SceneType } from '@/types/domain'

// 根据场景与高风险区域生成报告摘要信息。
export const createReport = (scene: SceneType, topAreas: HotAreaItem[]): AnalysisReport => {
  const isDisease = scene === 'disease'
  const measures = isDisease
    ? ['重度区域48小时内复拍', '按病害类型分区用药', '对高湿地块加强通风']
    : ['对高密度虫口区域定点喷洒', '补充诱虫板并复测', '安排72小时虫情回访']

  return {
    id: `report-${scene}`,
    scene,
    generatedAt: new Date().toISOString(),
    summary: isDisease
      ? '病害识别显示真菌风险占比最高，建议先处理重度感染地块。'
      : '虫害检测显示蚜虫与稻飞虱聚集明显，需优先处置高密度区域。',
    topAreas: topAreas.slice(0, 5),
    measures,
  }
}
