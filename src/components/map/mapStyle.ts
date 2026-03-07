// 该文件定义地图底图样式，使用 OSM 栅格瓦片实现免密钥运行。
import type { StyleSpecification } from 'maplibre-gl'

// 导出统一地图样式，供 MapLibre 初始化时复用。
export const osmMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
    },
  ],
}
