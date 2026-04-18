/**
 * API 调用层 - 前端直接调用 CodeBuddy REST API
 * 适用于部署到纯静态托管平台（如 Vercel）
 */

import { Message, ToolCall, ContentBlock, Session, CustomAgent } from '../types';

// 获取 API Key
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_CODEBUDDY_API_KEY || localStorage.getItem('codebuddy_api_key');
  if (!apiKey) {
    throw new Error('未配置 API Key，请在设置中配置 CODEBUDDY_API_KEY');
  }
  return apiKey;
};

// 获取 API 地址
const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'https://api.codebuddy.ai';
};

// ============ 会话管理 ============

const SESSIONS_KEY = 'news_agent_sessions';

/**
 * 从 localStorage 加载会话列表
 */
export function loadSessionsFromStorage(): Session[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (data) {
      const sessions = JSON.parse(data);
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
    }
  } catch (e) {
    console.error('加载会话失败:', e);
  }
  return [];
}

/**
 * 保存会话列表到 localStorage
 */
export function saveSessionsToStorage(sessions: Session[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('保存会话失败:', e);
  }
}

/**
 * 保存单个会话的消息
 */
export function saveSessionMessages(sessionId: string, messages: Message[]): void {
  try {
    const sessions = loadSessionsFromStorage();
    const updatedSessions = sessions.map(s =>
      s.id === sessionId ? { ...s, messages, updatedAt: new Date() } : s
    );
    saveSessionsToStorage(updatedSessions);
  } catch (e) {
    console.error('保存会话消息失败:', e);
  }
}

/**
 * 创建新会话
 */
export function createSessionInStorage(title: string, model: string, agentId: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    title,
    model,
    agentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  };
  
  const sessions = loadSessionsFromStorage();
  saveSessionsToStorage([session, ...sessions]);
  return session;
}

/**
 * 删除会话
 */
export function deleteSessionFromStorage(sessionId: string): void {
  const sessions = loadSessionsFromStorage();
  saveSessionsToStorage(sessions.filter(s => s.id !== sessionId));
}

/**
 * 获取单个会话
 */
export function getSessionFromStorage(sessionId: string): Session | undefined {
  const sessions = loadSessionsFromStorage();
  return sessions.find(s => s.id === sessionId);
}

// ============ 模型列表 ============

const MODELS_KEY = 'news_agent_models';

/**
 * 获取可用模型列表
 */
