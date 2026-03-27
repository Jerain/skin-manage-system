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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantController = void 0;
const common_1 = require("@nestjs/common");
const ai_assistant_service_1 = require("./ai-assistant.service");
let AiAssistantController = class AiAssistantController {
    constructor(aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }
    async chat(body, authHeader) {
        if (!authHeader) {
            throw new common_1.UnauthorizedException('请先登录');
        }
        const token = authHeader.replace('Bearer ', '');
        let userId = 0;
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            userId = payload.sub || payload.customer?.id || 0;
        }
        catch (e) {
        }
        const response = await this.aiAssistantService.chat(userId, body.message, body.context || {});
        return { success: true, data: response };
    }
    health() {
        return { status: 'ok', message: 'AI Assistant is running' };
    }
};
exports.AiAssistantController = AiAssistantController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiAssistantController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiAssistantController.prototype, "health", null);
exports.AiAssistantController = AiAssistantController = __decorate([
    (0, common_1.Controller)('ai-assistant'),
    __metadata("design:paramtypes", [ai_assistant_service_1.AiAssistantService])
], AiAssistantController);
//# sourceMappingURL=ai-assistant.controller.js.map