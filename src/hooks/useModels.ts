import { useState, useEffect, useCallback } from 'react';
import { Model } from '../types';
import { fetchModels as apiFetchModels } from '../utils/api';

const STORAGE_KEY = 'defaultModel';

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const fetchModels = useCallback(async () => {
    try {
      const modelList = await apiFetchModels();
      setModels(modelList);
      
      // 获取当前保存的模型
      const savedModelId = localStorage.getItem(STORAGE_KEY);
      
      if (modelList.length > 0) {
        // 如果有保存的模型且在列表中存在，使用保存的
        // 否则使用第一个模型
        const modelToUse = savedModelId && modelList.some(m => m.modelId === savedModelId)
          ? savedModelId
          : modelList[0].modelId;
        setSelectedModel(modelToUse);
        localStorage.setItem(STORAGE_KEY, modelToUse);
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
    setSelectedModel,
    fetchModels,
  };
}
