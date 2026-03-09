// 该文件用于验证数据中心页面关键交互入口可用。
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { DataCenterPage } from '@/pages/DataCenterPage'

const renderPage = () => {
  return render(
    <QueryProvider>
      <DataCenterPage onOpenDashboard={() => {}} />
    </QueryProvider>,
  )
}

describe('DataCenterPage', () => {
  it('应显示数据中心主标题和采集入口', async () => {
    renderPage()
    expect(await screen.findByText('Data Center')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '点击采集' }).length).toBeGreaterThan(0)
  })

  it('采集后任务表应出现待解析状态', async () => {
    const user = userEvent.setup()
    renderPage()
    const collectButton = (await screen.findAllByRole('button', { name: '点击采集' }))[0]
    await user.click(collectButton)
    expect(await screen.findByText('待解析')).toBeInTheDocument()
  })
})