export async function fetchModels(): Promise<Array<{ modelId: string; name: string; description?: string }>> {
  const models = [
    { modelId: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', description: '最新的大模型，支持多模态' },
    { modelId: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Anthropic 的高效模型' },
    { modelId: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Anthropic 的旗舰模型' },
  ];
  
  try {
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
  } catch (e) {
    console.error('保存模型列表失败:', e);
  }
  
  return models;
}

/**
 * 从缓存获取模型列表
 */
export function getCachedModels(): Array<{ modelId: string; name: string; description?: string }> {
  try {
    const data = localStorage.getItem(MODELS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('加载模型列表失败:', e);
  }
  return fetchModels() as any;
}

// ============ 聊天功能 ============

interface SendMessageOptions {
  sessionId: string;
  message: string;
  model: string;
  systemPrompt?: string;
  cwd?: string;
  permissionMode?: 'default' | 'auto' | 'manual';
  agentId: string;
  getAgent: (id: string) => CustomAgent | undefined;
  onInit?: (data: { sessionId: string; assistantMessageId: string }) => void;
  onText?: (content: string) => void;
  onTool?: (toolCall: ToolCall) => void;
  onToolResult?: (toolId: string, content: string, isError: boolean) => void;
  onDone?: (data: { duration: number; cost: number }) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * 发送消息并处理流式响应 - 使用 REST API
 */
export async function sendMessage(options: SendMessageOptions): Promise<void> {
  const {
    sessionId,
    message,
    model,
    systemPrompt,
    permissionMode = 'default',
    agentId,
    getAgent,
    onInit,
    onText,
    onTool,
    onToolResult,
    onDone,
    onError,
    signal,
  } = options;

  const apiKey = getApiKey();
  const apiBaseUrl = getApiBaseUrl();
  const assistantMessageId = crypto.randomUUID();
  
  onInit?.({ sessionId, assistantMessageId });

  // 获取 Agent 的系统提示词
  const agent = getAgent(agentId);
  const finalSystemPrompt = systemPrompt || agent?.systemPrompt || '';

  try {
    // 直接调用 CodeBuddy REST API
    const response = await fetch(`${apiBaseUrl}/v1/agents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: message,
        model,
        systemPrompt: finalSystemPrompt,
        stream: true,
        permissionMode,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API 请求失败: ${response.status}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentToolCalls: ToolCall[] = [];
    let fullContent = '';
    let contentBlocks: ContentBlock[] = [];
    let currentTextBlock = '';

    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        throw new Error('请求已取消');
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          
          if (event.type === 'text') {
            fullContent += event.text;
            currentTextBlock += event.text;
            
            const lastBlock = contentBlocks[contentBlocks.length - 1];
            if (lastBlock?.type === 'text') {
              lastBlock.text = currentTextBlock;
            } else if (currentTextBlock) {
              contentBlocks.push({ type: 'text', text: currentTextBlock });
            }
            
            onText?.(event.text);
          } else if (event.type === 'tool_use') {
            currentTextBlock = '';
            
            const toolCall: ToolCall = {
              id: event.toolUseId || crypto.randomUUID(),
              name: event.name,
              input: event.input,
              status: 'running',
            };
            currentToolCalls.push(toolCall);
            contentBlocks.push({ type: 'tool_use', toolCall });
            
            onTool?.(toolCall);
          } else if (event.type === 'tool_result') {
            const toolId = event.toolUseId;
            const toolContent = typeof event.content === 'string' 
              ? event.content 
              : JSON.stringify(event.content);
            const isError = event.isError || false;
            
            const tool = currentToolCalls.find(t => t.id === toolId);
            if (tool) {
              tool.status = isError ? 'error' : 'completed';
              tool.result = toolContent;
              tool.isError = isError;
            }
            
            onToolResult?.(toolId, toolContent, isError);
          } else if (event.type === 'done') {
            onDone?.({ 
              duration: event.duration || 0, 
              cost: event.cost || 0 
            });
          }
        } catch (e) {
          console.warn('解析事件失败:', e);
        }
      }
    }

    // 保存消息到存储
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: fullContent,
      model,
      timestamp: new Date(),
      isStreaming: false,
      contentBlocks,
      toolCalls: currentToolCalls,
    };

    const sessions = loadSessionsFromStorage();
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage, assistantMessage],
          updatedAt: new Date(),
        };
      }
      return s;
    });
    saveSessionsToStorage(updatedSessions);

  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

// ============ 图像生成 ============

interface ImageGenerationOptions {
  prompt: string;
  size?: '1:1' | '16:9' | '9:16';
  imageUrl?: string;
}

/**
 * 生成图像
 */
export async function generateImage(options: ImageGenerationOptions): Promise<{ success: boolean; images: string[]; message: string }> {
  return {
    success: false,
    images: [],
    message: '图像生成功能需要后端支持，当前为纯前端版本',
  };
}

// ============ 音频转录 ============

/**
 * 音频转录
 */
export async function transcribeAudio(file: File): Promise<{ success: boolean; text: string; message: string }> {
  return {
    success: false,
    text: '',
    message: '音频转录功能需要后端支持，当前为纯前端版本',
  };
}

// ============ 设置相关 ============

const CONFIG_KEY = 'news_agent_config';

/**
 * 保存配置
 */
export function saveConfig(config: {
  apiKey?: string;
  theme?: string;
  defaultModel?: string;
}): void {
  try {
    const current = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...config }));
  } catch (e) {
    console.error('保存配置失败:', e);
  }
}

/**
 * 加载配置
 */
export function loadConfig(): {
  apiKey?: string;
  theme?: string;
  defaultModel?: string;
} {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

/**
 * 检查 API Key 是否配置
 */
export function checkApiKeyConfigured(): boolean {
  const apiKey = import.meta.env.VITE_CODEBUDDY_API_KEY || localStorage.getItem('codebuddy_api_key');
  return !!apiKey;
}
