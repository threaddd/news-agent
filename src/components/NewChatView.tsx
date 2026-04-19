import { Input } from 'tdesign-react';
import { FolderOpenIcon } from 'tdesign-icons-react';
import { Bot, Sparkles, Newspaper } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Model, Agent, PermissionMode } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface NewChatViewProps {
  agents: Agent[];
  models: Model[];
  selectedModel: string;
  newChatAgentId: string;
  newChatCwd: string;
  newChatPermissionMode: PermissionMode;
  onSelectModel: (modelId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onSetCwd: (cwd: string) => void;
  onSetPermissionMode: (mode: PermissionMode) => void;
}

export function NewChatView({
  agents,
  newChatAgentId,
  newChatCwd,
  onSelectAgent,
  onSetCwd,
  onSetPermissionMode,
}: NewChatViewProps) {
  const selectedAgent = agents.find(a => a.id === newChatAgentId);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full blur-[100px] opacity-[0.07]"
          style={{ backgroundColor: 'var(--td-brand-color)' }}
        />
        <div 
          className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-[80px] opacity-[0.05]"
          style={{ backgroundColor: 'var(--color-accent-orange)' }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10 px-6">
        {/* Logo 和标题 */}
        <div className="text-center mb-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
            style={{ 
              background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
            }}
          >
            <Newspaper size={28} className="text-white" />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            {APP_CONFIG.name}
          </h2>
          <p className="text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
            新闻专业主义驱动的智能采编助手
          </p>
        </div>
        
        {/* 快捷功能入口 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Newspaper, label: '新闻工作台', desc: '专业工具集', gradient: 'var(--td-brand-color)' },
            { icon: Sparkles, label: '智能写作', desc: 'AI辅助创作', gradient: 'var(--color-accent-orange)' },
            { icon: Bot, label: '智能对话', desc: '记者人格助手', gradient: 'var(--td-success-color)' },
          ].map((item, i) => (
            <div 
              key={i}
              className="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ 
                backgroundColor: 'var(--td-bg-color-container)',
                border: '1px solid var(--td-component-stroke)',
                boxShadow: 'var(--td-shadow-1)',
              }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: item.gradient,
                  boxShadow: `0 4px 12px rgba(239, 68, 68, 0.2)`,
                }}
              >
                <item.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--td-text-color-primary)' }}>
                {item.label}
              </h3>
              <p className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        
        {/* Agent 选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--td-text-color-primary)' }}>
            选择 Agent
          </label>
          <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto">
            {agents.map(agent => {
              const AgentIcon = ICON_MAP[agent.icon || 'Bot'] || Bot;
              const isSelected = agent.id === newChatAgentId;
              return (
                <div
                  key={agent.id}
                  className="p-3 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isSelected ? 'var(--td-brand-color)' : 'var(--td-component-stroke)',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    backgroundColor: isSelected ? 'var(--td-brand-color-light)' : 'var(--td-bg-color-container)',
                  }}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    if (agent.permissionMode) {
                      onSetPermissionMode(agent.permissionMode);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: agent.color || 'var(--td-brand-color)' }}
                    >
                      <AgentIcon size={18} color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--td-text-color-primary)' }}>
                        {agent.name}
                      </div>
                      {agent.description && (
                        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--td-text-color-placeholder)' }}>
                          {agent.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 工作目录 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--td-text-color-primary)' }}>
            工作目录 <span style={{ color: 'var(--td-text-color-placeholder)' }}>(可选)</span>
          </label>
          <Input
            value={newChatCwd}
            onChange={(v) => onSetCwd(v as string)}
            placeholder="例如：/Users/username/projects/my-app"
            prefixIcon={<FolderOpenIcon />}
          />
        </div>

        {/* 选中的 Agent 预览 */}
        {selectedAgent && (
          <div 
            className="p-4 rounded-lg"
            style={{ 
              background: 'var(--td-brand-color-light)',
              border: '1px solid var(--td-brand-color)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = ICON_MAP[selectedAgent.icon || 'Bot'] || Bot;
                return (
                  <>
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: selectedAgent.color || 'var(--td-brand-color)' }}
                    >
                      <Icon size={12} color="white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--td-brand-color)' }}>
                      {selectedAgent.name}
                    </span>
                  </>
                );
              })()}
            </div>
            <p className="text-xs line-clamp-2" style={{ color: 'var(--td-text-color-secondary)' }}>
              {selectedAgent.systemPrompt}
            </p>
          </div>
        )}
        
        <p className="text-center text-xs mt-6" style={{ color: 'var(--td-text-color-placeholder)' }}>
          模型和权限模式可在输入框下方切换
        </p>
      </div>
    </div>
  );
}
