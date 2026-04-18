import { useState, useCallback } from 'react';
import { Message, ToolCall, PermissionRequest, PermissionMode, Session, CustomAgent, ContentBlock } from '../types';
import { 
  sendMessage as apiSendMessage,
  createSessionInStorage,
  saveSessionsToStorage,
} from '../utils/api';

const STORAGE_KEYS = {
  draftInput: 'draftInput',
};

interface UseChatOptions {
  currentSession: Session | undefined;
  currentSessionId: string | null;
  selectedModel: string;
  getAgent: (id: string) => CustomAgent | undefined;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  updateSessionMessages: (sessionId: string, updater: (messages: Message[]) => Message[]) => void;
  updateSessionModel: (sessionId: string, modelId: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  initialAgentId?: string;
}

interface NewChatOptions {
  agentId: string;
  cwd: string;
  permissionMode: PermissionMode;
}

export function useChat(options: UseChatOptions) {
  const {
    currentSession,
    currentSessionId,
    selectedModel,
    getAgent,
    updateSessionModel,
    setCurrentSessionId,
    setSessions,
    initialAgentId,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.draftInput) || '';
  });
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 保存输入框内容到 localStorage
  const saveInput = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  // 发送消息
  const sendMessage = useCallback(async (
    messageContent: string,
    newChatOptions?: NewChatOptions,
    onNavigate?: (path: string) => void
  ) => {
    if (!messageContent.trim() || isLoading) return;

    let sessionId = currentSessionId;
    let currentCwd = currentSession?.cwd;
    let currentAgentId = currentSession?.agentId || 'default';
    
    // 如果没有当前会话，创建新会话
    if (!sessionId && newChatOptions) {
      const effectiveAgentId = initialAgentId || newChatOptions.agentId;
      
      const newSession: Session = {
        id: crypto.randomUUID(),
        title: messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : ''),
        model: selectedModel,
        agentId: effectiveAgentId,
        cwd: newChatOptions.cwd || undefined,
        permissionMode: newChatOptions.permissionMode,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };
      
      setSessions(prev => {
        const updated = [newSession, ...prev];
        saveSessionsToStorage(updated);
        return updated;
      });
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
      currentCwd = newSession.cwd;
      currentAgentId = newSession.agentId;
      
      updateSessionModel(newSession.id, selectedModel);
      
      onNavigate?.(`/chat/${newSession.id}`);
    }

    const tempUserMessageId = crypto.randomUUID();
    const tempAssistantMessageId = crypto.randomUUID();

    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    const assistantMessage: Message = {
      id: tempAssistantMessageId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date(),
      isStreaming: true,
      contentBlocks: []
    };

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const newTitle = s.messages.length === 0 
            ? messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '')
            : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage, assistantMessage]
          };
        }
        return s;
      });
      saveSessionsToStorage(updated);
      return updated;
    });

    setInputValue('');
    localStorage.removeItem(STORAGE_KEYS.draftInput);
    setIsLoading(true);

    // 创建 AbortController 用于取消请求
    const controller = new AbortController();
    setAbortController(controller);

    try {
      await apiSendMessage({
        sessionId: sessionId!,
        message: messageContent,
        model: selectedModel,
        agentId: currentAgentId,
        getAgent,
        permissionMode: currentSession?.permissionMode || 'default',
        cwd: currentCwd,
        signal: controller.signal,
        onInit: ({ sessionId: realSessionId, assistantMessageId: realMsgId }) => {
          // 更新会话 ID（如果不同）
          if (realSessionId !== sessionId) {
            setSessions(prev => {
              const updated = prev.map(s => 
                s.id === sessionId ? { ...s, id: realSessionId } : s
              );
              saveSessionsToStorage(updated);
              return updated;
            });
            setCurrentSessionId(realSessionId);
          }
        },
        onText: (content) => {
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map(m => 
                    m.id === tempAssistantMessageId 
                      ? { ...m, content: m.content + content }
                      : m
                  )
                };
              }
              return s;
            });
            saveSessionsToStorage(updated);
            return updated;
          });
        },
        onTool: (toolCall) => {
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map(m => 
                    m.id === tempAssistantMessageId 
                      ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
                      : m
                  )
                };
              }
              return s;
            });
            saveSessionsToStorage(updated);
            return updated;
          });
        },
        onToolResult: (toolId, content, isError) => {
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map(m => {
                    if (m.id === tempAssistantMessageId && m.toolCalls) {
                      return {
                        ...m,
                        toolCalls: m.toolCalls.map(t => 
                          t.id === toolId 
                            ? { ...t, status: isError ? 'error' : 'completed', result: content, isError }
                            : t
                        )
                      };
                    }
                    return m;
                  })
                };
              }
              return s;
            });
            saveSessionsToStorage(updated);
            return updated;
          });
        },
        onDone: () => {
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map(m => 
                    m.id === tempAssistantMessageId 
                      ? { ...m, isStreaming: false }
                      : m
                  ),
                  updatedAt: new Date()
                };
              }
              return s;
            });
            saveSessionsToStorage(updated);
            return updated;
          });
        },
        onError: (error) => {
          console.error('Chat error:', error);
          setSessions(prev => {
            const updated = prev.map(s => {
              if (s.id === sessionId) {
                return {
                  ...s,
                  messages: s.messages.map(m => 
                    m.id === tempAssistantMessageId 
                      ? { ...m, content: `错误: ${error.message || '请求失败，请重试'}`, isStreaming: false }
                      : m
                  )
                };
              }
              return s;
            });
            saveSessionsToStorage(updated);
            return updated;
          });
        },
      });
    } catch (error) {
      // 错误已在 onError 中处理
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [
    currentSession, 
    currentSessionId, 
    selectedModel, 
    getAgent, 
    updateSessionModel, 
    setCurrentSessionId, 
    setSessions, 
    isLoading,
    initialAgentId
  ]);

  // 处理停止事件
  const handleStop = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
    setIsLoading(false);
  }, [abortController]);

  // 处理权限允许
  const handlePermissionAllow = useCallback(async () => {
    setPermissionRequest(null);
  }, []);

  // 处理权限拒绝
  const handlePermissionDeny = useCallback(async () => {
    setPermissionRequest(null);
  }, []);

  return {
    isLoading,
    inputValue,
    setInputValue: saveInput,
    permissionRequest,
    sendMessage,
    handleStop,
    handlePermissionAllow,
    handlePermissionDeny,
  };
}
