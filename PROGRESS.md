# 皮肤管理门店管理系统 - Phase 1 MVP 开发进度

## ✅ 已完成

### 1. 数据库设计
- [x] 数据库表结构设计 (`server/database/schema.md`)
- [x] Entity 实体类创建 (10个表)

### 2. 后端 API (NestJS)
- [x] 客户管理 (`customers`) - CRUD
- [x] 门店管理 (`stores`) - CRUD
- [x] 员工管理 (`employees`) - CRUD
- [x] 服务项目 (`services` + `categories`) - CRUD
- [x] 预约管理 (`appointments`) - 含冲突检测
- [x] 订单管理 (`orders`) - 含支付流程
- [x] 认证模块 (`auth`) - JWT
- [x] 管理员 (`admin`) - CRUD
- [x] 考勤管理 (`attendance`) - 打卡/签到

### 3. 管理后台 (Vue3 + Element Plus)
- [x] 项目结构搭建
- [x] 登录页面
- [x] 主布局 (侧边栏 + 头部)
- [x] 数据概览 Dashboard
- [x] 门店管理
- [x] 员工管理
- [x] 客户管理
- [x] 服务项目管理
- [x] 预约管理
- [x] 订单管理

### 4. 客户端小程序 (uni-app)
- [x] 登录页面
- [x] 首页（推荐门店/热门项目）
- [x] 门店列表
- [x] 服务项目列表
- [x] 预约流程（选择项目/门店/技师/时间）
- [x] 我的预约
- [x] 我的订单
- [x] 个人中心

### 5. 门店端小程序 (uni-app)
- [x] 员工登录
- [x] 首页（考勤打卡/快捷操作）
- [x] 今日预约列表
- [x] 预约处理（确认/拒绝/完成）
- [x] 客户签到
- [x] 客户管理
- [x] 个人中心

## 待完善
- [ ] 人脸识别集成（腾讯云）- 预留接口
- [ ] 微信/支付宝支付集成
- [ ] 消息推送
- [ ] 数据统计报表

## 项目结构
```
skin-care-miniapp/
├── client/          # 客户端小程序 (uni-app) ✅
├── store/           # 门店端小程序 (uni-app) ✅
├── admin/           # 管理后台 Web (Vue3 + Element Plus) ✅
└── server/          # NestJS 后端 ✅
```

## 启动说明

### 后端启动
```bash
cd server
npm install
# 配置 .env 中的数据库连接
npm run dev
```

### 管理后台启动
```bash
cd admin
npm install
npm run dev
```

### 小程序启动
```bash
cd client  # 或 store
npm install
npm run dev:h5  # 或 mp-weixin
```
