# Mock 数据字典

## 1. 数据规模
- 地块：12 个
- 任务：60 个（病害 30 + 虫害 30）
- 帧：4320 条（每任务 72 帧）
- 检测：病害约 6000+，虫害约 9000+
- 告警：约 280 条（双场景合计）

说明：
- 病害与虫害两个场景均保证“每一帧都有对应识别数据”。
- 每一帧均绑定真实农业图片池中的图片 URL。

## 2. 主要类型字段

### 2.1 DroneMission
- `id`: 任务ID
- `scene`: 场景类型（disease/pest）
- `name`: 任务名
- `droneId`: 无人机编号
- `startedAt`/`endedAt`: 起止时间
- `path`: 轨迹点数组
- `plotIds`: 覆盖地块ID
- `frames`: 任务帧数组

### 2.2 MissionFrame
- `id`: 帧ID
- `missionId`: 所属任务
- `capturedAt`: 采集时间
- `imageUrl`: 帧图地址
- `ndvi`/`temperature`/`humidity`: 环境指标
- `plotId`: 帧对应地块

### 2.3 DiseaseDetection
- `agentType`: fungus / bacteria / virus
- `severity`: 轻度/中度/重度
- `bbox`: 检测框
- `confidence`: 置信度

### 2.4 PestDetection
- `pestType`: 虫种名
- `count`: 数量
- `density`: 密度指数
- `bbox`: 检测框
- `confidence`: 置信度

### 2.5 AlertEvent
- `level`: 提示/预警/严重
- `title`: 告警标题
- `description`: 告警描述
- `suggestedAction`: 建议动作
- `occurredAt`: 发生时间

### 2.6 DashboardData
- `kpis`: 顶部指标
- `mapCells`: 地块风险单元
- `hotAreas`: 高风险区域
- `suggestions`: 行动建议
- `agentDistribution`/`severityDistribution`/`pestDistribution`/`densityTrend`: 图表数据

## 3. 接口清单
1. `GET /api/farm`
2. `GET /api/dashboard?scene=&agentType=&severity=&pestType=`
3. `GET /api/missions?scene=`
4. `GET /api/detections?scene=&missionId=&frameIndex=`
5. `GET /api/alerts?scene=`
6. `GET /api/reports?scene=`
