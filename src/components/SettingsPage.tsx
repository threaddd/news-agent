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
} from 'lucide-react';
import { CustomAgent, Agent, PermissionMode } from '../types';
import { saveConfig, loadConfig, checkApiKeyConfigured } from '../utils/api';

interface SettingsPageProps {
  agents: Agent[];
  onAdd: (agent: Omit<CustomAgent, 'id'>) => void;
  onUpdate: (id: string, agent: Partial<CustomAgent>) => void;
  onDelete: (id: string) => void;
}

interface LoginStatus {
  isLoggedIn: boolean;
  checking: boolean;
  method?: 'api_key' | 'auth_token';
  envConfigured?: boolean;
  cliConfigured?: boolean;
  error?: string;
  apiKey?: string;
  envVars?: Record<string, string>;
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
    systemPrompt: '你是一个专业的编程助手。你擅长编写、审查和解释代码。请提供清晰、高效且符合最佳实践的代码解决方案。在解释时，请考虑代码的可读性、性能和可维护性。',
    icon: 'Code',
    color: '#0594fa',
  },
  {
    name: '写作助手',
    description: '帮助撰写和优化各类文档',
    systemPrompt: '你是一个专业的写作助手。你擅长撰写、编辑和优化各类文档，包括文章、报告、邮件等。请帮助用户提升文字表达的清晰度、逻辑性和吸引力。',
    icon: 'FileText',
    color: '#00a870',
  },
  {
    name: '翻译助手',
    description: '提供高质量的多语言翻译',
    systemPrompt: '你是一个专业的翻译助手。你精通多种语言，能够提供准确、自然、符合语境的翻译。请在翻译时保持原文的语气和风格，同时确保目标语言的地道表达。',
    icon: 'Globe',
    color: '#ed7b2f',
  },
  {
    name: '创意助手',
    description: '激发灵感，提供创意建议',
    systemPrompt: '你是一个富有创意的助手。你善于头脑风暴、提供创新想法和独特视角。请帮助用户突破思维定式，探索新的可能性，激发创造力。',
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
  
  // 登录状态
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({
    isLoggedIn: false,
    checking: true,
  });
  
  // 环境变量配置
  const [showEnvConfig, setShowEnvConfig] = useState(false);
  const [envConfig, setEnvConfig] = useState({
    apiKey: '',
  });
  const [savingEnv, setSavingEnv] = useState(false);

  // 检查登录状态
  const checkLoginStatus = useCallback(async () => {
    setLoginStatus(prev => ({ ...prev, checking: true, error: undefined }));
    
    try {
      const isConfigured = checkApiKeyConfigured();
      const storedConfig = loadConfig();
      
      setLoginStatus({
        isLoggedIn: isConfigured || !!storedConfig.apiKey,
        checking: false,
        method: isConfigured || storedConfig.apiKey ? 'api_key' : undefined,
        envConfigured: isConfigured || !!storedConfig.apiKey,
        apiKey: isConfigured ? '***' : (storedConfig.apiKey ? '***' : undefined),
      });
    } catch (error: any) {
      setLoginStatus({
        isLoggedIn: false,
        checking: false,
        error: error?.message || '检查登录状态失败',
      });
    }
  }, []);
  
  // 保存 API Key 配置
  const saveEnvConfig = async () => {
    if (!envConfig.apiKey.trim()) {
      MessagePlugin.warning('请输入 API Key');
      return;
    }
    
    setSavingEnv(true);
    try {
      saveConfig({ apiKey: envConfig.apiKey.trim() });
      localStorage.setItem('codebuddy_api_key', envConfig.apiKey.trim());
      
      MessagePlugin.success('API Key 保存成功');
      setShowEnvConfig(false);
      setEnvConfig({ apiKey: '' });
      checkLoginStatus();
    } catch (error: any) {
      MessagePlugin.error(error?.message || '保存失败');
    } finally {
      setSavingEnv(false);
    }
  };

  // 初始化时检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* API 配置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API 配置
          </h3>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            {loginStatus.checking ? (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                检查中...
              </div>
            ) : loginStatus.isLoggedIn ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">已配置 API Key</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {loginStatus.method === 'api_key' ? '使用环境变量/本地存储的 API Key' : '已配置'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">未配置 API Key</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">请配置 CodeBuddy API Key 以使用 AI 功能</p>
                </div>
              </>
            )}
            
            <Button 
              size="small" 
              variant="outline"
              onClick={() => setShowEnvConfig(!showEnvConfig)}
            >
              {showEnvConfig ? '取消' : loginStatus.isLoggedIn ? '修改' : '配置'}
            </Button>
          </div>
          
          {showEnvConfig && (
            <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    CodeBuddy API Key
                  </label>
                  <Input
                    value={envConfig.apiKey}
                    onChange={(value) => setEnvConfig({ apiKey: value as string })}
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                    type="password"
                    size="large"
                    className="!bg-white dark:!bg-gray-800"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    从 <a href="https://www.codebuddy.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">CodeBuddy</a> 获取 API Key
                  </p>
                </div>
                
                <Button 
                  theme="primary"
                  icon={<Save className="w-4 h-4" />}
                  loading={savingEnv}
                  onClick={saveEnvConfig}
                >
                  保存配置
                </Button>
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
