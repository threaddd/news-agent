/**
 * API 调用层 - OpenAI 兼容 API
 * 支持 OpenAI、Claude (通过兼容层)、以及任何 OpenAI 格式的 API
 */

import { Message, ToolCall, ContentBlock, Session, CustomAgent } from '../types';

// 判断是否为 Vercel 部署环境
const isVercel = import.meta.env.PROD;

// 获取 API 配置
const getApiConfig = (): { apiKey: string; baseUrl: string; model: string } => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  const baseUrl = import.meta.env.VITE_OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    throw new Error('未配置 API Key，请在设置中配置 OpenAI API Key');
  }

  return { apiKey, baseUrl, model };
};

// 获取 API 地址
const getApiBaseUrl = (): string => {
  if (isVercel) {
    return '/api';
  }
  return import.meta.env.VITE_OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
};

// ============ 会话管理 ============

const SESSIONS_KEY = 'news_agent_sessions';

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

export function saveSessionsToStorage(sessions: Session[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('保存会话失败:', e);
  }
}

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

export function deleteSessionFromStorage(sessionId: string): void {
  const sessions = loadSessionsFromStorage();
  saveSessionsToStorage(sessions.filter(s => s.id !== sessionId));
}

export function getSessionFromStorage(sessionId: string): Session | undefined {
  const sessions = loadSessionsFromStorage();
  return sessions.find(s => s.id === sessionId);
}

// ============ 模型列表 ============

const MODELS_KEY = 'news_agent_models';

export async function fetchModels(): Promise<Array<{ modelId: string; name: string; description?: string }>> {
  const models = [
    { modelId: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI 最新多模态模型' },
    { modelId: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '轻量级 GPT-4o' },
    { modelId: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '快速 GPT-4' },
    { modelId: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Anthropic 高效模型' },
    { modelId: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: '快速轻量' },
  ];

  try {
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
  } catch (e) {
    console.error('保存模型列表失败:', e);
  }

  return models;
}

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

export async function sendMessage(options: SendMessageOptions): Promise<void> {
  const {
    sessionId,
    message,
    model,
    systemPrompt,
    permissionMode,
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

  const agent = getAgent(agentId);
  const finalSystemPrompt = systemPrompt || agent?.systemPrompt || '';

  try {
    // 构建消息历史
    const messages: Array<{ role: string; content: string }> = [];
    if (finalSystemPrompt) {
      messages.push({ role: 'system', content: finalSystemPrompt });
    }

    // 从 localStorage 加载历史消息
    const sessions = loadSessionsFromStorage();
    const currentSession = sessions.find(s => s.id === sessionId);
    if (currentSession) {
      currentSession.messages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }
    messages.push({ role: 'user', content: message });

    const startTime = Date.now();

    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `API 请求失败: ${response.status}`;

      if (response.status === 401) {
        throw new Error('API Key 无效或已过期，请在设置中更新');
      } else if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后重试');
      }
      throw new Error(errorMessage);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
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

          if (event.choices?.[0]?.delta?.content) {
            const text = event.choices[0].delta.content;
            fullContent += text;
            currentTextBlock += text;
            onText?.(text);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    const duration = Date.now() - startTime;

    onDone?.({
      duration,
      cost: 0, // OpenAI API 不返回成本
    });

  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const enhancedError = new Error(
        '无法连接到 API 服务器。请检查网络连接和 API 地址配置。'
      );
      onError?.(enhancedError);
      throw enhancedError;
    }

    onError?.(error);
    throw error;
  }
}

// ============ 辅助函数 ============

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('未配置 API Key，请在设置中配置');
  }
  return apiKey;
}

// ============ 设置相关 ============

const CONFIG_KEY = 'news_agent_config';

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

export function checkApiKeyConfigured(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  return !!apiKey;
}

// ============ 图像生成 ============

interface ImageGenerationOptions {
  prompt: string;
  size?: '1:1' | '16:9' | '9:16';
  imageUrl?: string;
}

export async function generateImage(options: ImageGenerationOptions): Promise<{ success: boolean; images: string[]; message: string }> {
  return {
    success: false,
    images: [],
    message: '图像生成功能需要后端支持，当前为纯前端版本',
  };
}

// ============ 音频转录 ============

export async function transcribeAudio(file: File): Promise<{ success: boolean; text: string; message: string }> {
  return {
    success: false,
    text: '',
    message: '音频转录功能需要后端支持，当前为纯前端版本',
  };
}
