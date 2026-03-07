// 该文件实现农业地图组件，负责地块、热力、轨迹和定位点可视化。
import { useEffect, useMemo, useRef } from 'react'
import type { Feature, FeatureCollection, LineString, Point, Polygon } from 'geojson'
import type { GeoGridCell, LngLat, Plot } from '@/types/domain'
import { osmMapStyle } from '@/components/map/mapStyle'

interface AgriMapProps {
  plots: Plot[]
  cells: GeoGridCell[]
  path: LngLat[]
  selectedPlotId: string | null
  activePoint: LngLat | null
  onSelectPlot: (plotId: string) => void
}

// 将地块和风险数据融合成 GeoJSON，供地图图层渲染。
const createPlotGeoJson = (plots: Plot[], cells: GeoGridCell[]): FeatureCollection<Polygon> => {
  const cellMap = new Map(cells.map((item) => [item.plotId, item]))
  return {
    type: 'FeatureCollection',
    features: plots.map<Feature<Polygon>>((plot) => {
      const cell = cellMap.get(plot.id)
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [plot.polygon],
        },
        properties: {
          plotId: plot.id,
          name: plot.name,
          riskScore: cell?.riskScore ?? 0,
          primaryRiskType: cell?.primaryRiskType ?? '未知',
        },
      }
    }),
  }
}

// 将任务路径转换为 GeoJSON 线结构。
const createPathGeoJson = (path: LngLat[]): FeatureCollection<LineString> => {
  return {
    type: 'FeatureCollection',
    features:
      path.length >= 2
        ? [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: path,
              },
              properties: {},
            },
          ]
        : [],
  }
}

// 将当前定位点转换为 GeoJSON 点结构。
const createPointGeoJson = (point: LngLat | null): FeatureCollection<Point> => {
  return {
    type: 'FeatureCollection',
    features: point
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: point,
            },
            properties: {},
          },
        ]
      : [],
  }
}

// 导出农业地图组件，支持点击地块并触发外层联动。
export const AgriMap = ({ plots, cells, path, selectedPlotId, activePoint, onSelectPlot }: AgriMapProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)

  // 使用 memo 缓存 GeoJSON，避免无意义重建。
  const plotGeoJson = useMemo(() => createPlotGeoJson(plots, cells), [plots, cells])
  const pathGeoJson = useMemo(() => createPathGeoJson(path), [path])
  const pointGeoJson = useMemo(() => createPointGeoJson(activePoint), [activePoint])

  useEffect(() => {
    // 测试环境不初始化地图，避免 WebGL 依赖造成失败。
    if (import.meta.env.MODE === 'test') {
      return
    }

    let canceled = false

    const initMap = async () => {
      const maplibre = await import('maplibre-gl')
      if (!containerRef.current || canceled || mapRef.current) {
        return
      }

      const defaultCenter = plots[0]?.center ?? [118.39, 31.08]
      const map = new maplibre.Map({
        container: containerRef.current,
        style: osmMapStyle,
        center: defaultCenter,
        zoom: 11.8,
      })

      map.addControl(new maplibre.NavigationControl({ showCompass: true }), 'top-right')

      map.on('load', () => {
        map.addSource('plots-source', {
          type: 'geojson',
          data: plotGeoJson,
        })
        map.addSource('path-source', {
          type: 'geojson',
          data: pathGeoJson,
        })
        map.addSource('point-source', {
          type: 'geojson',
          data: pointGeoJson,
        })

        map.addLayer({
          id: 'plots-fill',
          type: 'fill',
          source: 'plots-source',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'riskScore'], 0],
              0,
              '#bbf7d0',
              0.5,
              '#fbbf24',
              0.75,
              '#f97316',
              1,
              '#dc2626',
            ],
            'fill-opacity': 0.42,
          },
        })

        map.addLayer({
          id: 'plots-outline',
          type: 'line',
          source: 'plots-source',
          paint: {
            'line-color': '#0f172a',
            'line-width': 1.1,
          },
        })

        map.addLayer({
          id: 'path-line',
          type: 'line',
          source: 'path-source',
          paint: {
            'line-color': '#0369a1',
            'line-width': 2.4,
            'line-dasharray': [1.8, 1.2],
          },
        })

        map.addLayer({
          id: 'drone-point',
          type: 'circle',
          source: 'point-source',
          paint: {
            'circle-radius': 7,
            'circle-color': '#0f766e',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
          },
        })

        map.on('click', 'plots-fill', (event) => {
          const feature = event.features?.[0]
          const plotId = feature?.properties?.plotId
          if (typeof plotId === 'string') {
            onSelectPlot(plotId)
          }
        })

        map.on('mouseenter', 'plots-fill', () => {
          map.getCanvas().style.cursor = 'pointer'
        })

        map.on('mouseleave', 'plots-fill', () => {
          map.getCanvas().style.cursor = ''
        })
      })

      mapRef.current = map
    }

    void initMap()

    return () => {
      canceled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [plots, onSelectPlot, plotGeoJson, pathGeoJson, pointGeoJson])

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return
    }

    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) {
      return
    }

    // 按最新数据更新数据源，实现地图与筛选同步。
    const plotSource = map.getSource('plots-source') as import('maplibre-gl').GeoJSONSource | undefined
    const pathSource = map.getSource('path-source') as import('maplibre-gl').GeoJSONSource | undefined
    const pointSource = map.getSource('point-source') as import('maplibre-gl').GeoJSONSource | undefined

    plotSource?.setData(plotGeoJson)
    pathSource?.setData(pathGeoJson)
    pointSource?.setData(pointGeoJson)

    // 通过过滤器高亮选中地块，并在取消选择时清空高亮。
    const filterValue = selectedPlotId ?? '__none__'
    if (!map.getLayer('plot-highlight')) {
      map.addLayer({
        id: 'plot-highlight',
        type: 'line',
        source: 'plots-source',
        paint: {
          'line-color': '#22c55e',
          'line-width': 3,
        },
        filter: ['==', ['get', 'plotId'], filterValue],
      })
    } else {
      map.setFilter('plot-highlight', ['==', ['get', 'plotId'], filterValue])
    }
  }, [plotGeoJson, pathGeoJson, pointGeoJson, selectedPlotId])

  return (
    <div className="map-shell w-full overflow-hidden rounded-2xl border border-slate-200">
      <div ref={containerRef} className="h-[430px] w-full" />
    </div>
  )
}
