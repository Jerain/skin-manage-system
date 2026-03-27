"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const customers_service_1 = require("../customers/customers.service");
const stores_service_1 = require("../stores/stores.service");
const services_service_1 = require("../services/services.service");
const employees_service_1 = require("../employees/employees.service");
const appointments_service_1 = require("../appointments/appointments.service");
const orders_service_1 = require("../orders/orders.service");
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-QlIYHONLFJJXdo2g6i1p-bApeQUQJErdV4GHMmbBIxNP9gLgrfsnA0reYnIA3qDO9V4mxrpK88OtNSENz-uq0BMmYAHitl0ZQu4GpbS5teDY41VBK9BVIwY';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'abab6.5s-chat';
let AiAssistantService = class AiAssistantService {
    constructor(httpService, customerService, storeService, serviceService, employeeService, appointmentService, orderService) {
        this.httpService = httpService;
        this.customerService = customerService;
        this.storeService = storeService;
        this.serviceService = serviceService;
        this.employeeService = employeeService;
        this.appointmentService = appointmentService;
        this.orderService = orderService;
        this.conversationHistory = new Map();
        this.appointmentInfo = new Map();
        this.maxHistoryLength = 15;
    }
    async chat(userId, message, context) {
        const apptKey = `user_${userId}`;
        let apptInfo = this.appointmentInfo.get(apptKey) || {};
        const lowerMsg = message.toLowerCase();
        if (this.isConfirmation(lowerMsg) && apptInfo.serviceId && apptInfo.date && apptInfo.storeId) {
            return await this.createAppointment(userId, apptInfo);
        }
        if (this.isCancellation(lowerMsg)) {
            this.appointmentInfo.delete(apptKey);
            return { success: true, message: '好的，已取消预约。还有什么可以帮您的？', context: {} };
        }
        const extracted = await this.extractAppointmentInfo(message, apptInfo);
        const isRandomAssign = this.isRandomAssign(message);
        if (isRandomAssign) {
            apptInfo.employeeId = -1;
            apptInfo.employeeName = '随机分配';
        }
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
        if (apptInfo.employeeName && !apptInfo.employeeId) {
            apptInfo.employeeId = this.resolveEmployeeId(apptInfo.employeeName);
        }
        this.appointmentInfo.set(apptKey, apptInfo);
        const missingInfo = this.getMissingInfo(apptInfo);
        if (missingInfo.length === 0) {
            return await this.requestConfirmation(userId, apptInfo);
        }
        const hasNewInfo = extracted.serviceId || extracted.storeId || extracted.date || extracted.time || extracted.employeeId;
        const queryResult = await this.handleSystemQuery(message, apptInfo);
        if (queryResult) {
            return queryResult;
        }
        if (!hasNewInfo && extracted.reply && extracted.reply.length > 10) {
            return await this.handleUnrelatedQuestion(message, apptInfo);
        }
        const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
        return {
            success: true,
            message: nextQuestion,
            context: apptInfo,
            hasAllInfo: false,
        };
    }
    getNextQuestion(missingInfo, apptInfo) {
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
    async extractAppointmentInfo(message, currentInfo) {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(MINIMAX_API_URL, {
                model: MINIMAX_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.3,
                max_tokens: 500,
            }, {
                headers: {
                    'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }));
            const content = response.data?.choices?.[0]?.message?.content || '{}';
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            catch (e) {
                console.error('解析失败:', content);
            }
        }
        catch (error) {
            console.error('提取信息失败:', error.message);
        }
        return this.simpleExtractInfo(message, currentInfo);
    }
    async handleSystemQuery(message, apptInfo) {
        const lowerMsg = message.toLowerCase();
        const missingInfo = this.getMissingInfo(apptInfo);
        let queryType = null;
        if (lowerMsg.includes('门店') || lowerMsg.includes('店在哪') || lowerMsg.includes('有几家店') || lowerMsg.includes('分店')) {
            queryType = 'store';
        }
        else if (lowerMsg.includes('技师') || lowerMsg.includes('理发师') || lowerMsg.includes('美容师') || lowerMsg.includes('老师')) {
            queryType = 'employee';
        }
        else if (lowerMsg.includes('项目') || lowerMsg.includes('服务') || lowerMsg.includes('有什么') || lowerMsg.includes('套餐')) {
            queryType = 'service';
        }
        if (!queryType)
            return null;
        try {
            let dataList = [];
            let title = '';
            if (queryType === 'store') {
                const stores = ;
                const stores = await this.storeService.findAll();
                const storeData = stores.data;
                dataList = Array.isArray(storeData) ? storeData : (storeData?.list || []);
                title = '🏪 门店列表';
            }
            else if (queryType === 'employee') {
                const employees = ;
                const employees = await this.employeeService.findAll();
                const empData = employees.data;
                dataList = Array.isArray(empData) ? empData : (empData?.list || []);
                title = '👨‍💼 技师列表';
            }
            else if (queryType === 'service') {
                const services = ;
                const services = await this.serviceService.findAll();
                const svcData = services.data;
                dataList = Array.isArray(svcData) ? svcData : (svcData?.list || []);
                title = '💆 服务项目';
            }
            if (dataList.length === 0) {
                return null;
            }
            let listText = '';
            if (queryType === 'store') {
                listText = dataList.map((s) => `• ${s.name} - ${s.address || '地址待完善'}`).join('\n');
            }
            else if (queryType === 'employee') {
                listText = dataList.map((e) => `• ${e.name} - ${e.position || '技师'}`).join('\n');
            }
            else if (queryType === 'service') {
                listText = dataList.map((s) => `• ${s.name} - ¥${s.price || '待定'}`).join('\n');
            }
            const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
            return {
                success: true,
                message: `${title}\n\n${listText}\n\n${nextQuestion}`,
                context: apptInfo,
                hasAllInfo: false,
            };
        }
        catch (e) {
            console.error('查询失败:', e);
            return null;
        }
    }
    async handleUnrelatedQuestion(message, apptInfo) {
        const missingInfo = this.getMissingInfo(apptInfo);
        const nextQuestion = this.getNextQuestion(missingInfo, apptInfo);
        const prompt = `用户正在预约皮肤管理服务，还缺少以下信息：${missingInfo.join('、')}

用户问了一个无关问题："${message}"

请先回答这个问题（简短一句），然后自然地引导回预约流程。

回答格式：回答内容 + \n\n + 引导语`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(MINIMAX_API_URL, {
                model: MINIMAX_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 200,
            }, {
                headers: {
                    'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }));
            const answer = response.data?.choices?.[0]?.message?.content || nextQuestion;
            return {
                success: true,
                message: answer,
                context: apptInfo,
                hasAllInfo: false,
            };
        }
        catch (e) {
            return {
                success: true,
                message: nextQuestion,
                context: apptInfo,
                hasAllInfo: false,
            };
        }
    }
    simpleExtractInfo(message, currentInfo) {
        const lowerMsg = message.toLowerCase();
        const result = {};
        if (lowerMsg.includes('补水')) {
            result.serviceId = 1;
            result.serviceName = '深层补水护理';
        }
        else if (lowerMsg.includes('清洁')) {
            result.serviceId = 2;
            result.serviceName = '小气泡清洁';
        }
        else if (lowerMsg.includes('嫩肤') || lowerMsg.includes('光子')) {
            result.serviceId = 3;
            result.serviceName = '光子嫩肤';
        }
        else if (lowerMsg.includes('按摩')) {
            result.serviceId = 4;
            result.serviceName = '面部按摩';
        }
        else if (lowerMsg.includes('换肤') || lowerMsg.includes('果酸')) {
            result.serviceId = 5;
            result.serviceName = '果酸换肤';
        }
        const storeMap = {
            '旗舰店': { id: 1, name: '皮肤管理中心旗舰店' },
            '总店': { id: 1, name: '皮肤管理中心旗舰店' },
            '望京': { id: 2, name: '皮肤管理望京店' },
            'CBD': { id: 2, name: '皮肤管理望京店' },
        };
        for (const [key, val] of Object.entries(storeMap)) {
            if (lowerMsg.includes(key)) {
                result.storeId = val.id;
                result.storeName = val.name;
                break;
            }
        }
        if (lowerMsg.includes('张三')) {
            result.employeeId = 1;
            result.employeeName = '张三';
        }
        else if (lowerMsg.includes('李四')) {
            result.employeeId = 2;
            result.employeeName = '李四';
        }
        else if (lowerMsg.includes('王五')) {
            result.employeeId = 3;
            result.employeeName = '王五';
        }
        else if (lowerMsg.includes('赵六')) {
            result.employeeId = 4;
            result.employeeName = '赵六';
        }
        else if (lowerMsg.includes('技师')) {
            result.employeeId = null;
            result.employeeName = null;
        }
        if (lowerMsg.includes('今天')) {
            result.date = new Date().toISOString().split('T')[0];
        }
        else if (lowerMsg.includes('明天')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            result.date = tomorrow.toISOString().split('T')[0];
        }
        else if (lowerMsg.includes('后天')) {
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            result.date = dayAfter.toISOString().split('T')[0];
        }
        else {
            const dateMatch = message.match(/(\d{1,2})[月\-](\d{1,2})/);
            if (dateMatch) {
                result.date = `2026-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
            }
        }
        const timeMatch = message.match(/(\d{1,2})[点时:](\d{0,2})/);
        if (timeMatch) {
            const hour = timeMatch[1].padStart(2, '0');
            const minute = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
            result.time = `${hour}:${minute}`;
        }
        return result;
    }
    async generateGuidance(missingInfo, apptInfo) {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(MINIMAX_API_URL, {
                model: MINIMAX_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 200,
            }, {
                headers: {
                    'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }));
            return response.data?.choices?.[0]?.message?.content || this.defaultGuidance(missingInfo);
        }
        catch (e) {
            return this.defaultGuidance(missingInfo);
        }
    }
    defaultGuidance(missingInfo) {
        return this.getSimpleGuidance(missingInfo);
    }
    getSimpleGuidance(missingInfo) {
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
    async requestConfirmation(userId, apptInfo) {
        if (!apptInfo.employeeId || apptInfo.employeeId === -1) {
            const availableEmp = await this.findAvailableEmployee(apptInfo.storeId, apptInfo.date, apptInfo.time);
            if (availableEmp) {
                apptInfo.employeeId = availableEmp.id;
                apptInfo.employeeName = availableEmp.name;
            }
            else {
                return {
                    success: true,
                    message: '抱歉，当前该时间段没有空闲的技师，请您换个时间或门店试试~',
                    context: apptInfo,
                    hasAllInfo: false,
                };
            }
        }
        else {
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
                }
                else {
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
    async findAvailableEmployee(storeId, date, time) {
        try {
            const employees = ;
            const employees = await this.employeeService.findAll();
            const empData = employees.data;
            const list = Array.isArray(empData) ? empData : (empData?.list || []);
            if (list.length === 0)
                return null;
            let appointmentDate = new Date();
            if (date === '今天') {
                appointmentDate = new Date();
            }
            else if (date === '明天') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
            }
            else if (date === '后天') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 2);
            }
            else {
                appointmentDate = new Date(date);
            }
            for (const emp of list) {
                const dateStr = appointmentDate.toISOString().split('T')[0];
                const dateObj = new Date(dateStr);
                const conflict = await this.appointmentService.checkConflict(emp.id, dateObj, time, 1);
                if (!conflict) {
                    return emp;
                }
            }
            return null;
        }
        catch (e) {
            console.error('查找空闲技师失败:', e);
            return { id: 1, name: '张三' };
        }
    }
    async createAppointment(userId, apptInfo) {
        try {
            let appointmentDate = new Date();
            if (apptInfo.date) {
                if (apptInfo.date === '今天') {
                    appointmentDate = new Date();
                }
                else if (apptInfo.date === '明天') {
                    appointmentDate = new Date();
                    appointmentDate.setDate(appointmentDate.getDate() + 1);
                }
                else if (apptInfo.date === '后天') {
                    appointmentDate = new Date();
                    appointmentDate.setDate(appointmentDate.getDate() + 2);
                }
                else {
                    appointmentDate = new Date(apptInfo.date);
                }
            }
            const result = await this.appointmentService.create({
                customerId: userId,
                storeId: apptInfo.storeId || 1,
                serviceId: apptInfo.serviceId || 1,
                employeeId: apptInfo.employeeId || 1,
                appointmentDate: appointmentDate,
                appointmentTime: apptInfo.time || '10:00',
                status: 'pending',
                durationHours: 1,
            });
            this.appointmentInfo.delete(`user_${userId}`);
            if (result.code && result.code !== 0) {
                return { success: false, message: result.message || '预约失败' };
            }
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
        catch (error) {
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
    hasAllAppointmentInfo(info) {
        return !!(info.serviceId && info.date && info.time && info.storeId);
    }
    getMissingInfo(info) {
        const missing = [];
        if (!info.serviceId)
            missing.push('服务项目');
        if (!info.date)
            missing.push('日期');
        if (!info.time)
            missing.push('时间');
        if (!info.storeId)
            missing.push('门店');
        if (!info.employeeId && info.employeeId !== -1)
            missing.push('技师');
        return missing;
    }
    isConfirmation(msg) {
        return msg.includes('确认') || msg.includes('好的') || msg.includes('可以')
            || msg.includes('是的') || msg.includes('确定') || msg.includes('ok') || msg.includes('OK');
    }
    isCancellation(msg) {
        return msg.includes('取消') || msg.includes('不预约') || msg.includes('算了')
            || msg.includes('不要了') || msg.includes('不去了');
    }
    isRandomAssign(msg) {
        return msg.includes('随便') || msg.includes('随机') || msg.includes('安排')
            || msg.includes('都行') || msg.includes('都可以') || msg.includes('你定');
    }
    resolveEmployeeId(name) {
        const map = { '张三': 1, '李四': 2, '王五': 3, '赵六': 4 };
        return map[name];
    }
    async checkTimeConflict(employeeId, date, time) {
        try {
            let appointmentDate = new Date();
            if (date === '今天') {
                appointmentDate = new Date();
            }
            else if (date === '明天') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
            }
            else if (date === '后天') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 2);
            }
            else {
                appointmentDate = new Date(date);
            }
            const dateObj = new Date(appointmentDate.toISOString().split('T')[0]);
            const conflict = await this.appointmentService.checkConflict(employeeId, dateObj, time, 1);
            return !!conflict;
        }
        catch (e) {
            console.error('检查冲突失败:', e);
            return false;
        }
    }
    getConversationHistory(userId) {
        const key = `user_${userId}`;
        if (!this.conversationHistory.has(key)) {
            this.conversationHistory.set(key, []);
        }
        return this.conversationHistory.get(key);
    }
    clearHistory(userId) {
        const key = `user_${userId}`;
        this.conversationHistory.delete(key);
        this.appointmentInfo.delete(key);
    }
    async processVoice(audioUrl, userId) {
        return { success: false, message: '语音识别功能开发中' };
    }
    async generateRecommendation(userId, context) {
        return { recommendedServices: [] };
    }
};
exports.AiAssistantService = AiAssistantService;
exports.AiAssistantService = AiAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        customers_service_1.CustomersService,
        stores_service_1.StoresService,
        services_service_1.ServicesService,
        employees_service_1.EmployeesService,
        appointments_service_1.AppointmentsService,
        orders_service_1.OrdersService])
], AiAssistantService);
//# sourceMappingURL=ai-assistant.service.js.map