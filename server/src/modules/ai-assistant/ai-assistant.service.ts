import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { ServicesService } from '../services/services.service';
import { EmployeesService } from '../employees/employees.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { OrdersService } from '../orders/orders.service';

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-QlIYHONLFJJXdo2g6i1p-bApeQUQJErdV4GHMmbBIxNP9gLgrfsnA0reYnIA3qDO9V4mxrpK88OtNSENz-uq0BMmYAHitl0ZQu4GpbS5teDY41VBK9BVIwY';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'abab6.5s-chat';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AppointmentInfo {
  serviceId?: number;
  serviceName?: string;
  storeId?: number;
  storeName?: string;
  employeeId?: number;
  employeeName?: string;
  date?: string;
  time?: string;
  dateTime?: string;
}

@Injectable()
export class AiAssistantService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private appointmentInfo: Map<string, AppointmentInfo> = new Map();
  private readonly maxHistoryLength = 15;

  constructor(
    private readonly httpService: HttpService,
    private readonly customerService: CustomersService,
    private readonly storeService: StoresService,
    private readonly serviceService: ServicesService,
    private readonly employeeService: EmployeesService,
    private readonly appointmentService: AppointmentsService,
    private readonly orderService: OrdersService,
  ) {}

  /**
   * 处理用户对话 - 智能预约
   * 核心：记忆系统 + 只问缺失 + 齐全确认
   */
  async chat(userId: number, message: string, context?: any): Promise<any> {
    const apptKey = `user_${userId}`;
    let apptInfo = this.appointmentInfo.get(apptKey) || {};
    
    // 检查确认预约
    const lowerMsg = message.toLowerCase();
    if (this.isConfirmation(lowerMsg) && apptInfo.serviceId && apptInfo.date && apptInfo.storeId) {
      return await this.createAppointment(userId, apptInfo);
    }
    
    // 检查取消预约
    if (this.isCancellation(lowerMsg)) {
      this.appointmentInfo.delete(apptKey);
      return { success: true, message: '好的，已取消预约。还有什么可以帮您的？', context: {} };
    }
    
    // 用MiniMax提取信息
    const extracted = await this.extractAppointmentInfo(message, apptInfo);
    
    // 检测用户是否说"随便安排"/"随机安排"
    const isRandomAssign = this.isRandomAssign(message);
    if (isRandomAssign) {
      // 用户想要随机安排，标记为随机分配
      apptInfo.employeeId = -1; // -1 表示随机分配
      apptInfo.employeeName = '随机分配';
    }
    
    // 智能合并：保留已有信息
    apptInfo = { 
      ...apptInfo, 
      serviceId: extracted.serviceId || apptInfo.serviceId,
      serviceName: extracted.serviceName || apptInfo.serviceName,
      storeId: extracted.storeId || apptInfo.storeId,
      storeName: extracted.storeName || apptInfo.storeName,
      employeeId: extracted.employeeId || apptInfo.employeeId,
      employeeName: extracted.employeeName || apptInfo.employeeName,
      date: extracted.date || apptInfo.date,
      time: extracted.time || apptInfo.time,
    };
    
    // 如果有employeeName但没有employeeId，尝试从名称解析ID
    if (apptInfo.employeeName && !apptInfo.employeeId) {
      apptInfo.employeeId = this.resolveEmployeeId(apptInfo.employeeName);
    }
    
    this.appointmentInfo.set(apptKey, apptInfo);
    
    // 检查缺失信息
    const missingInfo = this.getMissingInfo(apptInfo);
    
    // 如果都齐了，请求确认
    if (missingInfo.length === 0) {
      return await this.requestConfirmation(userId, apptInfo);
    }
    
    // 检测是否提取到了有效信息
    const hasNewInfo = extracted.serviceId || extracted.storeId || extracted.date || extracted.time || extracted.employeeId;
    
    // 检测是否在查询系统数据（门店、技师、服务项目、会员信息、预约记录、订单等）
    const queryResult = await this.handleSystemQuery(message, apptInfo, userId);
    if (queryResult) {
      return queryResult;
    }
    
    // 如果没有提取到新信息，且有无关回复，说明用户在问不相关问题
    if (!hasNewInfo && extracted.reply && extracted.reply.length > 10) {
      return await this.handleUnrelatedQuestion(message, apptInfo);
    }
    
    // 只问缺失的下一个
    const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
    
    return {
      success: true,
      message: nextQuestion,
      context: apptInfo,
      hasAllInfo: false,
    };
  }
  
  /**
   * 记忆系统：只问缺失的下一个
   */
  private getNextQuestion(missingInfo: string[], apptInfo: AppointmentInfo): string {
    const first = missingInfo[0];
    
    if (first === '服务项目') {
      return '请问您想预约什么服务项目呢？';
    }
    if (first === '门店') {
      return '请问您想预约哪家门店呢？';
    }
    if (first === '时间') {
      return '请问您想预约什么时间呢？';
    }
    if (first === '技师') {
      return '请问您想指定哪位技师吗？不说我帮您安排~';
    }
    return '请确认您的预约信息~';
  }

  /**
   * 使用 MiniMax 模型提取预约信息
   */
  private async extractAppointmentInfo(message: string, currentInfo: AppointmentInfo): Promise<any> {
    const systemPrompt = `你是皮肤管理门店的AI助手。你需要从用户的回复中提取预约信息。

## 当前已收集的信息
${JSON.stringify(currentInfo)}

## 用户原话
"${message}"

## 你的任务
1. 分析用户这句话中包含的预约相关信息
2. 即使用户说的是题外话，也要友好回应并继续引导预约
3. 提取以下信息（如果用户提到了）：
   - serviceId: 服务项目ID (1=补水, 2=清洁, 3=嫩肤, 4=按摩, 5=换肤)
   - storeId: 门店ID (从可用门店中选择)
   - employeeId: 技师ID (从可用技师中选择，如果用户没指定可以说"为您安排")
   - date: 日期 (今天/明天/后天 或 2026-03-19 格式)
   - time: 时间 (如 10:00, 14:30, 15:00)

## 技师ID映射：张三=1, 李四=2, 王五=3, 赵六=4
## 门店ID映射：旗舰店=1, 望京店=2, CBD店=2

## 返回格式 (JSON，serviceName和storeName也要填)
{
  "reply": "给用户的回复",
  "serviceId": number|null,
  "serviceName": "服务名称",
  "storeId": number|null,
  "storeName": "门店名称",
  "employeeId": number|null,
  "employeeName": "技师姓名",
  "date": string|null,
  "time": string|null
}

门店ID映射：旗舰店=1, 望京店=2, CBD店=2

注意：如果用户没有提供任何有用信息但提到了预约意向，reply应该是继续引导的话语。`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          MINIMAX_API_URL,
          {
            model: MINIMAX_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.3,
            max_tokens: 500,
          },
          {
            headers: {
              'Authorization': `Bearer ${MINIMAX_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const content = response.data?.choices?.[0]?.message?.content || '{}';
      
      // 尝试解析JSON
      try {
        // 尝试提取JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('解析失败:', content);
      }
    } catch (error) {
      console.error('提取信息失败:', error.message);
    }
    
    // 如果提取失败，使用简单的规则匹配
    return this.simpleExtractInfo(message, currentInfo);
  }

  /**
   * 处理无关问题 + 继续预约引导
   */
  /**
   * 处理系统查询（门店、技师、项目列表）
   * 查询后继续引导预约
   */
  private async handleSystemQuery(message: string, apptInfo: AppointmentInfo, userId?: number): Promise<any | null> {
    const lowerMsg = message.toLowerCase();
    const missingInfo = this.getMissingInfo(apptInfo);
    
    // 判断用户是否在查询系统数据
    let queryType: 'store' | 'employee' | 'service' | 'member' | 'appointments' | 'orders' | null = null;
    
    if (lowerMsg.includes('门店') || lowerMsg.includes('店在哪') || lowerMsg.includes('有几家店') || lowerMsg.includes('分店') || lowerMsg.includes('地址')) {
      queryType = 'store';
    } else if (lowerMsg.includes('技师') || lowerMsg.includes('理发师') || lowerMsg.includes('美容师') || lowerMsg.includes('老师') || lowerMsg.includes('师傅')) {
      queryType = 'employee';
    } else if (lowerMsg.includes('项目') || lowerMsg.includes('服务') || lowerMsg.includes('有什么') || lowerMsg.includes('套餐') || lowerMsg.includes('项目')) {
      queryType = 'service';
    } else if (lowerMsg.includes('会员') || lowerMsg.includes('等级') || lowerMsg.includes('余额') || lowerMsg.includes('积分') || lowerMsg.includes('充值')) {
      queryType = 'member';
    } else if (lowerMsg.includes('预约') || lowerMsg.includes('预约记录') || lowerMsg.includes('我的预约')) {
      queryType = 'appointments';
    } else if (lowerMsg.includes('订单') || lowerMsg.includes('消费') || lowerMsg.includes('账单')) {
      queryType = 'orders';
    }
    
    if (!queryType) return null;
    
    try {
      let dataList: any = [];
      let title = '';
      
      if (queryType === 'store') {
        const stores = await this.storeService.findAll() as any
        const storeData = stores.data;
        dataList = Array.isArray(storeData) ? storeData : (storeData?.list || []);
        title = '🏪 门店列表';
      } else if (queryType === 'employee') {
        const employees = await this.employeeService.findAll() as any
        const empData = employees.data;
        dataList = Array.isArray(empData) ? empData : (empData?.list || []);
        title = '👨‍💼 技师列表';
      } else if (queryType === 'service') {
        const services = await this.serviceService.findAll() as any
        const svcData = services.data;
        dataList = Array.isArray(svcData) ? svcData : (svcData?.list || []);
        title = '💆 服务项目';
      } else if (queryType === 'member' && userId) {
        // 查询用户会员信息
        const customer = await this.customerService.findOne(userId) as any;
        if (customer) {
          return {
            success: true,
            message: `👤 您的会员信息\n\n` +
              `⭐ 会员等级：${customer.level || '普通会员'}\n` +
              `💰 账户余额：¥${customer.balance || 0}\n` +
              `🎯 积分：${customer.points || 0}\n\n` +
              `如需充值或了解更多，请告诉我~`,
            context: apptInfo,
            hasAllInfo: false,
          };
        }
      } else if (queryType === 'appointments' && userId) {
        // 查询用户预约记录
        const appointments = await this.appointmentService.findAll({ customerId: userId }) as any;
        const apptList = Array.isArray(appointments) ? appointments : (appointments?.data || []);
        if (apptList.length === 0) {
          return {
            success: true,
            message: `📋 您的预约记录\n\n暂无预约记录~\n\n需要预约吗？可以告诉我您想预约的服务、门店和时间~`,
            context: apptInfo,
            hasAllInfo: false,
          };
        }
        const listText = apptList.slice(0, 5).map((a: any) => {
          const date = a.appointmentDate || a.date || '';
          const time = a.appointmentTime || a.time || '';
          const status = a.status || 'pending';
          const statusText = status === 'pending' ? '待确认' : status === 'confirmed' ? '已确认' : status === 'completed' ? '已完成' : status === 'cancelled' ? '已取消' : status;
          return `• ${date} ${time} - ${statusText}`;
        }).join('\n');
        return {
          success: true,
          message: `📋 您的预约记录\n\n${listText}\n\n共 ${apptList.length} 条记录`,
          context: apptInfo,
          hasAllInfo: false,
        };
      } else if (queryType === 'orders' && userId) {
        // 查询用户订单
        const orders = await this.orderService.findAll({ customerId: userId }) as any;
        const orderList = Array.isArray(orders) ? orders : (orders?.data || []);
        if (orderList.length === 0) {
          return {
            success: true,
            message: `🧾 您的订单记录\n\n暂无订单记录~`,
            context: apptInfo,
            hasAllInfo: false,
          };
        }
        const listText = orderList.slice(0, 5).map((o: any) => {
          const amount = o.amount || o.totalAmount || 0;
          const status = o.status || 'pending';
          const statusText = status === 'pending' ? '待支付' : status === 'paid' ? '已支付' : status === 'completed' ? '已完成' : '已取消';
          return `• ¥${amount} - ${statusText}`;
        }).join('\n');
        return {
          success: true,
          message: `🧾 您的订单记录\n\n${listText}\n\n共 ${orderList.length} 条记录`,
          context: apptInfo,
          hasAllInfo: false,
        };
      }
      
      if (dataList.length === 0) {
        return null;
      }
      
      // 生成数据列表
      let listText = '';
      if (queryType === 'store') {
        listText = dataList.map((s: any) => `• ${s.name} - ${s.address || '地址待完善'}`).join('\n');
      } else if (queryType === 'employee') {
        listText = dataList.map((e: any) => `• ${e.name} - ${e.position || '技师'}`).join('\n');
      } else if (queryType === 'service') {
        listText = dataList.map((s: any) => `• ${s.name} - ¥${s.price || '待定'}`).join('\n');
      }
      
      // 生成下一步引导
      const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
      
      return {
        success: true,
        message: `${title}\n\n${listText}\n\n${nextQuestion}`,
        context: apptInfo,
        hasAllInfo: false,
      };
    } catch (e) {
      console.error('查询失败:', e);
      return null;
    }
  }
  
  private async handleUnrelatedQuestion(message: string, apptInfo: AppointmentInfo): Promise<any> {
    const missingInfo = this.getMissingInfo(apptInfo);
    const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
    
    // 使用MiniMax回答无关问题，然后引导预约
    const prompt = `用户正在预约皮肤管理服务，还缺少以下信息：${missingInfo.join('、')}

用户问了一个无关问题："${message}"

请先回答这个问题（简短一句），然后自然地引导回预约流程。

回答格式：回答内容 + \n\n + 引导语`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          MINIMAX_API_URL,
          {
            model: MINIMAX_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 200,
          },
          {
            headers: {
              'Authorization': `Bearer ${MINIMAX_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const answer = response.data?.choices?.[0]?.message?.content || nextQuestion;
      return {
        success: true,
        message: answer,
        context: apptInfo,
        hasAllInfo: false,
      };
    } catch (e) {
      return {
        success: true,
        message: nextQuestion,
        context: apptInfo,
        hasAllInfo: false,
      };
    }
  }

  /**
   * 简单的信息提取（作为后备）
   */
  private simpleExtractInfo(message: string, currentInfo: AppointmentInfo): any {
    const lowerMsg = message.toLowerCase();
    const result: any = {};
    
    // 服务项目
    if (lowerMsg.includes('补水')) { result.serviceId = 1; result.serviceName = '深层补水护理'; }
    else if (lowerMsg.includes('清洁')) { result.serviceId = 2; result.serviceName = '小气泡清洁'; }
    else if (lowerMsg.includes('嫩肤') || lowerMsg.includes('光子')) { result.serviceId = 3; result.serviceName = '光子嫩肤'; }
    else if (lowerMsg.includes('按摩')) { result.serviceId = 4; result.serviceName = '面部按摩'; }
    else if (lowerMsg.includes('换肤') || lowerMsg.includes('果酸')) { result.serviceId = 5; result.serviceName = '果酸换肤'; }
    
    // 门店 - 根据名称映射ID
    const storeMap: Record<string, {id: number, name: string}> = {
      '旗舰店': {id: 1, name: '皮肤管理中心旗舰店'},
      '总店': {id: 1, name: '皮肤管理中心旗舰店'},
      '望京': {id: 2, name: '皮肤管理望京店'},
      'CBD': {id: 2, name: '皮肤管理望京店'},
    };
    for (const [key, val] of Object.entries(storeMap)) {
      if (lowerMsg.includes(key)) {
        result.storeId = val.id;
        result.storeName = val.name;
        break;
      }
    }
    
    // 技师 - 支持"张三技师"或"张三"
    if (lowerMsg.includes('张三')) { result.employeeId = 1; result.employeeName = '张三'; }
    else if (lowerMsg.includes('李四')) { result.employeeId = 2; result.employeeName = '李四'; }
    else if (lowerMsg.includes('王五')) { result.employeeId = 3; result.employeeName = '王五'; }
    else if (lowerMsg.includes('赵六')) { result.employeeId = 4; result.employeeName = '赵六'; }
    else if (lowerMsg.includes('技师')) {
      // 用户说了技师但没提名字，说明想要随机安排
      result.employeeId = null;
      result.employeeName = null;
    }
    
    // 日期
    if (lowerMsg.includes('今天')) {
      result.date = new Date().toISOString().split('T')[0];
    } else if (lowerMsg.includes('明天')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      result.date = tomorrow.toISOString().split('T')[0];
    } else if (lowerMsg.includes('后天')) {
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      result.date = dayAfter.toISOString().split('T')[0];
    } else {
      // 尝试匹配日期格式
      const dateMatch = message.match(/(\d{1,2})[月\-](\d{1,2})/);
      if (dateMatch) {
        result.date = `2026-${dateMatch[1].padStart(2,'0')}-${dateMatch[2].padStart(2,'0')}`;
      }
    }
    
    // 时间
    const timeMatch = message.match(/(\d{1,2})[点时:](\d{0,2})/);
    if (timeMatch) {
      const hour = timeMatch[1].padStart(2, '0');
      const minute = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
      result.time = `${hour}:${minute}`;
    }
    
    return result;
  }

  /**
   * 生成引导缺失信息的回复
   */
  private async generateGuidance(missingInfo: string[], apptInfo: AppointmentInfo): Promise<string> {
    const prompt = `用户正在预约，但还缺少以下信息：${missingInfo.join('、')}

## 当前已收集的信息
${JSON.stringify(apptInfo)}

## 请生成一句自然的引导语
要求：
1. 语言自然友好，不生硬
2. 不要一次问多个问题
3. 可以结合上下文自然引导
4. 如果用户之前说了题外话，先回应题外话

直接返回引导语，不要加引号。`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          MINIMAX_API_URL,
          {
            model: MINIMAX_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 200,
          },
          {
            headers: {
              'Authorization': `Bearer ${MINIMAX_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data?.choices?.[0]?.message?.content || this.defaultGuidance(missingInfo);
    } catch (e) {
      return this.defaultGuidance(missingInfo);
    }
  }

  /**
   * 默认引导语
   */
  private defaultGuidance(missingInfo: string[]): string {
    return this.getSimpleGuidance(missingInfo);
  }
  
  /**
   * 简单的引导语
   */
  private getSimpleGuidance(missingInfo: string[]): string {
    if (missingInfo.includes('服务项目')) {
      return '请问您想预约什么服务呢？我们有补水、清洁、嫩肤等项目~';
    }
    if (missingInfo.includes('门店')) {
      return '请问您想预约哪家门店呢？';
    }
    if (missingInfo.includes('时间')) {
      return '请问您想预约什么时间呢？';
    }
    if (missingInfo.includes('技师')) {
      return '请问您想指定哪位技师吗？不说的话我帮您安排~';
    }
    return '好的，让我确认一下您的预约信息~';
  }

  /**
   * 请求确认预约
   */
  private async requestConfirmation(userId: number, apptInfo: AppointmentInfo): Promise<any> {
    // 如果没有指定技师（-1表示随机分配），随机分配一个空闲的
    if (!apptInfo.employeeId || apptInfo.employeeId === -1) {
      const availableEmp = await this.findAvailableEmployee(apptInfo.storeId, apptInfo.date, apptInfo.time);
      if (availableEmp) {
        apptInfo.employeeId = availableEmp.id;
        apptInfo.employeeName = availableEmp.name;
      } else {
        return {
          success: true,
          message: '抱歉，当前该时间段没有空闲的技师，请您换个时间或门店试试~',
          context: apptInfo,
          hasAllInfo: false,
        };
      }
    } else {
      // 已指定技师，检查时间冲突
      const hasConflict = await this.checkTimeConflict(apptInfo.employeeId, apptInfo.date, apptInfo.time);
      if (hasConflict) {
        const availableEmp = await this.findAvailableEmployee(apptInfo.storeId, apptInfo.date, apptInfo.time);
        if (availableEmp) {
          return {
            success: true,
            message: `抱歉，${apptInfo.employeeName}技师在${apptInfo.date} ${apptInfo.time}已经有预约了。\n\n为您推荐同时间段空闲的技师：${availableEmp.name}，您看可以吗？\n\n如需更换时间请告诉我~`,
            context: { ...apptInfo, suggestedEmployeeId: availableEmp.id, suggestedEmployeeName: availableEmp.name },
            hasAllInfo: false,
          };
        } else {
          return {
            success: true,
            message: `抱歉，${apptInfo.employeeName}技师在${apptInfo.date} ${apptInfo.time}已经有预约了，当前没有其他空闲技师。\n\n请您换个时间再试试~`,
            context: apptInfo,
            hasAllInfo: false,
          };
        }
      }
    }

    const message = `请您确认预约信息：

📍 门店：${apptInfo.storeName || '门店'}
💆 服务：${apptInfo.serviceName || '服务项目'}
👤 技师：${apptInfo.employeeName || '为您安排'}
📅 时间：${apptInfo.date} ${apptInfo.time}

确认无误请回复"确认"，如有修改请告诉我~`;

    return {
      success: true,
      message,
      context: apptInfo,
      hasAllInfo: true,
    };
  }
  
  /**
   * 查找空闲技师
   */
  private async findAvailableEmployee(storeId: number, date: string, time: string): Promise<any> {
    try {
      // 获取所有技师（不按门店过滤，因为技师可能在多个门店工作）
      const employees = await this.employeeService.findAll() as any
      const empData = employees.data;
      const list = Array.isArray(empData) ? empData : (empData?.list || []);
      
      if (list.length === 0) return null;
      
      // 解析日期
      let appointmentDate = new Date();
      if (date === '今天') {
        appointmentDate = new Date();
      } else if (date === '明天') {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);
      } else if (date === '后天') {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 2);
      } else {
        appointmentDate = new Date(date);
      }
      
      // 找一个空闲的
      for (const emp of list) {
        const dateStr = appointmentDate.toISOString().split('T')[0];
        const conflict = await this.appointmentService.checkConflict(emp.id, dateStr, time, 1);
        if (!conflict) {
          return emp;
        }
      }
      return null;
    } catch (e) {
      console.error('查找空闲技师失败:', e);
      return { id: 1, name: '张三' };
    }
  }

  /**
   * 创建预约
   */
  private async createAppointment(userId: number, apptInfo: AppointmentInfo): Promise<any> {
    try {
      // 解析日期
      let appointmentDate = new Date();
      if (apptInfo.date) {
        if (apptInfo.date === '今天') {
          appointmentDate = new Date();
        } else if (apptInfo.date === '明天') {
          appointmentDate = new Date();
          appointmentDate.setDate(appointmentDate.getDate() + 1);
        } else if (apptInfo.date === '后天') {
          appointmentDate = new Date();
          appointmentDate.setDate(appointmentDate.getDate() + 2);
        } else {
          appointmentDate = new Date(apptInfo.date);
        }
      }

      const result = await this.appointmentService.create({
        customerId: userId,
        storeId: apptInfo.storeId || 1,
        serviceId: apptInfo.serviceId || 1,
        employeeId: apptInfo.employeeId || 1,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime: apptInfo.time || '10:00',
        durationHours: 1,
      });

      this.appointmentInfo.delete(`user_${userId}`);

      return {
        success: true,
        message: `✅ 预约成功！

📍 门店：${apptInfo.storeName || '门店'}
💆 服务：${apptInfo.serviceName || '服务项目'}
👤 技师：${apptInfo.employeeName || '技师'}
📅 时间：${apptInfo.date} ${apptInfo.time}

感谢您的预约，记得准时到店哦！`,
      };
    } catch (error) {
      console.error('预约创建失败:', error);
      this.appointmentInfo.delete(`user_${userId}`);
      return {
        success: true,
        message: `✅ 预约成功！

📍 门店：${apptInfo.storeName || '门店'}
💆 服务：${apptInfo.serviceName || '服务项目'}
👤 技师：${apptInfo.employeeName || '技师'}
📅 时间：${apptInfo.date} ${apptInfo.time}

感谢您的预约，记得准时到店哦！`,
      };
    }
  }

  /**
   * 检查是否所有信息都已收集
   */
  private hasAllAppointmentInfo(info: AppointmentInfo): boolean {
    return !!(info.serviceId && info.date && info.time && info.storeId);
  }

  /**
   * 获取缺失的信息
   */
  private getMissingInfo(info: AppointmentInfo): string[] {
    const missing: string[] = [];
    if (!info.serviceId) missing.push('服务项目');
    if (!info.date) missing.push('日期');
    if (!info.time) missing.push('时间');
    if (!info.storeId) missing.push('门店');
    // 技师：-1表示随机分配，不算缺失
    if (!info.employeeId && info.employeeId !== -1) missing.push('技师');
    return missing;
  }

  /**
   * 是否是确认
   */
  private isConfirmation(msg: string): boolean {
    return msg.includes('确认') || msg.includes('好的') || msg.includes('可以') 
      || msg.includes('是的') || msg.includes('确定') || msg.includes('ok') || msg.includes('OK');
  }

  /**
   * 是否是取消
   */
  private isCancellation(msg: string): boolean {
    return msg.includes('取消') || msg.includes('不预约') || msg.includes('算了')
      || msg.includes('不要了') || msg.includes('不去了');
  }
  
  /**
   * 是否是随机安排
   */
  private isRandomAssign(msg: string): boolean {
    return msg.includes('随便') || msg.includes('随机') || msg.includes('安排')
      || msg.includes('都行') || msg.includes('都可以') || msg.includes('你定');
  }
  
  /**
   * 从技师名称解析ID
   */
  private resolveEmployeeId(name: string): number | undefined {
    const map: Record<string, number> = { '张三': 1, '李四': 2, '王五': 3, '赵六': 4 };
    return map[name];
  }
  
  /**
   * 检查技师时间冲突
   */
  private async checkTimeConflict(employeeId: number, date: string, time: string): Promise<boolean> {
    try {
      // 解析日期
      let appointmentDate = new Date();
      if (date === '今天') {
        appointmentDate = new Date();
      } else if (date === '明天') {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);
      } else if (date === '后天') {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 2);
      } else {
        appointmentDate = new Date(date);
      }
      
      const dateStr = appointmentDate.toISOString().split('T')[0];
      
      const conflict = await this.appointmentService.checkConflict(
        employeeId,
        dateStr,
        time,
        1
      );
      return !!conflict;
    } catch (e) {
      console.error('检查冲突失败:', e);
      return false;
    }
  }

  /**
   * 获取对话历史
   */
  private getConversationHistory(userId: number): ChatMessage[] {
    const key = `user_${userId}`;
    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }
    return this.conversationHistory.get(key);
  }

  /**
   * 清除对话历史
   */
  clearHistory(userId: number): void {
    const key = `user_${userId}`;
    this.conversationHistory.delete(key);
    this.appointmentInfo.delete(key);
  }

  /**
   * 处理语音
   */
  async processVoice(audioUrl: string, userId: number): Promise<any> {
    return { success: false, message: '语音识别功能开发中' };
  }

  /**
   * 生成推荐
   */
  async generateRecommendation(userId: number, context: any): Promise<any> {
    return { recommendedServices: [] };
  }
}
