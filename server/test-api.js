#!/usr/bin/env node

/**
 * 皮肤管理门店小程序 - API 测试脚本
 * 测试核心业务逻辑：预约冲突检测、支付流程、考勤
 */

const BASE_URL = 'http://localhost:3000/api';

// 模拟 HTTP 请求
const request = async (url, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(BASE_URL + url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    });
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error('Request error:', error.message);
    return { status: 0, error: error.message };
  }
};

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

const logTest = (name, passed, message = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name} ${message}`);
  testResults.details.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
};

// ==================== 测试用例 ====================

async function runTests() {
  console.log('========================================');
  console.log('皮肤管理门店小程序 - API 测试');
  console.log('========================================\n');

  let adminToken = null;
  let customerToken = null;
  let employeeToken = null;
  let storeId = null;
  let employeeId = null;
  let customerId = null;
  let serviceId = null;
  let appointmentId = null;

  // ==================== 1. 管理后台登录 ====================
  console.log('\n--- 测试：管理后台登录 (TC-W-001) ---');
  
  // 先创建管理员账号
  await request('/admin', 'POST', {
    username: 'admin',
    password: 'admin123',
    name: '超级管理员',
    role: 'super_admin'
  });

  const loginRes = await request('/auth/admin/login', 'POST', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (loginRes.status === 200 && loginRes.data.access_token) {
    adminToken = loginRes.data.access_token;
    logTest('管理员登录', true, `token: ${adminToken.substring(0, 20)}...`);
  } else {
    logTest('管理员登录', false, JSON.stringify(loginRes.data));
  }

  // ==================== 2. 门店管理 ====================
  console.log('\n--- 测试：门店管理 (TC-W-101, TC-W-102) ---');
  
  // 创建门店
  const storeRes = await request('/stores', 'POST', {
    name: '测试皮肤管理店',
    address: '北京市朝阳区测试路123号',
    phone: '010-12345678',
    businessHours: '09:00-21:00',
    description: '专业皮肤管理门店'
  }, adminToken);
  
  if (storeRes.status === 201 || storeRes.status === 200) {
    storeId = storeRes.data.id;
    logTest('创建门店', true, `storeId: ${storeId}`);
  } else {
    logTest('创建门店', false, JSON.stringify(storeRes.data));
  }

  // 获取门店列表
  const storeListRes = await request('/stores', 'GET', null, adminToken);
  logTest('门店列表查询', storeListRes.status === 200, `count: ${storeListRes.data?.length || 0}`);

  // ==================== 3. 员工管理 ====================
  console.log('\n--- 测试：员工管理 (TC-W-201, TC-W-202) ---');
  
  // 创建员工
  const employeeRes = await request('/employees', 'POST', {
    storeId: storeId,
    name: '测试技师',
    phone: '13800138000',
    password: 'password123',
    role: 'technician',
    position: '高级技师'
  }, adminToken);
  
  if (employeeRes.status === 201 || employeeRes.status === 200) {
    employeeId = employeeRes.data.id;
    logTest('创建员工', true, `employeeId: ${employeeId}`);
  } else {
    logTest('创建员工', false, JSON.stringify(employeeRes.data));
  }

  // 员工登录
  const empLoginRes = await request('/auth/employee/login', 'POST', {
    phone: '13800138000',
    password: 'password123'
  });
  
  if (empLoginRes.status === 200 && empLoginRes.data.access_token) {
    employeeToken = empLoginRes.data.access_token;
    logTest('员工登录', true);
  } else {
    logTest('员工登录', false, JSON.stringify(empLoginRes.data));
  }

  // ==================== 4. 客户管理 ====================
  console.log('\n--- 测试：客户管理 (TC-W-301) ---');
  
  // 创建客户
  const customerRes = await request('/customers', 'POST', {
    name: '测试客户',
    phone: '13900139000',
    password: 'password123',
    skinType: '混合肌'
  });
  
  if (customerRes.status === 201 || customerRes.status === 200) {
    customerId = customerRes.data.id;
    logTest('创建客户', true, `customerId: ${customerId}`);
  } else {
    logTest('创建客户', false, JSON.stringify(customerRes.data));
  }

  // 客户登录
  const custLoginRes = await request('/auth/customer/login', 'POST', {
    phone: '13900139000',
    password: 'password123'
  });
  
  if (custLoginRes.status === 200 && custLoginRes.data.access_token) {
    customerToken = custLoginRes.data.access_token;
    logTest('客户登录', true);
  } else {
    logTest('客户登录', false, JSON.stringify(custLoginRes.data));
  }

  // ==================== 5. 服务项目管理 ====================
  console.log('\n--- 测试：服务项目管理 (TC-W-401, TC-W-402) ---');
  
  // 先创建服务分类
  const categoryRes = await request('/services/categories', 'POST', {
    name: '补水护理',
    sortOrder: 1
  }, adminToken);
  
  // 创建服务项目
  const serviceRes = await request('/services', 'POST', {
    categoryId: categoryRes.data?.id || 1,
    storeId: storeId,
    name: '深层补水护理',
    price: 299,
    duration: 60,
    description: '为肌肤补充水分，改善干燥',
    isFeatured: 1
  }, adminToken);
  
  if (serviceRes.status === 201 || serviceRes.status === 200) {
    serviceId = serviceRes.data.id;
    logTest('创建服务项目', true, `serviceId: ${serviceId}`);
  } else {
    logTest('创建服务项目', false, JSON.stringify(serviceRes.data));
  }

  // ==================== 6. 预约冲突检测 (TC-C-405) - 核心测试 ====================
  console.log('\n--- 测试：预约冲突检测 (TC-C-405) - 核心测试 ---');
  
  const today = new Date().toISOString().split('T')[0];
  
  // 第一次预约 - 应该成功
  const apt1Res = await request('/appointments', 'POST', {
    customerId: customerId,
    storeId: storeId,
    employeeId: employeeId,
    serviceId: serviceId,
    appointmentDate: today,
    appointmentTime: '14:00',
    durationHours: 1
  }, customerToken);
  
  if (apt1Res.status === 201 || apt1Res.status === 200) {
    appointmentId = apt1Res.data.id;
    logTest('预约创建-第一次', true, `appointmentId: ${appointmentId}`);
  } else {
    logTest('预约创建-第一次', false, JSON.stringify(apt1Res.data));
  }

  // 第二次预约同一技师同一时段 - 应该失败（冲突检测）
  const apt2Res = await request('/appointments', 'POST', {
    customerId: customerId,
    storeId: storeId,
    employeeId: employeeId,
    serviceId: serviceId,
    appointmentDate: today,
    appointmentTime: '14:00',  // 同一时间
    durationHours: 1
  }, customerToken);
  
  logTest('预约冲突检测-同一时段', apt2Res.status === 400 || apt2Res.status === 409, 
    apt2Res.status === 400 || apt2Res.status === 409 ? '正确拒绝冲突预约' : '应该拒绝但没有');

  // 预约不同时间段 - 应该成功
  const apt3Res = await request('/appointments', 'POST', {
    customerId: customerId,
    storeId: storeId,
    employeeId: employeeId,
    serviceId: serviceId,
    appointmentDate: today,
    appointmentTime: '16:00',  // 不同时间
    durationHours: 1
  }, customerToken);
  
  logTest('预约创建-不同时段', apt3Res.status === 201 || apt3Res.status === 200);

  // ==================== 7. 预约管理 ====================
  console.log('\n--- 测试：预约管理 (TC-S-301, TC-S-302, TC-S-303) ---');
  
  // 确认预约
  if (appointmentId) {
    const confirmRes = await request(`/appointments/${appointmentId}/confirm`, 'PUT', {}, employeeToken);
    logTest('确认预约', confirmRes.status === 200);
  }

  // 拒绝预约
  const rejectAptId = apt3Res.data?.id;
  if (rejectAptId) {
    const rejectRes = await request(`/appointments/${rejectAptId}/reject`, 'PUT', { reason: '技师请假' }, employeeToken);
    logTest('拒绝预约', rejectRes.status === 200);
  }

  // ==================== 8. 订单与支付 ====================
  console.log('\n--- 测试：订单与支付 (TC-C-504, TC-C-506) ---');
  
  // 创建订单
  const orderRes = await request('/orders', 'POST', {
    customerId: customerId,
    storeId: storeId,
    serviceId: serviceId,
    appointmentId: appointmentId,
    employeeId: employeeId,
    amount: 299,
    payType: 'balance'
  }, customerToken);
  
  const orderId = orderRes.data?.id;
  logTest('创建订单', orderRes.status === 201 || orderRes.status === 200, `orderId: ${orderId}`);

  // 余额支付
  if (orderId) {
    // 先给客户充值
    await request(`/customers/${customerId}`, 'PUT', { balance: 1000 }, adminToken);
    
    const payRes = await request(`/orders/${orderId}/pay`, 'POST', { payType: 'balance' }, customerToken);
    logTest('余额支付', payRes.status === 200);
  }

  // ==================== 9. 员工考勤 ====================
  console.log('\n--- 测试：员工考勤 (TC-S-101, TC-S-104) ---');
  
  // 上班打卡
  const checkInRes = await request('/attendance/check-in', 'POST', {
    employeeId: employeeId,
    type: 'face'
  }, employeeToken);
  
  logTest('上班打卡', checkInRes.status === 201 || checkInRes.status === 200);

  // 下班打卡
  const checkOutRes = await request('/attendance/check-out', 'POST', {
    employeeId: employeeId,
    type: 'face'
  }, employeeToken);
  
  logTest('下班打卡', checkOutRes.status === 201 || checkOutRes.status === 200);

  // 今日考勤查询
  const todayAttRes = await request(`/attendance/today/${employeeId}`, 'GET', null, employeeToken);
  logTest('今日考勤查询', todayAttRes.status === 200);

  // ==================== 10. 客户签到 ====================
  console.log('\n--- 测试：客户签到 (TC-S-201, TC-S-202) ---');
  
  const checkInCustomerRes = await request('/attendance/check-ins', 'POST', {
    customerId: customerId,
    storeId: storeId,
    type: 'manual'
  }, employeeToken);
  
  logTest('客户签到', checkInCustomerRes.status === 201 || checkInCustomerRes.status === 200);

  // ==================== 测试结果汇总 ====================
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`📊 总计: ${testResults.passed + testResults.failed}`);
  console.log('========================================\n');

  return testResults;
}

// 执行测试
runTests().catch(console.error);
