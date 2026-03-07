// 该文件集中封装 ECharts 配置生成函数，避免组件内堆积配置对象。

// 为饼图生成统一样式配置。
export const buildPieOption = (seriesName: string, data: Array<{ name: string; value: number }>) => {
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        name: seriesName,
        type: 'pie',
        radius: ['42%', '72%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 11,
        },
        data,
      },
    ],
  }
}

// 为柱状图生成统一样式配置。
export const buildBarOption = (data: Array<{ name: string; value: number }>, color = '#0f766e') => {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 28, right: 12, top: 26, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 18,
        itemStyle: { color, borderRadius: [6, 6, 0, 0] },
        data: data.map((item) => item.value),
      },
    ],
  }
}

// 为折线图生成统一样式配置。
export const buildLineOption = (data: Array<{ time: string; value: number }>, color = '#0284c7') => {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 20, right: 12, top: 24, bottom: 26 },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.time),
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: {
        fontSize: 11,
        formatter: (value: number) => `${Math.round(value * 100)}%`,
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2.5, color },
        itemStyle: { color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}99` },
              { offset: 1, color: `${color}12` },
            ],
          },
        },
        data: data.map((item) => item.value),
      },
    ],
  }
}
