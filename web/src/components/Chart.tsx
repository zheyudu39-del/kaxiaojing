import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Empty } from 'antd'

/** 轻量 ECharts 封装：容器自适应、卸载自动 dispose */
export default function Chart({
  option,
  height = 300,
  empty,
}: {
  option: echarts.EChartsOption
  height?: number
  empty?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inst = useRef<echarts.ECharts>()

  useEffect(() => {
    if (!ref.current || empty) return
    inst.current = echarts.init(ref.current)
    inst.current.setOption(option)
    const onResize = () => inst.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      inst.current?.dispose()
      inst.current = undefined
    }
  }, [option, empty])

  if (empty) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      </div>
    )
  }

  return <div ref={ref} style={{ width: '100%', height }} />
}
