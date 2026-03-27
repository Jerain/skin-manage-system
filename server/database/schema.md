# 皮肤管理门店小程序 - 数据库设计

## Phase 1 MVP 数据库表结构

### 1. customers - 客户表
```sql
CREATE TABLE `customers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) COMMENT '客户姓名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `password` VARCHAR(255) COMMENT '密码(加密)',
  `face_token` VARCHAR(255) COMMENT '人脸识别token',
  `skin_type` VARCHAR(50) COMMENT '肤质',
  `allergy_info` TEXT COMMENT '过敏史',
  `points` INT DEFAULT 0 COMMENT '积分',
  `level` TINYINT DEFAULT 1 COMMENT '会员等级',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone`(`phone`)
);
```

### 2. stores - 门店表
```sql
CREATE TABLE `stores` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '门店名称',
  `address` VARCHAR(255) COMMENT '门店地址',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `business_hours` VARCHAR(100) COMMENT '营业时间，如 09:00-21:00',
  `latitude` DECIMAL(10,7) COMMENT '纬度',
  `longitude` DECIMAL(11,7) COMMENT '经度',
  `images` TEXT COMMENT '门店图片JSON数组',
  `description` TEXT COMMENT '门店描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. employees - 员工表
```sql
CREATE TABLE `employees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `store_id` BIGINT UNSIGNED NOT NULL COMMENT '所属门店',
  `name` VARCHAR(50) NOT NULL COMMENT '员工姓名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `password` VARCHAR(255) COMMENT '密码',
  `role` VARCHAR(20) NOT NULL COMMENT '角色: manager(店长), technician(技师), receptionist(前台)',
  `position` VARCHAR(50) COMMENT '职位',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `face_token` VARCHAR(255) COMMENT '人脸识别token',
  `skills` JSON COMMENT '擅长项目ID数组',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_store_id`(`store_id`),
  INDEX `idx_phone`(`phone`)
);
```

### 4. service_categories - 服务分类表
```sql
CREATE TABLE `service_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(100) COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. services - 服务项目表
```sql
CREATE TABLE `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类',
  `store_id` BIGINT UNSIGNED COMMENT '所属门店(门店专属项目)',
  `name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `duration` INT NOT NULL COMMENT '时长(分钟)',
  `description` TEXT COMMENT '项目描述',
  `effects` TEXT COMMENT '效果说明',
  `precautions` TEXT COMMENT '注意事项',
  `images` TEXT COMMENT '项目图片JSON数组',
  `is_featured` TINYINT DEFAULT 0 COMMENT '是否推荐',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_id`(`category_id`),
  INDEX `idx_store_id`(`store_id`)
);
```

### 6. appointments - 预约表
```sql
CREATE TABLE `appointments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `store_id` BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
  `employee_id` BIGINT UNSIGNED NOT NULL COMMENT '技师ID',
  `service_id` BIGINT UNSIGNED NOT NULL COMMENT '服务项目ID',
  `appointment_date` DATE NOT NULL COMMENT '预约日期',
  `appointment_time` TIME NOT NULL COMMENT '预约开始时间',
  `duration_hours` DECIMAL(3,1) DEFAULT 1.0 COMMENT '预约时长(小时)',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending(待确认), confirmed(已确认), completed(已完成), cancelled(已取消)',
  `notes` TEXT COMMENT '客户备注',
  `cancel_reason` VARCHAR(255) COMMENT '取消原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_id`(`customer_id`),
  INDEX `idx_store_id`(`store_id`),
  INDEX `idx_employee_id`(`employee_id`),
  INDEX `idx_appointment_date`(`appointment_date`, `appointment_time`),
  UNIQUE KEY `uk_employee_time` (`employee_id`, `appointment_date`, `appointment_time`, `duration_hours`)
);
```

### 7. orders - 订单表
```sql
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `appointment_id` BIGINT UNSIGNED COMMENT '关联预约ID',
  `store_id` BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
  `service_id` BIGINT UNSIGNED NOT NULL COMMENT '服务项目ID',
  `employee_id` BIGINT UNSIGNED COMMENT '服务技师ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `actual_amount` DECIMAL(10,2) COMMENT '实付金额',
  `pay_type` VARCHAR(20) COMMENT '支付方式: balance(余额), card(卡项), wechat(微信), alipay(支付宝)',
  `pay_status` VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态: unpaid(未支付), paid(已支付), refunded(已退款)',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '订单状态: pending(待支付), processing(进行中), completed(已完成), cancelled(已取消)',
  `pay_time` DATETIME COMMENT '支付时间',
  `confirm_time` DATETIME COMMENT '确认完成时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_order_no`(`order_no`),
  INDEX `idx_customer_id`(`customer_id`),
  INDEX `idx_store_id`(`store_id`),
  INDEX `idx_appointment_id`(`appointment_id`)
);
```

### 8. attendances - 考勤表
```sql
CREATE TABLE `attendances` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `employee_id` BIGINT UNSIGNED NOT NULL COMMENT '员工ID',
  `date` DATE NOT NULL COMMENT '考勤日期',
  `check_in` DATETIME COMMENT '上班打卡时间',
  `check_out` DATETIME COMMENT '下班打卡时间',
  `check_in_type` VARCHAR(20) COMMENT '上班打卡方式: face(人脸), gps(GPS)',
  `check_out_type` VARCHAR(20) COMMENT '下班打卡方式',
  `status` VARCHAR(20) DEFAULT 'normal' COMMENT '状态: normal(正常), late(迟到), leave(请假), absent(缺勤)',
  `notes` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_employee_date`(`employee_id`, `date`),
  INDEX `idx_employee_id`(`employee_id`),
  INDEX `idx_date`(`date`)
);
```

### 9. check_ins - 客户签到表
```sql
CREATE TABLE `check_ins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `store_id` BIGINT UNSIGNED NOT NULL COMMENT '门店ID',
  `appointment_id` BIGINT UNSIGNED COMMENT '关联预约ID',
  `check_in_time` DATETIME NOT NULL COMMENT '签到时间',
  `check_in_type` VARCHAR(20) DEFAULT 'manual' COMMENT '签到方式: face(人脸), qrcode(扫码), manual(手动)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_customer_id`(`customer_id`),
  INDEX `idx_store_id`(`store_id`),
  INDEX `idx_check_in_time`(`check_in_time`)
);
```

### 10. admin_users - 管理员用户表
```sql
CREATE TABLE `admin_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `name` VARCHAR(50) COMMENT '姓名',
  `role` VARCHAR(20) DEFAULT 'admin' COMMENT '角色: super_admin(超级管理员), admin(管理员)',
  `store_id` BIGINT UNSIGNED COMMENT '所属门店(门店管理员)',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_username`(`username`)
);
```

---

## 核心业务逻辑实现

### 预约冲突检测 (SQL)
```sql
-- 检查技师在某时段是否已被预约
SELECT COUNT(*) FROM appointments 
WHERE employee_id = ? 
  AND appointment_date = ? 
  AND appointment_time < DATE_ADD(?, INTERVAL duration_hours HOUR)
  AND appointment_time > DATE_SUB(?, INTERVAL duration_hours HOUR)
  AND status NOT IN ('cancelled');
```

### 索引优化
- `appointments` 表的 `(employee_id, appointment_date, appointment_time)` 组合索引用于冲突检测
- `orders` 表的 `order_no` 唯一索引用于订单查询
- 各表的 `status` 索引用于状态筛选
