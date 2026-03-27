import { AiAssistantService } from './ai-assistant.service';
export declare class AiAssistantController {
    private readonly aiAssistantService;
    constructor(aiAssistantService: AiAssistantService);
    chat(body: {
        message: string;
        context?: any;
    }, authHeader: string): Promise<{
        success: boolean;
        data: any;
    }>;
    health(): {
        status: string;
        message: string;
    };
}
