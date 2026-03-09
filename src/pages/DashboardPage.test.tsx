// 该文件用于验证看板页面关键交互流程。
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { DashboardPage } from '@/pages/DashboardPage'

const renderPage = () => {
  return render(
    <QueryProvider>
      <DashboardPage onOpenDataCenter={() => {}} />
    </QueryProvider>,
  )
}

describe('DashboardPage', () => {
  it('支持切换到虫害场景并展示虫口趋势模块', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('农业AI无人机巡检作战平台')
    await user.click(screen.getByRole('button', { name: '虫害检测' }))

    await waitFor(() => {
      expect(screen.getByText('虫口密度趋势')).toBeInTheDocument()
    })
  })

  it('支持切换到营养诊断场景', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('农业AI无人机巡检作战平台')
    await user.click(screen.getByRole('button', { name: '营养诊断' }))

    await waitFor(() => {
      expect(screen.getByText('缺素类型分布')).toBeInTheDocument()
    })
  })
})
