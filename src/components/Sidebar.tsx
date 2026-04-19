import { useEffect, useState } from 'react';
import { Tooltip } from 'tdesign-react';
import { DeleteIcon, SettingIcon } from 'tdesign-icons-react';
import { Bot, LayoutGrid, Newspaper, Plus, Users, X, MessageSquare, Sparkles } from 'lucide-react';
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

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* 移动端遮罩层 - 毛玻璃效果 */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 transition-opacity duration-300 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`
          flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ 
          width: isMobile ? 288 : (sidebarOpen ? 272 : 0),
          background: 'var(--td-bg-color-container)',
          borderRight: isMobile ? 'none' : '1px solid var(--td-component-stroke)',
        }}
      >
        {/* 顶部 Logo 区域 */}
        <div className="flex-shrink-0">
          {/* 移动端顶部栏 */}
          {isMobile && (
            <div className="h-16 px-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--td-component-stroke)' }}>
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-xl blur-md opacity-40"
                    style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
                  />
                  <div 
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Newspaper size={20} className="text-white" />
                  </div>
                </div>
                <span className="text-lg font-bold" style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {APP_CONFIG.name}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--td-bg-color-hover)] active:scale-95"
              >
                <X size={20} style={{ color: 'var(--td-text-color-secondary)' }} />
              </button>
            </div>
          )}

          {/* Logo - 仅桌面端 */}
          {!isMobile && (
            <div className="h-16 px-4 flex items-center border-b" style={{ borderColor: 'var(--td-component-stroke)' }}>
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-xl blur-md opacity-40"
                    style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
                  />
                  <div 
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Newspaper size={20} className="text-white" />
                  </div>
                </div>
                <span className="text-base font-bold" style={{ 
                  background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {APP_CONFIG.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 快捷功能区 */}
        <div className="p-3 space-y-1 flex-shrink-0">
          {/* 新对话按钮 - 渐变主按钮 */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-white group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Hover 光泽效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-transparent" />
            <Plus size={18} className="relative" />
            <span className="relative">新对话</span>
          </button>

          {/* 功能按钮组 */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* 专家中心 */}
            <button
              onClick={onOpenExperts}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all duration-200 group"
              style={{
                backgroundColor: isExpertCenterPage ? 'var(--td-brand-color-light)' : 'var(--td-bg-color-secondarycontainer)',
                color: isExpertCenterPage ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
              }}
            >
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ 
                  backgroundColor: isExpertCenterPage ? 'var(--td-brand-color)' : 'var(--td-bg-color-component)',
                  color: isExpertCenterPage ? 'white' : 'var(--td-text-color-secondary)',
                }}
              >
                <Sparkles size={16} />
              </div>
              <span className="font-medium">专家中心</span>
            </button>

            {/* 新闻工作台 */}
            <button
              onClick={onOpenTools}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all duration-200 group"
              style={{
                backgroundColor: isToolsPage ? 'var(--td-brand-color-light)' : 'var(--td-bg-color-secondarycontainer)',
                color: isToolsPage ? 'var(--td-brand-color)' : 'var(--td-text-color-secondary)',
              }}
            >
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ 
                  backgroundColor: isToolsPage ? 'var(--td-brand-color)' : 'var(--td-bg-color-component)',
                  color: isToolsPage ? 'white' : 'var(--td-text-color-secondary)',
                }}
              >
                <LayoutGrid size={16} />
              </div>
              <span className="font-medium">新闻工作台</span>
            </button>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="px-4 py-2 flex-shrink-0">
          <div className="h-px" style={{ backgroundColor: 'var(--td-component-stroke)' }} />
        </div>

        {/* 会话列表区域 */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-3">
          {/* 会话列表标题 */}
          <div className="flex items-center justify-between py-2 flex-shrink-0">
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--td-text-color-placeholder)' }}>
              历史会话
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ 
              backgroundColor: 'var(--td-bg-color-secondarycontainer)', 
              color: 'var(--td-text-color-secondary)' 
            }}>
              {sessions.length}
            </span>
          </div>

          {/* 会话列表 - 可滚动 */}
          <div className="flex-1 overflow-y-auto space-y-1 pb-3 custom-scrollbar">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" 
                  style={{ backgroundColor: 'var(--td-bg-color-secondarycontainer)' }}>
                  <MessageSquare size={20} style={{ color: 'var(--td-text-color-placeholder)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--td-text-color-placeholder)' }}>
                  暂无会话记录
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--td-text-color-disabled)' }}>
                  开始新对话吧
                </p>
              </div>
            ) : (
              sessions.map(session => {
                const sessionAgent = session.agentId ? getAgent(session.agentId) : getAgent('default');
                const AgentIcon = ICON_MAP[sessionAgent?.icon || 'Bot'] || Bot;
                const isActive = session.id === currentSessionId && !isSettingsPage;
                return (
                  <div 
                    key={session.id}
                    className="group relative p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive 
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.05))' 
                        : 'transparent',
                      border: isActive ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                    }}
                    onClick={() => handleSelectSession(session.id)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--td-bg-color-secondarycontainer)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* 左侧选中指示条 */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                        style={{ backgroundColor: 'var(--td-brand-color)' }}
                      />
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ 
                          backgroundColor: isActive ? 'var(--td-brand-color)' : 'var(--td-bg-color-component)',
                          color: isActive ? 'white' : 'var(--td-text-color-placeholder)',
                        }}
                      >
                        <AgentIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-[13px] font-medium truncate mb-0.5"
                          style={{ color: isActive ? 'var(--td-brand-color)' : 'var(--td-text-color-primary)' }}
                        >
                          {session.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]" style={{ color: 'var(--td-text-color-placeholder)' }}>
                            {formatTime(session.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <DeleteIcon size={14} style={{ color: 'var(--td-text-color-placeholder)' }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* 底部设置 */}
        <div 
          className="p-3 border-t flex-shrink-0"
          style={{ borderColor: 'var(--td-component-stroke)', backgroundColor: 'var(--td-bg-color-secondarycontainer)' }}
        >
          <button
            onClick={handleOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group"
            style={{
              backgroundColor: isSettingsPage ? 'var(--td-bg-color-component)' : 'transparent',
              color: isSettingsPage ? 'var(--td-text-color-primary)' : 'var(--td-text-color-secondary)',
            }}
          >
            <SettingIcon size={18} />
            <span className="font-medium">设置</span>
          </button>
        </div>
      </aside>
    </>
  );
}
