import { useState, useEffect, useCallback } from 'react';
import { Model } from '../types';
import { fetchModels as apiFetchModels, getApiKey, getCurrentProvider, AI_PROVIDERS } from '../utils/api';

const STORAGE_KEY = 'defaultModel';

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const fetchModels = useCallback(async () => {
    try {
      const modelList = await apiFetchModels();
      setModels(modelList);
      
      // 获取当前保存的选择（优先从 localStorage 读取）
      const saved = getCurrentProvider();
      const savedModelId = localStorage.getItem(STORAGE_KEY);
      const savedProviderId = localStorage.getItem('defaultProviderId');
      
      if (modelList.length > 0) {
        let modelToUse: string;
        let providerToUse: string;
        
        // 优先使用已保存的选择
        if (savedModelId && savedProviderId) {
          // 验证选择的模型是否仍然有效
          const modelExists = modelList.some(m => m.modelId === savedModelId);
          const providerHasKey = getApiKey(savedProviderId) || savedProviderId === 'ollama';
          
          if (modelExists && providerHasKey) {
            modelToUse = savedModelId;
            providerToUse = savedProviderId;
          } else if (providerHasKey) {
            // 模型不存在但提供商有 key，切换到该提供商的第一个模型
            const provider = AI_PROVIDERS.find(p => p.id === savedProviderId);
            if (provider && provider.models.length > 0) {
              modelToUse = provider.models[0].id;
              providerToUse = savedProviderId;
            } else {
              modelToUse = savedModelId;
              providerToUse = savedProviderId;
            }
          } else {
            modelToUse = '';
            providerToUse = '';
          }
        }
        
        // 如果没有有效的保存选择，寻找有 API Key 的提供商
        if (!modelToUse || !providerToUse) {
          const configuredProvider = AI_PROVIDERS.find(p => getApiKey(p.id));
          if (configuredProvider && configuredProvider.models.length > 0) {
            modelToUse = configuredProvider.models[0].id;
            providerToUse = configuredProvider.id;
          } else {
            // 默认使用 Groq
            const groqProvider = AI_PROVIDERS.find(p => p.id === 'groq');
            modelToUse = groqProvider?.models[0]?.id || modelList[0].modelId;
            providerToUse = 'groq';
          }
        }
        
        setSelectedModel(modelToUse);
        setSelectedProviderId(providerToUse);
        localStorage.setItem(STORAGE_KEY, modelToUse);
        localStorage.setItem('defaultProviderId', providerToUse);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  }, []);

  // 初始加载 + 监听 localStorage 变化
  useEffect(() => {
    fetchModels();
    
    // 监听设置页面的保存事件
    const handleStorageChange = () => {
      fetchModels();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('modelConfigChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('modelConfigChanged', handleStorageChange);
    };
  }, [fetchModels]);

  return {
    models,
    selectedModel,
    selectedProviderId,
    setSelectedModel,
    setSelectedProviderId,
    fetchModels,
  };
}
