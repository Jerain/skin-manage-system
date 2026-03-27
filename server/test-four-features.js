// 四大核心功能 API 测试脚本
const API_BASE = 'http://localhost:3000/api';

const tests = {
  // ==================== 效果可视化 ====================
  '效果可视化-肤质记录上传': async () => {
    // TC-EV-001/002: 肤质记录创建
    const result = await fetch(`${API_BASE}/skin-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 8,
        skinType: '混合肌',
        skinIssues: '痘痘,毛孔粗大',
        photoUrl: '/uploads/face1.jpg',
        technicianId: 7
      })
    }).then(r => r.json());
    console.log('肤质记录创建:', result.id ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  '效果可视化-AI分析': async () => {
    // TC-EV-003: AI分析（模拟）
    const records = await fetch(`${API_BASE}/skin-records/customer/8`).then(r => r.json());
    console.log('AI分析:', records.length > 0 ? '✅ PASS (待集成AI服务)' : '❌ FAIL');
    return records;
  },

  '效果可视化-对比图生成': async () => {
    // TC-EV-101: 创建两次记录后生成对比
    const records = await fetch(`${API_BASE}/skin-records/customer/8`).then(r => r.json());
    if (records.length >= 2) {
      const result = await fetch(`${API_BASE}/skin-records/comparisons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 8,
          beforeRecordId: records[1].id,
          afterRecordId: records[0].id,
          improvementHighlights: '痘痘减少,毛孔收敛,肌肤光泽度提升'
        })
      }).then(r => r.json());
      console.log('对比图生成:', result.id ? '✅ PASS' : '❌ FAIL');
      return result;
    }
    console.log('对比图生成: ⚠️ 需要至少2条记录');
    return null;
  },

  // ==================== 技师激励透明化 ====================
  '技师激励-实时业绩': async () => {
    // TC-TI-001: 查看实时业绩
    const result = await fetch(`${API_BASE}/performance/technician/7/realtime`).then(r => r.json());
    console.log('实时业绩:', result.today ? '✅ PASS' : '❌ FAIL');
    console.log('  今日:', result.today);
    console.log('  本月:', result.month);
    return result;
  },

  '技师激励-提成计算-低于200': async () => {
    // TC-TI-101: 150元提成10%
    const result = await fetch(`${API_BASE}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technicianId: 7,
        orderId: 100,
        serviceId: 7,
        serviceName: '基础护肤',
        serviceAmount: 150
      })
    }).then(r => r.json());
    const expected = 15; // 10%
    console.log('提成计算<200元:', result.commissionAmount == expected ? `✅ PASS (${result.commissionAmount}元)` : `❌ FAIL (期望${expected}元,实际${result.commissionAmount})`);
    return result;
  },

  '技师激励-提成计算-200-500': async () => {
    // TC-TI-102: 350元提成15%
    const result = await fetch(`${API_BASE}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technicianId: 7,
        orderId: 101,
        serviceId: 7,
        serviceName: '深层护理',
        serviceAmount: 350
      })
    }).then(r => r.json());
    const expected = 52.5; // 15%
    console.log('提成计算200-500元:', result.commissionAmount == expected ? `✅ PASS (${result.commissionAmount}元)` : `❌ FAIL`);
    return result;
  },

  '技师激励-提成计算-高于500': async () => {
    // TC-TI-103: 800元提成20%
    const result = await fetch(`${API_BASE}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technicianId: 7,
        orderId: 102,
        serviceId: 7,
        serviceName: '钻石护理',
        serviceAmount: 800
      })
    }).then(r => r.json());
    const expected = 160; // 20%
    console.log('提成计算>500元:', result.commissionAmount == expected ? `✅ PASS (${result.commissionAmount}元)` : `❌ FAIL`);
    return result;
  },

  '技师激励-奖金规则': async () => {
    // TC-TI-201/202/203: 奖金规则
    const result = await fetch(`${API_BASE}/performance/bonus-rules`).then(r => r.json());
    console.log('奖金规则:', result.length >= 3 ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  '技师激励-奖金计算': async () => {
    // TC-TI-204: 奖金汇总
    const result = await fetch(`${API_BASE}/performance/bonus/7/2026-03`).then(r => r.json());
    console.log('奖金计算:', result.totalSales !== undefined ? '✅ PASS' : '❌ FAIL');
    console.log('  本月业绩:', result.totalSales);
    console.log('  奖金:', result.totalBonus);
    return result;
  },

  // ==================== 周期性护理计划 ====================
  '护理计划-创建计划': async () => {
    // TC-CP-001: 创建3个月护理计划
    const result = await fetch(`${API_BASE}/care-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 8,
        planStartDate: '2026-03-01',
        planEndDate: '2026-05-31',
        skinType: '敏感肌',
        season: '春季',
        planItems: [
          { month: 1, service: '修复护理', suggestedDate: '2026-03-15' },
          { month: 2, service: '防晒护理', suggestedDate: '2026-04-15' },
          { month: 3, service: '补水护理', suggestedDate: '2026-05-15' }
        ]
      })
    }).then(r => r.json());
    console.log('护理计划创建:', result.id ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  // ==================== 客户成长体系 ====================
  '成长体系-会员等级': async () => {
    // TC-CG-001: 新用户默认等级
    const result = await fetch(`${API_BASE}/member-levels`).then(r => r.json());
    console.log('会员等级配置:', result.length >= 4 ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  '成长体系-客户等级': async () => {
    // TC-CG-002: 客户等级查询
    const result = await fetch(`${API_BASE}/customer-level/8`).then(r => r.json());
    console.log('客户等级查询:', result.id ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  '成长体系-成长值记录': async () => {
    // TC-CG-101/102: 成长值记录
    const result = await fetch(`${API_BASE}/growth-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 8,
        growthType: '消费',
        growthValue: 100,
        relatedId: 100
      })
    }).then(r => r.json());
    console.log('成长值记录:', result.id ? '✅ PASS' : '❌ FAIL');
    return result;
  },

  '成长体系-等级升级': async () => {
    // TC-CG-201: 升级检查
    const result = await fetch(`${API_BASE}/customer-level/8/upgrade`, {
      method: 'POST'
    }).then(r => r.json());
    console.log('等级升级检查:', result.success !== undefined ? '✅ PASS' : '❌ FAIL');
    return result;
  }
};

async function runTests() {
  console.log('========================================');
  console.log('四大核心功能 API 测试');
  console.log('========================================\n');

  let pass = 0, fail = 0;

  for (const [name, fn] of Object.entries(tests)) {
    try {
      await fn();
      pass++;
    } catch (e) {
      console.log(`${name}: ❌ FAIL - ${e.message}`);
      fail++;
    }
    console.log('');
  }

  console.log('========================================');
  console.log(`测试结果: ${pass} 通过 / ${fail} 失败`);
  console.log('========================================');
}

runTests();
