import { Button, Tooltip, Tag } from 'tdesign-react';
import { 
  RefreshIcon,
  SunnyIcon,
  MoonIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
} from 'tdesign-icons-react';
import { Bot, Newspaper } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Model, Session, Agent, Theme } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface HeaderProps {
  isSettingsPage: boolean;
  isToolsPage: boolean;
  sidebarOpen: boolean;
  theme: Theme;
  currentSession: Session | undefined;
  currentAgent: Agent | undefined;
  models: Model[];
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onRefreshModels: () => void;
}

export function Header({
  isSettingsPage,
  isToolsPage,
  sidebarOpen,
  theme,
  currentSession,
  currentAgent,
  models,
  onToggleSidebar,
  onToggleTheme,
  onRefreshModels,
}: HeaderProps) {
  const formatModelName = (modelId: string) => {
    const model = models.find(m => m.modelId === modelId);
    const name = model?.name || modelId;
    return name
      .replace(/^(Claude|GPT|Gemini|Kimi|DeepSeek|Qwen|GLM)\s*/i, '')
      .replace(/-/g, ' ')
      .trim() || name;
  };

  return (
    <header 
      className="h-14 flex justify-between items-center px-4 flex-shrink-0 border-b backdrop-blur-xl transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--td-bg-color-page-alpha, rgba(255, 255, 255, 0.8))',
        borderColor: 'var(--td-border-level-1-color)',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="text"
          shape="circle"
          icon={sidebarOpen ? <MenuFoldIcon /> : <MenuUnfoldIcon />}
          onClick={onToggleSidebar}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        />
        {!isSettingsPage && currentAgent && (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ 
              background: 'linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover))' 
            }}
          >
            {(() => {
              const Icon = ICON_MAP[currentAgent.icon || 'Bot'] || Bot;
              return <Icon size={16} color="white" />;
            })()}
          </div>
        )}
        {isToolsPage && (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444, #f97316)' 
            }}
          >
            <Newspaper size={16} color="white" />
          </div>
        )}
        <h1 
          className="text-base font-semibold"
          style={{ color: 'var(--td-text-color-primary)' }}
        >
          {isSettingsPage ? '设置' : isToolsPage ? '新闻工作台' : (currentSession?.title || APP_CONFIG.name)}
        </h1>
        {!isSettingsPage && !isToolsPage && currentSession && (
          <Tag 
            size="small" 
            variant="light"
            style={{ 
              background: 'linear-gradient(135deg, var(--td-brand-color-light), rgba(249, 115, 22, 0.1))',
              color: 'var(--td-brand-color)',
              border: 'none'
            }}
          >
            {formatModelName(currentSession.model)}
          </Tag>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
          <Button
            variant="text"
            shape="circle"
            icon={theme === 'light' ? <MoonIcon /> : <SunnyIcon />}
            onClick={onToggleTheme}
            style={{ 
              background: theme === 'light' ? 'var(--td-bg-color-component)' : 'var(--td-bg-color-component)',
              transition: 'all 0.3s ease'
            }}
            className="hover:scale-110 transition-transform duration-300"
          />
        </Tooltip>
        {!isSettingsPage && !isToolsPage && (
          <Tooltip content="刷新模型列表">
            <Button
              variant="text"
              shape="circle"
              icon={<RefreshIcon />}
              onClick={onRefreshModels}
              className="hover:scale-110 hover:rotate-180 transition-all duration-500"
            />
          </Tooltip>
        )}
      </div>
    </header>
  );
}
