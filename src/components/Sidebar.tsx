import { useEffect, useState } from 'react';
import { Button, Tooltip } from 'tdesign-react';
import { DeleteIcon, SettingIcon } from 'tdesign-icons-react';
import { Bot, LayoutGrid, Newspaper, Plus, Users, X } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Session, Agent } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isSettingsPage: boolean;
  isToolsPage: boolean;
  isExpertCenterPage: boolean;
  sidebarOpen: boolean;
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenExperts: () => void;
  onClose?: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  isSettingsPage,
  isToolsPage,
  isExpertCenterPage,
  sidebarOpen,
  agents,
  getAgent,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onOpenTools,
  onOpenExperts,
  onClose,
}: SidebarProps) {
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

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleOpenSettings = () => {
    onOpenSettings();
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* 移动端遮罩层 */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`
          flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden border-r
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ 
          width: isMobile ? 280 : (sidebarOpen ? 256 : 0),
          background: 'var(--td-bg-color-container)',
          borderColor: 'var(--td-component-stroke)',
        }}
      >
        {/* 移动端顶部栏 */}
        {isMobile && (
          <div className="h-14 px-4 flex items-center justify-between flex-shrink-0 border-b" style={{ borderColor: 'var(--td-component-stroke)' }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                }}
              >
                <Newspaper size={16} className="text-white" />
              </div>
              <span 
                className="text-base font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {APP_CONFIG.name}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} style={{ color: 'var(--td-text-color-secondary)' }} />
            </button>
          </div>
        )}

        {/* Logo - 仅桌面端 */}
        {!isMobile && (
          <div className="h-14 px-4 flex items-center flex-shrink-0 border-b" style={{ borderColor: 'var(--td-component-stroke)' }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                }}
              >
                <Newspaper size={16} className="text-white" />
              </div>
              <span 
                className="text-base font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {APP_CONFIG.name}
              </span>
            </div>
          </div>
        )}

      {/* 快捷功能区 */}
      <div className="p-2.5 space-y-1">
        {/* 新对话按钮 */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-white"
          style={{
            background: 'linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover))',
            boxShadow: '0 2px 8px rgba(0, 82, 217, 0.25)',
          }}
        >
          <Plus size={16} />
          新对话
        </button>

        {/* 专家中心 */}
        <button
          onClick={onOpenExperts}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            backgroundColor: isExpertCenterPage ? 'var(--td-brand-color-light)' : 'transparent',
            color: isExpertCenterPage ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
            fontWeight: isExpertCenterPage ? 600 : 400,
          }}
        >
          <Users size={16} />
          专家中心
        </button>

        {/* 新闻工作台 */}
        <button
          onClick={onOpenTools}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            backgroundColor: isToolsPage ? 'var(--td-brand-color-light)' : 'transparent',
            color: isToolsPage ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
            fontWeight: isToolsPage ? 600 : 400,
          }}
        >
          <LayoutGrid size={16} />
          新闻工作台
        </button>
      </div>

      {/* 分隔线 */}
      <div className="px-4 py-1">
        <div className="h-px" style={{ backgroundColor: 'var(--td-component-stroke)' }} />
      </div>

      {/* 会话列表标题 */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--td-text-color-placeholder)' }}>
          历史会话
        </span>
        <span className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
          {sessions.length}
        </span>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {sessions.map(session => {
          const sessionAgent = session.agentId ? getAgent(session.agentId) : getAgent('default');
          const AgentIcon = ICON_MAP[sessionAgent?.icon || 'Bot'] || Bot;
          const isActive = session.id === currentSessionId && !isSettingsPage;
          return (
            <div 
              key={session.id}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 group"
              style={{
                backgroundColor: isActive ? 'var(--td-brand-color-light)' : 'transparent',
              }}
              onClick={() => handleSelectSession(session.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--td-bg-color-container-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div 
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                style={{ 
                  backgroundColor: isActive ? 'var(--td-brand-color)' : 'var(--td-bg-color-component)',
                  color: isActive ? 'white' : 'var(--td-text-color-placeholder)',
                }}
              >
                <AgentIcon size={11} />
              </div>
              <span 
                className="flex-1 truncate text-[13px]"
                style={{ 
                  color: isActive ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {session.title}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                <DeleteIcon size={14} style={{ color: 'var(--td-text-color-placeholder)' }} />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* 底部设置 */}
      <div 
        className="p-2.5 border-t flex-shrink-0"
        style={{ borderColor: 'var(--td-component-stroke)' }}
      >
        <button
          onClick={handleOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            backgroundColor: isSettingsPage ? 'var(--td-bg-color-component)' : 'transparent',
            color: isSettingsPage ? 'var(--td-text-color-primary)' : 'var(--td-text-color-secondary)',
            fontWeight: isSettingsPage ? 500 : 400,
          }}
        >
          <SettingIcon size={16} />
          设置
        </button>
      </div>
    </aside>
    </>
  );
}
