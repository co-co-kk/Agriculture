# 手动可视化测试脚本：打开农业 AI Demo 主看板，执行核心交互
# 使用说明：
#   1. 先在项目根目录运行：npm run dev -- --host 127.0.0.1 --port 4173
#   2. 在另一个终端运行：python3 tests/manual_playwright_dashboard.py

from playwright.sync_api import sync_playwright, Page

BASE_URL = "http://127.0.0.1:4173"


def log(step: str) -> None:
  """简单日志输出，方便你在终端看到当前步骤。"""
  print(f"\n=== {step} ===")


def safe_click_contains(page: Page, text: str) -> None:
  """用 contains 模糊匹配文本，避免 exact 匹配失败。"""
  locator = page.get_by_text(text)
  if locator.count() == 0:
    raise RuntimeError(f"找不到包含文本「{text}」的元素")
  locator.first.click()


def main() -> None:
  with sync_playwright() as p:
    # headless=False：你能看到浏览器窗口；slow_mo 让动作慢一点便于观察
    browser = p.chromium.launch(headless=False, slow_mo=300)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # 1. 打开首页
    log("打开首页")
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    # 2. 场景切换：病害识别 -> 虫害检测 -> 营养诊断 -> 杂草喷洒规划
    log("切换场景：病害识别 → 虫害检测 → 营养诊断 → 杂草喷洒规划")
    for scene in ["病害", "虫害", "营养", "杂草"]:
      try:
        safe_click_contains(page, scene)
        page.wait_for_timeout(800)
      except Exception as exc:
        print(f"切换场景「{scene}」失败：{exc}")

    # 3. 数据中心
    log("切换到数据中心")
    try:
      safe_click_contains(page, "数据中心")
      page.wait_for_load_state("networkidle")
      page.wait_for_timeout(800)
    except Exception as exc:
      print(f"切换到数据中心失败：{exc}")

    # 4. 回到病害识别
    log("回到病害识别场景")
    try:
      safe_click_contains(page, "病害")
      page.wait_for_timeout(800)
    except Exception as exc:
      print(f"回到病害识别场景失败：{exc}")

    # 5. 右侧预警列表：点击包含「地块」的第一条
    log("点击右侧第一条包含「地块」的告警卡片（如果存在）")
    alert_buttons = page.get_by_role("button").filter(has_text="地块")
    if alert_buttons.count() > 0:
      alert_buttons.first.click()
      page.wait_for_timeout(800)
    else:
      print("未找到包含「地块」文本的按钮")

    # 6. 打开报告
    log("点击「打开报告」按钮（如果存在）")
    try:
      safe_click_contains(page, "打开报告")
      page.wait_for_timeout(1000)
    except Exception as exc:
      print(f"未找到「打开报告」按钮：{exc}")

    # 7. 时间轴：左箭头、右箭头、开始回放
    log("操作时间轴：上一帧、下一帧、开始回放")
    left_arrow = page.get_by_role("button", name="‹")
    if left_arrow.count() > 0:
      left_arrow.first.click()
      page.wait_for_timeout(500)
    else:
      print("未找到时间轴左箭头（‹）")

    right_arrow = page.get_by_role("button", name="›")
    if right_arrow.count() > 0:
      right_arrow.first.click()
      page.wait_for_timeout(500)
    else:
      print("未找到时间轴右箭头（›）")

    try:
      safe_click_contains(page, "开始回放")
      page.wait_for_timeout(2000)
    except Exception as exc:
      print(f"未找到「开始回放」按钮：{exc}")

    # 8. 刷新数据
    log("点击「刷新数据」按钮（如果存在）")
    try:
      safe_click_contains(page, "刷新数据")
      page.wait_for_timeout(1000)
    except Exception as exc:
      print(f"未找到「刷新数据」按钮：{exc}")

    print("\n所有步骤执行完成，你可以在浏览器里一路观察。")
    input("\n按回车键关闭浏览器并结束脚本...")
    browser.close()


if __name__ == "__main__":
  main()
