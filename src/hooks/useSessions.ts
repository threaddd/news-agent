import { useState, useEffect, useCallback } from 'react';
import { Session, Message } from '../types';
import { 
  loadSessionsFromStorage, 
  saveSessionsToStorage,
  deleteSessionFromStorage,
} from '../utils/api';

const STORAGE_KEYS = {
  sessionModels: 'sessionModels',
};

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // 每个会话的模型选择缓存
  const [sessionModels, setSessionModels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.sessionModels);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // 从本地存储加载会话列表
  const fetchSessions = useCallback(async () => {
    try {
      const loadedSessions = loadSessionsFromStorage();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, []);

  // 加载单个会话的消息
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    // 本地存储版本中，消息已经包含在会话中，不需要额外加载
    // 这个函数保留接口兼容性
  }, []);

  // 删除会话
  const deleteSession = useCallback(async (sessionId: string): Promise<string | null> => {
    try {
      deleteSessionFromStorage(sessionId);
      
      let navigateTo: string | null = null;
      
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionId);
        return filtered;
      });
      
      // 返回需要导航到的位置
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        if (remaining.length > 0) {
          navigateTo = `/chat/${remaining[0].id}`;
          setCurrentSessionId(remaining[0].id);
        } else {
          navigateTo = '/';
          setCurrentSessionId(null);
        }
      }
      
      return navigateTo;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return null;
    }
  }, [sessions, currentSessionId]);

  // 保存每个会话的模型选择到 localStorage
  const updateSessionModel = useCallback((sessionId: string, modelId: string) => {
    setSessionModels(prev => {
      const updated = { ...prev, [sessionId]: modelId };
      localStorage.setItem(STORAGE_KEYS.sessionModels, JSON.stringify(updated));
      return updated;
    });
    setSessions(prev => {
      const updated = prev.map(s => 
        s.id === sessionId ? { ...s, model: modelId } : s
      );
      // 同步到本地存储
      saveSessionsToStorage(updated);
      return updated;
    });
  }, []);

  // 添加新会话
  const addSession = useCallback((session: Session) => {
    setSessions(prev => {
      const updated = [session, ...prev];
      saveSessionsToStorage(updated);
      return updated;
    });
    setCurrentSessionId(session.id);
  }, []);

  // 更新会话
  const updateSession = useCallback((sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const updated = prev.map(s => 
        s.id === sessionId ? { ...s, ...updates } : s
      );
      saveSessionsToStorage(updated);
      return updated;
    });
  }, []);

  // 更新会话消息
  const updateSessionMessages = useCallback((sessionId: string, updater: (messages: Message[]) => Message[]) => {
    setSessions(prev => {
      const updated = prev.map(s => 
        s.id === sessionId ? { ...s, messages: updater(s.messages) } : s
      );
      saveSessionsToStorage(updated);
      return updated;
    });
  }, []);

  // 初始加载会话列表
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    sessionModels,
    fetchSessions,
    loadSessionMessages,
    deleteSession,
    updateSessionModel,
    addSession,
    updateSession,
    updateSessionMessages,
  };
}
