import { useRef, useCallback } from 'react';
import { Select, Tooltip } from 'tdesign-react';
import { ChatSender } from '@tdesign-react/chat';
import { ChevronDownIcon, LockOnIcon, LockOffIcon, EditIcon, TaskIcon } from 'tdesign-icons-react';
import { Model, PermissionMode } from '../types';

interface ChatInputProps {
  inputValue: string;
  selectedModel: string;
  models: Model[];
  isLoading: boolean;
  permissionMode: PermissionMode;
  onSend: (message: string) => void;
  onStop: () => void;
  onChange: (value: string) => void;
  onModelChange: (modelId: string) => void;
  onPermissionModeChange: (mode: PermissionMode) => void;
}

// 权限模式配置
const PERMISSION_MODE_CONFIG: Record<PermissionMode, { 
  label: string; 
  shortLabel: string;
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
  description: string;
}> = {
  'default': { 
    label: '默认模式', 
    shortLabel: '默认',
    icon: <LockOnIcon />, 
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    description: '每次操作都需要确认'
  },
  'acceptEdits': { 
    label: '自动编辑', 
    shortLabel: '自动编辑',
    icon: <EditIcon />, 
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: '自动允许文件编辑操作'
  },
  'plan': { 
    label: '仅规划', 
    shortLabel: '仅规划',
    icon: <TaskIcon />, 
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: '只生成计划，不执行操作'
  },
  'bypassPermissions': { 
    label: '全部允许', 
    shortLabel: '全部允许',
    icon: <LockOffIcon />, 
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: '跳过所有权限确认（危险）'
  },
};

export function ChatInput({
  inputValue,
  selectedModel,
  models,
  isLoading,
  permissionMode,
  onSend,
  onStop,
  onChange,
  onModelChange,
  onPermissionModeChange,
}: ChatInputProps) {
  const chatSenderRef = useRef<any>(null);

  const handleSend = useCallback((e: any) => {
    console.log('ChatSender send event:', e);
    const content = e?.detail?.message || e?.detail || e?.message || inputValue;
    if (content && typeof content === 'string' && content.trim() && selectedModel) {
      onSend(content.trim());
    } else if (inputValue.trim() && selectedModel) {
      onSend(inputValue.trim());
    }
  }, [inputValue, selectedModel, onSend]);

  const handleChange = useCallback((e: any) => {
    console.log('ChatSender change event:', e);
    const value = e?.detail ?? e ?? '';
    onChange(typeof value === 'string' ? value : '');
  }, [onChange]);

  const currentModeConfig = PERMISSION_MODE_CONFIG[permissionMode];

  return (
    <div 
      className="px-4 pb-6 pt-4"
      style={{ 
        backgroundColor: 'var(--td-bg-color-page)'
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* 渐变边框容器 */}
        <div 
          className="rounded-2xl p-[2px]"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(249, 115, 22, 0.3), rgba(239, 68, 68, 0.3))',
          }}
        >
          <div 
            className="rounded-[18px]"
            style={{ backgroundColor: 'var(--td-bg-color-page)' }}
          >
            <ChatSender
              ref={chatSenderRef}
              value={inputValue}
              placeholder="输入消息，AI 助手为您服务..."
              disabled={!selectedModel}
              loading={isLoading}
              autosize={{ minRows: 1, maxRows: 6 }}
              actions={['send']}
              onSend={handleSend}
              onStop={onStop}
              onChange={handleChange}
            >
              {/* 模型选择器和权限模式选择器放在 footer-prefix 插槽 */}
              <div slot="footer-prefix" className="flex items-center gap-3">
                {/* 模型选择器 */}
                <Select
                  value={selectedModel}
                  onChange={(value) => onModelChange(value as string)}
                  placeholder="选择模型"
                  size="small"
                  style={{ width: 150 }}
                  filterable
                  borderless
                  suffixIcon={<ChevronDownIcon />}
                >
                  {models.map(model => (
                    <Select.Option key={model.modelId} value={model.modelId} label={model.name} />
                  ))}
                </Select>
                
                {/* 分隔线 */}
                <div 
                  className="h-4 w-px"
                  style={{ background: 'linear-gradient(180deg, transparent, var(--td-component-stroke), transparent)' }}
                />
                
                {/* 权限模式选择器 */}
                <Tooltip content={currentModeConfig.description} placement="top">
                  <Select
                    value={permissionMode}
                    onChange={(value) => onPermissionModeChange(value as PermissionMode)}
                    size="small"
                    style={{ width: 120 }}
                    borderless
                    suffixIcon={<ChevronDownIcon />}
                    prefixIcon={
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          color: currentModeConfig.color,
                          backgroundColor: currentModeConfig.bgColor,
                        }}
                      >
                        {currentModeConfig.icon}
                        <span>{currentModeConfig.shortLabel}</span>
                      </span>
                    }
                    popupProps={{
                      overlayInnerStyle: { width: 160 }
                    }}
                  >
                    {(Object.keys(PERMISSION_MODE_CONFIG) as PermissionMode[]).map(mode => {
                      const config = PERMISSION_MODE_CONFIG[mode];
                      return (
                        <Select.Option 
                          key={mode} 
                          value={mode} 
                          label={config.shortLabel}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-5 h-5 rounded flex items-center justify-center"
                              style={{ backgroundColor: config.bgColor, color: config.color }}
                            >
                              {config.icon}
                            </span>
                            <span className="text-sm">{config.shortLabel}</span>
                          </div>
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Tooltip>
              </div>
            </ChatSender>
          </div>
        </div>
        
        {/* 底部提示 */}
        <p className="text-center text-xs mt-2" style={{ color: 'var(--td-text-color-placeholder)' }}>
          新闻专业主义 · AI 辅助生产 · 请核实事实性信息
        </p>
      </div>
    </div>
  );
}
