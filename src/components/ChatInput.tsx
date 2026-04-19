import { useRef, useCallback, useEffect, useState } from 'react';
import { Select, Tooltip, MessagePlugin } from 'tdesign-react';
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
    color: 'var(--td-brand-color)',
    bgColor: 'var(--td-brand-color-light)',
    description: '每次操作都需要确认'
  },
  'acceptEdits': { 
    label: '自动编辑', 
    shortLabel: '自动编辑',
    icon: <EditIcon />, 
    color: 'var(--td-success-color)',
    bgColor: 'rgba(43, 164, 113, 0.08)',
    description: '自动允许文件编辑操作'
  },
  'plan': { 
    label: '仅规划', 
    shortLabel: '仅规划',
    icon: <TaskIcon />, 
    color: 'var(--td-warning-color)',
    bgColor: 'rgba(227, 115, 24, 0.08)',
    description: '只生成计划，不执行操作'
  },
  'bypassPermissions': { 
    label: '全部允许', 
    shortLabel: '全部允许',
    icon: <LockOffIcon />, 
    color: 'var(--td-error-color)',
    bgColor: 'rgba(213, 73, 65, 0.08)',
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 键盘快捷键：Ctrl/Cmd + Enter 发送
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
          onSend(inputValue.trim());
        }
      }
    };

    const textarea = textareaRef.current || document.querySelector('textarea');
    textarea?.addEventListener('keydown', handleKeyDown);
    return () => textarea?.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isLoading, onSend]);

  const handleSend = useCallback((e: any) => {
    const content = e?.detail?.message || e?.detail || e?.message || inputValue;
    
    if (models.length === 0) {
      MessagePlugin.warning('正在加载模型，请稍候...');
      return;
    }
    
    if (content && typeof content === 'string' && content.trim()) {
      onSend(content.trim());
    } else if (inputValue.trim()) {
      onSend(inputValue.trim());
    }
  }, [inputValue, models.length, onSend]);

  const handleChange = useCallback((e: any) => {
    const value = e?.detail ?? e ?? '';
    onChange(typeof value === 'string' ? value : '');
  }, [onChange]);

  const currentModeConfig = PERMISSION_MODE_CONFIG[permissionMode];

  return (
    <div 
      className="px-4 pb-5 pt-3 chat-input-container"
      style={{ backgroundColor: 'var(--td-bg-color-page)' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* 输入框容器 */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{
            border: '1.5px solid var(--td-component-stroke)',
            backgroundColor: 'var(--td-bg-color-container)',
            boxShadow: 'var(--td-shadow-1)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={() => {
            const el = document.activeElement?.closest('.chat-input-wrapper');
            if (el) {
              (el as HTMLElement).style.borderColor = 'var(--td-brand-color)';
              (el as HTMLElement).style.boxShadow = '0 0 0 2px var(--td-brand-color-focus)';
            }
          }}
          onBlur={() => {
            const el = document.querySelector('.chat-input-wrapper');
            if (el) {
              (el as HTMLElement).style.borderColor = 'var(--td-component-stroke)';
              (el as HTMLElement).style.boxShadow = 'var(--td-shadow-1)';
            }
          }}
        >
          <div className="chat-input-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <ChatSender
              ref={chatSenderRef}
              value={inputValue}
              placeholder="输入消息，AI 助手为您服务..."
              loading={isLoading}
              autosize={{ minRows: 1, maxRows: 6 }}
              actions={['send']}
              onSend={handleSend}
              onStop={onStop}
              onChange={handleChange}
            >
              {/* 桌面端显示模型和权限选择器 */}
              {!isMobile && (
                <div slot="footer-prefix" className="flex items-center gap-2.5">
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
                      <Select.Option key={model.modelId} value={model.modelId} label={model.name}>
                        {model.name}
                      </Select.Option>
                    ))}
                  </Select>
                  
                  {/* 分隔点 */}
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--td-text-color-placeholder)' }} />
                  
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
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
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
              )}
            </ChatSender>
          </div>
        </div>
        
        {/* 底部提示 */}
        <p className={`text-center text-xs mt-2 ${isMobile ? '' : 'hide-on-mobile'}`} style={{ color: 'var(--td-text-color-placeholder)' }}>
          {isMobile ? '请核实事实性信息' : '新闻专业主义 · AI 辅助生产 · 请核实事实性信息 · Ctrl+Enter 发送'}
        </p>
      </div>
    </div>
  );
}
