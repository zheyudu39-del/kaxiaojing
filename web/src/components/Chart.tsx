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

    // 用 ResizeObserver 监听「容器自身」尺寸变化。
    // 仅监听 window.resize 不够：Tabs 切换、侧栏折叠、移动端断点切换
    // 都会改变容器宽度但不触发 window.resize，导致图表画布停在旧宽度
    // 并溢出父容器（旧版移动端图表右侧被截断、出现横向滚动条）。
    const ro = new ResizeObserver(() => {
      // 容器被隐藏（如未激活的 Tab）时宽度为 0，跳过以免 ECharts 报错
      if (ref.current && ref.current.clientWidth > 0) {
        inst.current?.resize()
      }
    })
    ro.observe(ref.current)

    const onResize = () => inst.current?.resize()
    window.addEventListener('resize', onResize)

    // 字体/样式加载完成后补一次，避免初次测量偏差
    const timer = window.setTimeout(() => {
      if (ref.current && ref.current.clientWidth > 0) inst.current?.resize()
    }, 120)

    return () => {
      window.clearTimeout(timer)
      ro.disconnect()
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

  return <div ref={ref} style={{ width: '100%', height, maxWidth: '100%', overflow: 'hidden' }} />
}
