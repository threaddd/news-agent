/**
 * API 调用层 - 支持多种 AI 服务提供商
 * 
 * 支持的免费/低成本 API：
 * - Groq (免费高速)
 * - OpenRouter (多种模型)
 * - Together AI (有免费额度)
 * - Fireworks AI (有免费额度)
 * - Gemini (Google)
 */

import { Message, ToolCall, ContentBlock, Session, CustomAgent, Model } from '../types';

// ============ 配置 ============

interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
}

interface AIModel {
  id: string;
  name: string;
  description?: string;
  isFree?: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'Groq (免费)',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: '高性能', isFree: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: '快速响应', isFree: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: '混合专家', isFree: true },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google轻量', isFree: true },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic高效' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google多模态' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', description: '开源旗舰' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', description: '欧洲最强' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'OpenAI轻量' },
      { id: 'deepseek-ai/deepseek-v3', name: 'DeepSeek V3', description: '中国开源' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', description: '阿里开源' },
    ],
  },
  {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    models: [
      { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B', description: '开源旗舰' },
      { id: 'Qwen/Qwen2-72B-Instruct', name: 'Qwen 2 72B', description: '阿里开源' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: '中国最强' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini (免费)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '快速多模态', isFree: true },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: '最新模型', isFree: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '最强多模态' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', description: '中国最强' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: '编程专用' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: '推理模型' },
    ],
  },
  {
    id: 'hunyuan',
    name: '腾讯混元 (元宝)',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com',
    models: [
      { id: 'hunyuan', name: '混元-pro', description: '腾讯最强' },
      { id: 'hunyuan-lite', name: '混元-lite', description: '轻量快速' },
      { id: 'hunyuan-air', name: '混元-air', description: '超轻量' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', description: '本地运行' },
      { id: 'codellama', name: 'Code Llama', description: '编程专用' },
      { id: 'mistral', name: 'Mistral', description: '欧洲最强' },
      { id: 'qwen2.5', name: 'Qwen 2.5', description: '阿里开源' },
    ],
  },
];

// 获取所有模型
export function getAllModels(): AIModel[] {
  return AI_PROVIDERS.flatMap(p => p.models);
}

// 获取免费模型
export function getFreeModels(): AIModel[] {
  return AI_PROVIDERS.flatMap(p => p.models.filter(m => m.isFree));
}

// 获取提供商
export function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

// ============ 存储 ============

const SESSIONS_KEY = 'news_agent_sessions';
const CONFIG_KEY = 'news_agent_config';
const PROVIDER_KEY = 'ai_provider';
const API_KEY_PREFIX = 'ai_api_key_';

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

export async function fetchModels(): Promise<Model[]> {
  // 转换为兼容 Model 类型（使用 modelId 而不是 id）
  const allModels = getAllModels();
  return allModels.map(m => ({
    modelId: m.id,
    name: m.name,
    description: m.description,
  }));
}

export function getCachedModels(): AIModel[] {
  return getAllModels();
}

// ============ AI 提供商配置 ============

export function getCurrentProvider(): { providerId: string; modelId: string } {
  const stored = localStorage.getItem(PROVIDER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 默认使用 Ollama 本地模型（不需要 API Key）
  return { providerId: 'ollama', modelId: 'llama3.2' };
}

export function setCurrentProvider(providerId: string, modelId: string): void {
  localStorage.setItem(PROVIDER_KEY, JSON.stringify({ providerId, modelId }));
}

export function getApiKey(providerId: string): string | undefined {
  // Ollama 本地模型不需要 API Key
  if (providerId === 'ollama') return 'ollama';
  
  const envKey = import.meta.env[`VITE_${providerId.toUpperCase()}_API_KEY`];
  if (envKey) return envKey;
  return localStorage.getItem(`${API_KEY_PREFIX}${providerId}`);
}

export function setApiKey(providerId: string, key: string): void {
  localStorage.setItem(`${API_KEY_PREFIX}${providerId}`, key);
}

export function checkAnyApiKeyConfigured(): boolean {
  return AI_PROVIDERS.some(p => !!getApiKey(p.id));
}

// ============ 聊天功能 ============

interface SendMessageOptions {
  sessionId: string;
  message: string;
  model: string;
  providerId: string;
  systemPrompt?: string;
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
  const { sessionId, message, model, providerId, systemPrompt, agentId, getAgent, onInit, onText, onToolResult, onDone, onError, signal } = options;

  const apiKey = getApiKey(providerId);
  if (!apiKey) {
    const error = new Error(`请先配置 ${getProvider(providerId)?.name || providerId} 的 API Key`);
    onError?.(error);
    throw error;
  }

  const provider = getProvider(providerId);
  if (!provider) {
    const error = new Error(`未知的 AI 提供商: ${providerId}`);
    onError?.(error);
    throw error;
  }

  const assistantMessageId = crypto.randomUUID();
  onInit?.({ sessionId, assistantMessageId });

  const agent = getAgent(agentId);
  const finalSystemPrompt = systemPrompt || agent?.systemPrompt || '';

  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (finalSystemPrompt) messages.push({ role: 'system', content: finalSystemPrompt });

    const sessions = loadSessionsFromStorage();
    const currentSession = sessions.find(s => s.id === sessionId);
    if (currentSession) {
      currentSession.messages.forEach(msg => messages.push({ role: msg.role, content: msg.content }));
    }
    messages.push({ role: 'user', content: message });

    const startTime = Date.now();

    // Gemini 特殊处理
    if (providerId === 'gemini') {
      await sendGeminiMessage({ apiKey, model, messages, onText, signal, onDone, onError });
      return;
    }

    // 腾讯混元特殊处理
    if (providerId === 'hunyuan') {
      await sendHunyuanMessage({ apiKey, model, messages, onText, signal, onDone, onError });
      return;
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || errorData.message || `API 请求失败: ${response.status}`;
      if (response.status === 401) throw new Error(`${provider.name} API Key 无效`);
      if (response.status === 429) throw new Error(`${provider.name} 请求过于频繁`);
      throw new Error(msg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) { reader.cancel(); throw new Error('请求已取消'); }
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
            onText?.(event.choices[0].delta.content);
          }
        } catch (e) {}
      }
    }

    onDone?.({ duration: Date.now() - startTime, cost: 0 });

  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const err = new Error(`无法连接到 ${provider.name}，请检查网络或API Key`);
      onError?.(err);
      throw err;
    }
    onError?.(error);
    throw error;
  }
}

