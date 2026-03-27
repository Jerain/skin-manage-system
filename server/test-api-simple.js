const request = async (url, method = 'GET', data = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch('http://localhost:3000/api' + url, { method, headers, body: data ? JSON.stringify(data) : null });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: json, hasToken: !!json?.access_token };
  } catch (e) { return { ok: false, error: e.message }; }
};

let pass = 0, fail = 0;
const log = (n, ok, msg = '') => (ok ? pass++ : fail++, console.log(`${ok ? '✅' : '❌'} ${n} - ${msg}`));

(async () => {
  console.log('=== 预约冲突检测测试 ===\n');

  // 创建测试数据
  const admin = await request('/auth/admin/login', 'POST', { username: 'admin', password: 'admin123' });
  const token = admin.data?.access_token || admin.data?.admin?.id;
  
  const store = await request('/stores', 'POST', { name: '测试店', phone: '1', address: '1' }, token);
  const storeId = store.data?.id;
  
  const emp = await request('/employees', 'POST', { storeId, name: '技师', phone: '13800000001', password: '1', role: 'technician' }, token);
  const empId = emp.data?.id;
  
  const cust = await request('/customers', 'POST', { name: '客户', phone: '13900000001', password: '1' });
  const custId = cust.data?.id;
  
  const svc = await request('/services', 'POST', { categoryId: 1, storeId, name: '护肤', price: 100, duration: 60 }, token);
  const svcId = svc.data?.id;
  
  const custLogin = await request('/auth/customer/login', 'POST', { phone: '13900000001', password: '1' });
  const custToken = custLogin.data?.access_token;

  console.log('测试数据创建完成\n---');

  // 第一次预约 - 应该成功
  const apt1 = await request('/appointments', 'POST', {
    customerId: custId, storeId, employeeId: empId, serviceId: svcId,
    appointmentDate: '2026-03-20', appointmentTime: '14:00'
  }, custToken);
  log('预约创建(第一次)', apt1.ok || apt1.status===201, apt1.data?.id ? `id=${apt1.data.id}` : '');
  
  // 同一时段第二次预约 - 应该失败（冲突）
  const apt2 = await request('/appointments', 'POST', {
    customerId: custId, storeId, employeeId: empId, serviceId: svcId,
    appointmentDate: '2026-03-20', appointmentTime: '14:00'  // 同一时间
  }, custToken);
  log('预约冲突检测(同一时段)', !apt2.ok || apt2.status===400, !apt2.ok ? '正确拒绝' : '错误:应该拒绝');

  // 不同时间段预约 - 应该成功
  const apt3 = await request('/appointments', 'POST', {
    customerId: custId, storeId, employeeId: empId, serviceId: svcId,
    appointmentDate: '2026-03-20', appointmentTime: '16:00'  // 不同时间
  }, custToken);
  log('预约创建(不同时段)', apt3.ok || apt3.status===201, apt3.data?.id ? `id=${apt3.data.id}` : '');

  console.log(`\n=== 结果: ${pass}通过 / ${fail}失败 ===`);
})();
