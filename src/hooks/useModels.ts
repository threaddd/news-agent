import { useState, useEffect, useCallback } from 'react';
import { Model } from '../types';
import { fetchModels as apiFetchModels, checkAnyApiKeyConfigured, getApiKey, AI_PROVIDERS } from '../utils/api';

const STORAGE_KEY = 'defaultModel';

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const fetchModels = useCallback(async () => {
    try {
      const modelList = await apiFetchModels();
      setModels(modelList);
      
      // 检查哪个提供商有 API Key
      const configuredProvider = AI_PROVIDERS.find(p => getApiKey(p.id));
      
      // 获取当前保存的选择
      const savedModelId = localStorage.getItem(STORAGE_KEY);
      const savedProviderId = localStorage.getItem('defaultProviderId');
      
      if (modelList.length > 0) {
        let modelToUse: string;
        let providerToUse: string;
        
        // 优先使用已保存的选择
        if (savedModelId && savedProviderId && modelList.some(m => m.modelId === savedModelId)) {
          modelToUse = savedModelId;
          providerToUse = savedProviderId;
        } 
        // 其次使用有 API Key 的提供商
        else if (configuredProvider) {
          modelToUse = configuredProvider.models[0].id;
          providerToUse = configuredProvider.id;
        }
        // 否则使用第一个模型
        else {
          modelToUse = modelList[0].modelId;
          providerToUse = 'groq';
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

  // 初始加载
  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    selectedModel,
    selectedProviderId,
    setSelectedModel,
    setSelectedProviderId,
    fetchModels,
  };
}