// 腾讯混元 API (Hunyuan)
async function sendHunyuanMessage(params: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  onText?: (content: string) => void;
  signal?: AbortSignal;
  onDone?: (data: { duration: number; cost: number }) => void;
  onError?: (error: Error) => void;
}) {
  const { apiKey, model, messages, onText, signal, onDone, onError } = params;

  try {
    // 混元 API 需要将 messages 转换为特定格式
    const formattedMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content;

    const response = await fetch(
      `https://api.hunyuan.cloud.tencent.com/hunyuan/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          stream: true,
          ...(systemInstruction && { system: systemInstruction }),
        }),
        signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `混元 API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) { reader.cancel(); throw new Error('请求已取消'); }
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
            onText?.(event.choices[0].delta.content);
          }
        } catch (e) {}
      }
    }
    onDone?.({ duration: 0, cost: 0 });

  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

// Gemini API
async function sendGeminiMessage(params: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  onText?: (content: string) => void;
  signal?: AbortSignal;
  onDone?: (data: { duration: number; cost: number }) => void;
  onError?: (error: Error) => void;
}) {
  const { apiKey, model, messages, onText, signal, onDone, onError } = params;

  try {
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

    const systemInstruction = messages.find(m => m.role === 'system')?.content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        }),
        signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API 请求失败`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) { reader.cancel(); throw new Error('请求已取消'); }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.candidates?.[0]?.content?.parts?.[0]?.text) {
            onText?.(event.candidates[0].content.parts[0].text);
          }
        } catch (e) {}
      }
    }
    onDone?.({ duration: 0, cost: 0 });

  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

// ============ 设置相关 ============

const CONFIG_KEY_STORAGE = 'news_agent_config';

export function saveConfig(config: { theme?: string; defaultModel?: string; providerId?: string }): void {
  try {
    const current = JSON.parse(localStorage.getItem(CONFIG_KEY_STORAGE) || '{}');
    localStorage.setItem(CONFIG_KEY_STORAGE, JSON.stringify({ ...current, ...config }));
  } catch (e) {}
}

export function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY_STORAGE) || '{}');
  } catch (e) {
    return {};
  }
}

export function checkApiKeyConfigured(): boolean {
  return checkAnyApiKeyConfigured();
}

export async function generateImage(options: { prompt: string }): Promise<{ success: boolean; images: string[]; message: string }> {
  return { success: false, images: [], message: '图像生成功能开发中' };
}

export async function transcribeAudio(file: File): Promise<{ success: boolean; text: string; message: string }> {
  return { success: false, text: '', message: '音频转录功能开发中' };
}
