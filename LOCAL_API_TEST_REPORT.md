# 本地接口自测报告

- 执行时间：2026-10-24 20:57
- 执行人：赵云（agent zhaoyun）
- 被测服务：`server`（NestJS，dist 构建产物）
- 服务端口：3301
- 数据库：独立实例 `127.0.0.1:3308` / schema `zhaoyun_test`
  - 说明：与其它 agent 共享的 3307 实例存在并发建表/清库冲突，故单独起了一个 MySQL 实例做隔离自测
  - 表结构来源：按 `server/src/database/entities/*.entity` 同步生成
    （与线上一致 —— 见 `database/migration-helpers.ts` 顶部注释：生产库最初即由 `synchronize: true` 同步而来）
- 测试数据：store=1、employees=2（张技师/technician、李店长/manager）、customers=1、member_cards=1

## 用例结果

| # | 接口 | 方法 | 期望 | 实际 | 结论 |
|---|------|------|------|------|------|
| 1 | `/api/technicians` | GET | 200 | **200** | ✅ |
| 2 | `/api/member-cards` | GET | 200 | **200** | ✅ |
| 3 | `/api/sms/send` | POST | 200/201 | **201** | ✅ |
| 4 | `/api/auth/customer/login` | POST | 200/201 | **201** | ✅ |

**通过 4 / 失败 0**

## 响应体抽样

```json
// GET /api/technicians  —— 正确按 role 过滤，只返回技师，不含店长
[{"id":1,"storeId":1,"name":"张技师","phone":"13900001111","avatar":"",
  "role":"technician","position":"高级技师","skills":["祛斑","美白"],
  "rating":"4.80","isTechnician":true}]

// GET /api/member-cards
[{"id":1,"customerId":1,"cardName":"测试次卡","cardType":"times",
  "totalTimes":10,"usedTimes":2,"amount":"1000.00","balance":"800.00",
  "expiredAt":"2027-12-31","status":"active"}]

// POST /api/sms/send
{"phone":"13711112222","expiresIn":300,"code":"9268"}

// POST /api/auth/customer/login
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "customer":{"id":1,"name":"测试客户","phone":"13800138000","level":1,
             "balance":"0.00","points":0}}
```

## 附加验证

- 技师列表角色过滤：库中同时存在 `technician`(张技师) 与 `manager`(李店长)，
  接口只返回 1 条 technician，未误含店长 —— 过滤逻辑生效。
- 登录令牌可用：`GET /api/auth/verify` 带 `Authorization: Bearer <token>` → **200**，
  正确回传 `{sub, phone, type:"customer"}`。

## 复现方式

```bash
# 1) 起独立 MySQL（可选，避免与他人共享实例冲突）
mysqld --no-defaults --initialize-insecure --user=jason --datadir=/tmp/zy-mysql
mysqld --no-defaults --user=jason --datadir=/tmp/zy-mysql --port=3308 \
       --socket=/tmp/zy-mysql-run/mysql.sock --log-error=/tmp/zy-mysql-run/error.log \
       --pid-file=/tmp/zy-mysql-run/mysqld.pid --mysqlx=OFF

# 2) 建表 + 造数据
DB_PORT=3308 DB_PASSWORD=root DB_NAME=zhaoyun_test npx ts-node seed-test.tmp.ts

# 3) 起服务
npm run build
PORT=3301 DB_PORT=3308 DB_PASSWORD=root DB_NAME=zhaoyun_test node dist/main.js

# 4) 跑用例
API=http://127.0.0.1:3301/api
curl -s -o /dev/null -w "technicians  %{http_code}\n" $API/technicians
curl -s -o /dev/null -w "member-cards %{http_code}\n" $API/member-cards
curl -s -o /dev/null -w "sms/send     %{http_code}\n" -X POST $API/sms/send \
     -H "Content-Type: application/json" -d '{"phone":"13711112222"}'
curl -s -o /dev/null -w "login        %{http_code}\n" -X POST $API/auth/customer/login \
     -H "Content-Type: application/json" -d '{"phone":"13800138000","password":"test123456"}'
```

## 未覆盖 / 后续

- 线上 http://106.12.149.161:3001 仍不可达（curl 返回 000），线上回归待服务器恢复后补跑。
- 迁移脚本 `migration:run` 在隔离库上的完整链路尚未跑通：
  `CreateBaselineTables` 属并行开发中的文件，列定义/default 值仍在改动，
  本次未在最终态上复验。API 自测因此改用实体同步建表（与线上一致）。
