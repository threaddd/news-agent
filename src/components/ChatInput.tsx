import { useRef, useCallback, useEffect, useState } from 'react';
import { Select, Tooltip, MessagePlugin } from 'tdesign-react';
import { ChatSender } from '@tdesign-react/chat';
import { ChevronDownIcon, LockOnIcon, LockOffIcon, EditIcon, TaskIcon } from 'tdesign-icons-react';
import { Sparkles } from 'lucide-react';
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
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: '每次操作都需要确认'
  },
  'acceptEdits': { 
    label: '自动编辑', 
    shortLabel: '自动编辑',
    icon: <EditIcon />, 
    color: 'var(--td-success-color)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    description: '自动允许文件编辑操作'
  },
  'plan': { 
    label: '仅规划', 
    shortLabel: '仅规划',
    icon: <TaskIcon />, 
    color: 'var(--td-warning-color)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: '只生成计划，不执行操作'
  },
  'bypassPermissions': { 
    label: '全部允许', 
    shortLabel: '全部允许',
    icon: <LockOffIcon />, 
    color: 'var(--td-error-color)',
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
      className="px-4 pb-5 pt-3 chat-input-container relative"
      style={{ backgroundColor: 'var(--td-bg-color-page)' }}
    >
      {/* 聚焦时的光晕效果 */}
      {isFocused && (
        <div 
          className="absolute inset-x-4 top-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(239,68,68,0.06), transparent)',
            filter: 'blur(20px)',
          }}
        />
      )}
      
      <div className="max-w-3xl mx-auto relative">
        {/* 输入框容器 - 精致设计 */}
        <div 
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            border: isFocused ? '2px solid var(--td-brand-color)' : '1.5px solid var(--td-component-stroke)',
            backgroundColor: 'var(--td-bg-color-container)',
            boxShadow: isFocused 
              ? '0 8px 32px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(0,0,0,0.05)' 
              : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
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
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {/* 桌面端显示模型和权限选择器 - 精致设计 */}
              {!isMobile && (
                <div slot="footer-prefix" className="flex items-center gap-3">
                  {/* 模型选择器 - 胶囊设计 */}
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                    style={{ 
                      backgroundColor: 'var(--td-bg-color-secondarycontainer)',
                      border: '1px solid var(--td-component-stroke)',
                    }}
                  >
                    <Sparkles size={14} style={{ color: 'var(--td-brand-color)' }} />
                    <Select
                      value={selectedModel}
                      onChange={(value) => onModelChange(value as string)}
                      placeholder="选择模型"
                      size="small"
                      style={{ width: 140 }}
                      filterable
                      borderless
                      suffixIcon={<ChevronDownIcon size={14} />}
                    >
                      {models.map(model => (
                        <Select.Option key={model.modelId} value={model.modelId} label={model.name}>
                          {model.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  
                  {/* 权限模式选择器 - 精致胶囊 */}
                  <Tooltip content={currentModeConfig.description} placement="top">
                    <div 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: currentModeConfig.bgColor,
                        border: `1px solid ${currentModeConfig.color}30`,
                      }}
                    >
                      <span style={{ color: currentModeConfig.color }}>
                        {currentModeConfig.icon}
                      </span>
                      <Select
                        value={permissionMode}
                        onChange={(value) => onPermissionModeChange(value as PermissionMode)}
                        size="small"
                        style={{ width: 100 }}
                        borderless
                        suffixIcon={<ChevronDownIcon size={12} style={{ color: currentModeConfig.color }} />}
                        popupProps={{
                          overlayInnerStyle: { width: 180 }
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
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: config.bgColor, color: config.color }}
                                >
                                  {config.icon}
                                </span>
                                <div>
                                  <div className="text-sm font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                                    {config.shortLabel}
                                  </div>
                                </div>
                              </div>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </div>
                  </Tooltip>
                </div>
              )}
            </ChatSender>
          </div>
        </div>
        
        {/* 底部提示 - 精致设计 */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" 
            style={{ 
              backgroundColor: 'var(--td-bg-color-secondarycontainer)',
              color: 'var(--td-text-color-placeholder)' 
            }}>
            <Sparkles size={10} />
            <span>AI 辅助生产</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--td-text-color-disabled)' }} />
          <div className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
            请核实事实性信息
          </div>
          {!isMobile && (
            <>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--td-text-color-disabled)' }} />
              <div className="text-xs px-2 py-0.5 rounded font-medium" 
                style={{ 
                  backgroundColor: 'var(--td-bg-color-secondarycontainer)',
                  color: 'var(--td-text-color-secondary)' 
                }}>
                ⌘ + Enter 发送
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
