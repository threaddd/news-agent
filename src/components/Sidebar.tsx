import { Button, Tooltip } from 'tdesign-react';
import { AddIcon, DeleteIcon, SettingIcon } from 'tdesign-icons-react';
import { Bot, LayoutGrid, Newspaper, Plus } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Session, Agent } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isSettingsPage: boolean;
  isToolsPage: boolean;
  sidebarOpen: boolean;
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  isSettingsPage,
  isToolsPage,
  sidebarOpen,
  agents,
  getAgent,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onOpenTools,
}: SidebarProps) {
  return (
    <aside 
      className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden border-r"
      style={{ 
        width: sidebarOpen ? 260 : 0,
        background: 'linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-page) 100%)',
        borderColor: 'var(--td-border-level-1-color)',
      }}
    >
      {/* Logo */}
      <div className="h-14 px-4 flex items-center flex-shrink-0 border-b" style={{ borderColor: 'var(--td-border-level-1-color)' }}>
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #fb923c 100%)',
            }}
          >
            <Newspaper size={18} className="text-white" />
          </div>
          <div>
            <span 
              className="text-lg font-bold block"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {APP_CONFIG.name}
            </span>
          </div>
        </div>
      </div>

      {/* 快捷功能区 */}
      <div className="p-3 space-y-2">
        {/* 新闻工作台 */}
        <Button 
          icon={<LayoutGrid size={16} />}
          onClick={onOpenTools}
          block
          variant={isToolsPage ? 'filled' : 'outline'}
          className="justify-start font-medium transition-all duration-200 hover:scale-[1.02]"
          style={isToolsPage ? {
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            border: 'none',
          } : {
            background: 'var(--td-bg-color-component)',
            borderColor: 'var(--td-border-level-1-color)',
          }}
        >
          <span style={isToolsPage ? { color: 'white' } : {}}>新闻工作台</span>
        </Button>

        {/* 新对话按钮 */}
        <Button 
          icon={<Plus size={16} />}
          onClick={onNewChat}
          block
          variant="filled"
          className="justify-start font-medium transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover))',
            border: 'none',
            color: 'white',
          }}
        >
          新对话
        </Button>
      </div>

      {/* 会话列表标题 */}
      <div className="px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--td-text-color-placeholder)' }}>
          历史会话
        </span>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.map(session => {
          const sessionAgent = session.agentId ? getAgent(session.agentId) : getAgent('default');
          const AgentIcon = ICON_MAP[sessionAgent?.icon || 'Bot'] || Bot;
          const isActive = session.id === currentSessionId && !isSettingsPage;
          return (
            <div 
              key={session.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm"
              style={{
                backgroundColor: isActive
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
                color: isActive
                  ? 'var(--td-brand-color)' 
                  : 'var(--td-text-color-secondary)'
              }}
              onClick={() => onSelectSession(session.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--td-bg-color-component-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div 
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, ${sessionAgent?.color || '#ef4444'}, ${sessionAgent?.color || '#f97316'})` }}
              >
                <AgentIcon size={12} color="white" />
              </div>
              <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
              <Tooltip content="删除会话">
                <Button
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  variant="text"
                  shape="circle"
                  size="small"
                  icon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
      
      {/* 底部设置按钮 */}
      <div 
        className="p-3 border-t flex-shrink-0"
        style={{ borderColor: 'var(--td-border-level-1-color)' }}
      >
        <Button 
          icon={<SettingIcon />}
          onClick={onOpenSettings}
          block
          variant={isSettingsPage ? 'filled' : 'text'}
          className="justify-start"
          style={isSettingsPage ? {
            background: 'var(--td-bg-color-component)',
            borderColor: 'var(--td-border-level-1-color)',
          } : {}}
        >
          设置
        </Button>
      </div>
    </aside>
  );
}
