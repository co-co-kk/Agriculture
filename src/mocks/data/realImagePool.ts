// 该文件集中管理真实农业案例图片池，按场景输出更拟真的巡检帧素材。
import type { SceneType } from '@/types/domain'
import disease01 from './imgs/disease-01.jpg'
import disease02 from './imgs/disease-02.jpg'
import disease03 from './imgs/disease-03.jpg'
import disease04 from './imgs/disease-04.jpg'
import disease05 from './imgs/disease-05.jpg'
import disease06 from './imgs/disease-06.jpg'
import pest01 from './imgs/pest-01.jpg'
import pest02 from './imgs/pest-02.jpg'
import pest03 from './imgs/pest-03.jpg'
import pest04 from './imgs/pest-04.jpg'
import pest05 from './imgs/pest-05.jpg'
import pest06 from './imgs/pest-06.jpg'

// 病害场景图片：以病斑、霉斑、锈斑等症状叶片为主。
const diseaseImages: string[] = [
  disease01,
  disease02,
  disease03,
  disease04,
  disease05,
  disease06,
]

// 虫害场景图片：以害虫特写、叶面啃食和聚集画面为主。
const pestImages: string[] = [
  pest01,
  pest02,
  pest03,
  pest04,
  pest05,
  pest06,
]

// 根据场景和帧索引返回图片 URL，采用循环取值保证数量充足。
export const getRealImageUrl = (scene: SceneType, frameIndex: number): string => {
  const pool = scene === 'disease' ? diseaseImages : pestImages
  return pool[frameIndex % pool.length]
}
