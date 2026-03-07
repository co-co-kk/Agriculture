// 该文件集中管理真实农业案例图片池，按场景输出更拟真的巡检帧素材。
import type { SceneType } from '@/types/domain'

// 病害场景图片：以病斑、霉斑、锈斑等症状叶片为主。
const diseaseImages: string[] = [
  'https://images.pexels.com/photos/7718268/pexels-photo-7718268.jpeg?cs=srgb&dl=pexels-marina-zasorina-7718268.jpg&fm=jpg',
  'https://images.pexels.com/photos/11597994/pexels-photo-11597994.jpeg?cs=srgb&dl=pexels-ninasimek-11597994.jpg&fm=jpg',
  'https://images.pexels.com/photos/30547887/pexels-photo-30547887.jpeg?cs=srgb&dl=pexels-esrakorkmaz-30547887.jpg&fm=jpg',
  'https://images.pexels.com/photos/20223372/pexels-photo-20223372.jpeg?cs=srgb&dl=pexels-ekaterina-shishkonakova-121008470-20223372.jpg&fm=jpg',
  'https://images.pexels.com/photos/19248484/pexels-photo-19248484.jpeg?cs=srgb&dl=pexels-ellie-burgin-1661546-19248484.jpg&fm=jpg',
  'https://images.pexels.com/photos/33680863/pexels-photo-33680863.jpeg?cs=srgb&dl=pexels-f-2154796291-33680863.jpg&fm=jpg',
]

// 虫害场景图片：以害虫特写、叶面啃食和聚集画面为主。
const pestImages: string[] = [
  'https://images.pexels.com/photos/8464926/pexels-photo-8464926.jpeg?cs=srgb&dl=pexels-3374640-8464926.jpg&fm=jpg',
  'https://images.pexels.com/photos/33290486/pexels-photo-33290486.jpeg?cs=srgb&dl=pexels-sinan-646212227-33290486.jpg&fm=jpg',
  'https://images.pexels.com/photos/20833526/pexels-photo-20833526.jpeg?cs=srgb&dl=pexels-cannon-ong-1119729723-20833526.jpg&fm=jpg',
  'https://images.pexels.com/photos/25539676/pexels-photo-25539676.jpeg?cs=srgb&dl=pexels-70588695-25539676.jpg&fm=jpg',
  'https://images.pexels.com/photos/4819494/pexels-photo-4819494.jpeg?cs=srgb&dl=pexels-zoosnow-803412-4819494.jpg&fm=jpg',
  'https://images.pexels.com/photos/15265763/pexels-photo-15265763.jpeg?cs=srgb&dl=pexels-ashlee-marie-430174814-15265763.jpg&fm=jpg',
]

// 根据场景和帧索引返回图片 URL，采用循环取值保证数量充足。
export const getRealImageUrl = (scene: SceneType, frameIndex: number): string => {
  const pool = scene === 'disease' ? diseaseImages : pestImages
  return pool[frameIndex % pool.length]
}
