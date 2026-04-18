import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Popup, Tag, MessagePlugin } from 'tdesign-react';
import {
  Plus,
  Edit3,
  TrashIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Key,
  Save,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { CustomAgent, Agent, PermissionMode } from '../types';
import {
  AI_PROVIDERS,
  getProvider,
  getCurrentProvider,
  setCurrentProvider,
  getApiKey,
  setApiKey,
  checkAnyApiKeyConfigured,
} from '../utils/api';

interface SettingsPageProps {
  agents: Agent[];
  onAdd: (agent: Omit<CustomAgent, 'id'>) => void;
  onUpdate: (id: string, agent: Partial<CustomAgent>) => void;
  onDelete: (id: string) => void;
}

const ICONS = ['Bot', 'Code', 'FileText', 'Globe', 'Lightbulb', 'MessageCircle', 'User', 'Sparkles', 'Star', 'Zap'];
const ICON_COLORS = ['#0052d9', '#0594fa', '#00a870', '#ed7b2f', '#a25eb5', '#e34d57', '#8d2dev', '#00bc8b', '#5860e8'];

const PERMISSION_OPTIONS = [
  { value: 'default', label: 'default', description: '使用默认权限设置' },
  { value: 'auto', label: 'auto', description: '自动批准所有工具使用' },
  { value: 'manual', label: 'manual', description: '每次使用工具前请求确认' },
  { value: 'bypassPermissions', label: 'bypassPermissions', description: '跳过所有权限检查（谨慎使用）' },
];

const PRESET_TEMPLATES = [
  {
    name: '代码助手',
    description: '专注于编程和代码相关任务',
    systemPrompt: '你是一个专业的编程助手。你擅长编写、审查和解释代码。请提供清晰、高效且符合最佳实践的代码解决方案。',
    icon: 'Code',
    color: '#0594fa',
  },
  {
    name: '写作助手',
    description: '帮助撰写和优化各类文档',
    systemPrompt: '你是一个专业的写作助手。你擅长撰写、编辑和优化各类文档，包括文章、报告、邮件等。',
    icon: 'FileText',
    color: '#00a870',
  },
  {
    name: '翻译助手',
    description: '提供高质量的多语言翻译',
    systemPrompt: '你是一个专业的翻译助手。你精通多种语言，能够提供准确自然、符合语境的翻译。',
    icon: 'Globe',
    color: '#ed7b2f',
  },
  {
    name: '创意助手',
    description: '激发灵感，提供创意建议',
    systemPrompt: '你是一个富有创意的助手。你善于头脑风暴、提供创新想法和独特视角。',
    icon: 'Lightbulb',
    color: '#a25eb5',
  },
];

export function SettingsPage({
  agents,
  onAdd,
  onUpdate,
  onDelete
}: SettingsPageProps) {
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    icon: 'Bot',
    color: '#0052d9',
    permissionMode: 'default' as PermissionMode,
  });

  // AI 提供商状态
  const [currentProvider, setProviderState] = useState(getCurrentProvider);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingApi, setSavingApi] = useState(false);
  const [isConfigured, setIsConfigured] = useState(checkAnyApiKeyConfigured);

  // 检查配置状态
  useEffect(() => {
    const provider = getCurrentProvider();
    setProviderState(provider);
    setIsConfigured(checkAnyApiKeyConfigured());
  }, []);

  // 选择提供商
  const handleSelectProvider = (providerId: string) => {
    const provider = getProvider(providerId);
    if (!provider) return;

    setSelectedProviderId(providerId);
    setApiKeyInput(getApiKey(providerId) || '');
  };

  // 选择模型
  const handleSelectModel = (providerId: string, modelId: string) => {
    setCurrentProvider(providerId, modelId);
    setProviderState({ providerId, modelId });
  };

  // 保存 API Key
  const handleSaveApiKey = async () => {
    if (!selectedProviderId || !apiKeyInput.trim()) {
      MessagePlugin.warning('请输入 API Key');
      return;
    }

    setSavingApi(true);
    try {
      setApiKey(selectedProviderId, apiKeyInput.trim());
      MessagePlugin.success(`${getProvider(selectedProviderId)?.name} API Key 保存成功`);
      setShowApiConfig(false);
      setIsConfigured(true);
    } catch (error) {
      MessagePlugin.error('保存失败');
    } finally {
      setSavingApi(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      icon: 'Bot',
      color: '#0052d9',
      permissionMode: 'default',
    });
    setEditingAgent(null);
    setIsCreating(false);
  };

  const handleEdit = (agent: CustomAgent) => {
    if (agent.id === 'default') return;
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || '',
      systemPrompt: agent.systemPrompt,
      icon: agent.icon || 'Bot',
      color: agent.color || '#0052d9',
      permissionMode: agent.permissionMode || 'default',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      MessagePlugin.warning('请输入 Agent 名称');
      return;
    }

    if (!formData.systemPrompt.trim()) {
      MessagePlugin.warning('请输入系统提示词');
      return;
    }

    if (editingAgent) {
      onUpdate(editingAgent.id, {
        name: formData.name,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        icon: formData.icon,
        color: formData.color,
        permissionMode: formData.permissionMode,
      });
      MessagePlugin.success('更新成功');
    } else {
      onAdd({
        name: formData.name,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        icon: formData.icon,
        color: formData.color,
        permissionMode: formData.permissionMode,
      });
      MessagePlugin.success('创建成功');
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    MessagePlugin.success('删除成功');
  };

  const handleApplyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      icon: template.icon,
      color: template.color,
      permissionMode: 'default',
    });
    setIsCreating(true);
  };

  const currentProviderInfo = getProvider(currentProvider.providerId);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* AI 提供商配置 */}
        <div className="rounded-2xl shadow-sm border p-6" style={{ 
          backgroundColor: 'var(--td-bg-color-container)', 
          borderColor: 'var(--td-component-stroke)' 
        }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--td-text-color-primary)' }}>
            <Key className="w-5 h-5" />
            AI 提供商配置
          </h3>

          {/* 当前状态 */}
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--td-bg-color-component)' }}>
            {isConfigured ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentProviderInfo?.name || '已配置'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    当前模型: {currentProviderInfo?.models.find(m => m.id === currentProvider.modelId)?.name || currentProvider.modelId}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">未配置 API Key</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">请选择一个 AI 提供商并配置 API Key</p>
                </div>
              </>
            )}

            <Button
              size="small"
              variant="outline"
              onClick={() => {
                setSelectedProviderId(currentProvider.providerId);
                setApiKeyInput(getApiKey(currentProvider.providerId) || '');
                setShowApiConfig(!showApiConfig);
              }}
            >
              {showApiConfig ? '收起' : '配置'}
            </Button>
          </div>

          {/* 提供商列表 */}
          <div className="space-y-4">
            {AI_PROVIDERS.map((provider) => {
              const hasKey = !!getApiKey(provider.id);
              const isSelected = currentProvider.providerId === provider.id;

              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">{provider.name}</h4>
                      {provider.id === 'groq' && (
                        <Tag size="small" theme="success" variant="light">免费</Tag>
                      )}
                    </div>
                    {!hasKey && (
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleSelectProvider(provider.id)}
                      >
                        配置
                      </Button>
                    )}
                  </div>

                  {/* 模型选择 */}
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => hasKey ? handleSelectModel(provider.id, model.id) : handleSelectProvider(provider.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          currentProvider.modelId === model.id && isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {model.name}
                        {model.isFree && <span className="ml-1 text-green-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* API Key 配置面板 */}
          {showApiConfig && selectedProviderId && (
            <div className="mt-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                配置 {getProvider(selectedProviderId)?.name} API Key
              </h4>

              <div className="space-y-3">
                <Input
                  value={apiKeyInput}
                  onChange={(value) => setApiKeyInput(value as string)}
                  placeholder="输入 API Key"
                  type="password"
                  size="large"
                  className="!bg-white dark:!bg-gray-800"
                />

                <div className="flex gap-2">
                  <Button
                    theme="primary"
                    icon={<Save className="w-4 h-4" />}
                    loading={savingApi}
                    onClick={handleSaveApiKey}
                  >
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApiConfig(false)}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent 管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Agent 管理
            </h3>
            <Button
              theme="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreating(true)}
            >
              新建 Agent
            </Button>
          </div>

          {/* 新建/编辑表单 */}
          {(isCreating || editingAgent) && (
            <div className="mb-6 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {editingAgent ? '编辑 Agent' : '新建 Agent'}
                </h4>
                <Button size="small" variant="text" onClick={resetForm}>取消</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">名称</label>
                  <Input
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value as string })}
                    placeholder="给我的 Agent 起个名字"
                    size="large"
                    className="!bg-white dark:!bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述</label>
                  <Input
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value as string })}
                    placeholder="描述这个 Agent 的用途（可选）"
                    size="large"
                    className="!bg-white dark:!bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">系统提示词</label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="定义这个 Agent 的角色、能力和行为..."
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">权限模式</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, permissionMode: option.value as PermissionMode })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.permissionMode === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button theme="primary" onClick={handleSave}>
                    {editingAgent ? '保存修改' : '创建 Agent'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>取消</Button>
                </div>
              </div>
            </div>
          )}

          {/* 模板快速创建 */}
          {!isCreating && !editingAgent && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">快速开始：选择一个模板</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleApplyTemplate(template)}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: template.color }}
                    >
                      {template.name[0]}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent 列表 */}
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: agent.color || '#0052d9' }}
                >
                  {agent.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {agent.name}
                    </p>
                    {agent.id === 'default' && (
                      <Tag size="small" variant="outline">默认</Tag>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {agent.description || agent.systemPrompt?.slice(0, 50) + '...'}
                  </p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {agent.id !== 'default' && (
                    <>
                      <Button
                        size="small"
                        variant="outline"
                        icon={<Edit3 className="w-4 h-4" />}
                        onClick={() => handleEdit(agent)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        theme="danger"
                        icon={<TrashIcon className="w-4 h-4" />}
                        onClick={() => handleDelete(agent.id)}
                      >
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
