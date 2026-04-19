import { Button, Tooltip, Tag, Popup } from 'tdesign-react';
import { 
  MenuFoldIcon,
  MenuUnfoldIcon,
  SunnyIcon,
  MoonIcon,
  DesktopIcon,
} from 'tdesign-icons-react';
import { Bot, Newspaper } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Model, Session, Agent, Theme, ThemeMode } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface HeaderProps {
  isSettingsPage: boolean;
  isToolsPage: boolean;
  sidebarOpen: boolean;
  theme: Theme;
  themeMode: ThemeMode;
  currentSession: Session | undefined;
  currentAgent: Agent | undefined;
  models: Model[];
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  onRefreshModels: () => void;
}

export function Header({
  isSettingsPage,
  isToolsPage,
  sidebarOpen,
  theme,
  themeMode,
  currentSession,
  currentAgent,
  models,
  onToggleSidebar,
  onToggleTheme,
  onSetThemeMode,
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

  const themeIcon = themeMode === 'light' ? <SunnyIcon /> : themeMode === 'dark' ? <MoonIcon /> : <DesktopIcon />;
  const themeLabel = themeMode === 'light' ? '浅色模式' : themeMode === 'dark' ? '深色模式' : '跟随系统';

  return (
    <header 
      className="h-14 flex justify-between items-center px-4 flex-shrink-0 border-b backdrop-blur-xl"
      style={{ 
        backgroundColor: 'var(--td-bg-color-page-alpha)',
        borderColor: 'var(--td-component-stroke)',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="text"
          shape="circle"
          icon={sidebarOpen ? <MenuFoldIcon /> : <MenuUnfoldIcon />}
          onClick={onToggleSidebar}
        />
        {!isSettingsPage && currentAgent && (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
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
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' 
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
              background: 'var(--td-brand-color-light)',
              color: 'var(--td-brand-color)',
              border: 'none'
            }}
          >
            {formatModelName(currentSession.model)}
          </Tag>
        )}
      </div>
      <div className="flex items-center gap-1">
        {/* 主题切换器 - 三模式 */}
        <Popup
          trigger="click"
          placement="bottom-right"
          showArrow
          overlayInnerStyle={{ padding: '6px', borderRadius: '10px', minWidth: '140px' }}
          content={
            <div className="flex flex-col gap-0.5">
              {([
                { mode: 'light' as ThemeMode, icon: <SunnyIcon size={16} />, label: '浅色模式' },
                { mode: 'dark' as ThemeMode, icon: <MoonIcon size={16} />, label: '深色模式' },
                { mode: 'system' as ThemeMode, icon: <DesktopIcon size={16} />, label: '跟随系统' },
              ]).map(item => (
                <button
                  key={item.mode}
                  onClick={() => onSetThemeMode(item.mode)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors"
                  style={{
                    backgroundColor: themeMode === item.mode ? 'var(--td-brand-color-light)' : 'transparent',
                    color: themeMode === item.mode ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
                    fontWeight: themeMode === item.mode ? 600 : 400,
                  }}
                >
                  {item.icon}
                  {item.label}
                  {themeMode === item.mode && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--td-brand-color)' }} />
                  )}
                </button>
              ))}
            </div>
          }
        >
          <Tooltip content={themeLabel}>
            <Button
              variant="text"
              shape="circle"
              icon={themeIcon}
            />
          </Tooltip>
        </Popup>
      </div>
    </header>
  );
}
