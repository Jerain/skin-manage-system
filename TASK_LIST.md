# 四大核心功能开发任务清单

## 项目：皮肤管理门店小程序
**来源：** 黄月英需求文档
**日期：** 2026-03-16

---

## P0 优先级

### F001: 效果可视化 (5天)
- [x] F001-1 创建皮肤记录数据表 (skin_records)
- [x] F001-2 创建肤质对比数据表 (skin_comparisons)
- [x] F001-3 实现肤质记录上传API
- [x] F001-4 实现AI对比图生成API
- [x] F001-5 门店端：肤质记录上传页面
- [x] F001-6 客户端：对比图查看页面

### F002: 技师激励透明化 (4天)
- [x] F002-1 创建业绩记录数据表 (performance_records)
- [x] F002-2 创建奖金规则数据表 (bonus_rules)
- [x] F002-3 创建技师奖金数据表 (technician_bonuses)
- [x] F002-4 实现业绩查询API
- [x] F002-5 实现实时业绩API
- [x] F002-6 实现奖金计算API
- [x] F002-7 门店端：我的业绩页面
- [x] F002-8 后台：奖金规则配置页面

---

## P1 优先级

### F003: 周期性护理计划 (4天)
- [x] F003-1 创建护理计划数据表 (care_plans)
- [x] F003-2 创建护理计划项目数据表 (care_plan_items)
- [x] F003-3 实现护理计划生成算法
- [x] F003-4 实现护理计划API
- [x] F003-5 实现月度推送提醒
- [x] F003-6 客户端：护理计划首页

### F004: 客户成长体系 (5天)
- [x] F004-1 创建会员等级数据表 (member_levels)
- [x] F004-2 创建客户等级数据表 (customer_levels)
- [x] F004-3 创建成长记录数据表 (growth_records)
- [x] F004-4 实现成长值计算逻辑
- [x] F004-5 实现自动升级逻辑
- [x] F004-6 实现等级权益应用
- [x] F004-7 客户端：会员中心首页
- [x] F004-8 后台：会员等级配置页面

---

## Bug 修复

### 线上 Bug（黄月英 bug-list.md）
- [x] BUG-001 登录/注册（实际路径 /api/auth/customer/login、/api/auth/customer/register）
- [x] BUG-102 技师列表 API  `/api/technicians`
- [x] BUG-103 会员卡 API  `/api/member-cards`
- [x] BUG-104 考勤 API  `/api/attendance`
- [x] BUG-105 短信验证码 API  `/api/sms/send`

---

## 开发状态
- 开始日期：2026-03-16
- 状态：已完成 F001-F004 全部功能 + 线上 Bug 修复
- 最近更新：2026-06-09
