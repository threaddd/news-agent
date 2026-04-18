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
      {/* 动态背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent rounded-full animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/10 via-red-500/5 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo 和标题 */}
        <div className="text-center mb-10">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl mx-auto relative overflow-hidden group"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444, #f97316, #fb923c)',
            }}
          >
            {/* 光泽效果 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* 动画边框 */}
            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-white/40 to-transparent" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor' }} />
            <Newspaper size={36} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h2 
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent"
          >
            {APP_CONFIG.name}
          </h2>
          <p className="text-base" style={{ color: 'var(--td-text-color-secondary)' }}>
            新闻专业主义驱动的智能采编助手
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--td-text-color-placeholder)' }}>
            基于意图分类的记者人格 AI，为您提供专业的新闻生产支持
          </p>
        </div>
        
        {/* 快捷功能入口 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Newspaper, label: '新闻工作台', desc: '专业工具集', color: 'from-red-500 to-orange-500' },
            { icon: Sparkles, label: '智能写作', desc: 'AI辅助创作', color: 'from-orange-500 to-amber-500' },
            { icon: Bot, label: '智能对话', desc: '记者人格助手', color: 'from-amber-500 to-yellow-500' },
          ].map((item, i) => (
            <div 
              key={i}
              className="p-4 rounded-xl bg-gradient-to-br border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              style={{ 
                background: 'var(--td-bg-color-component)',
              }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--td-text-color-primary)' }}>
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
          <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
            {agents.map(agent => {
              const AgentIcon = ICON_MAP[agent.icon || 'Bot'] || Bot;
              const isSelected = agent.id === newChatAgentId;
              return (
                <div
                  key={agent.id}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    borderColor: isSelected ? (agent.color || 'var(--td-brand-color)') : 'transparent',
                    backgroundColor: isSelected ? 'var(--td-brand-color-light)' : 'var(--td-bg-color-component)',
                  }}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    if (agent.permissionMode) {
                      onSetPermissionMode(agent.permissionMode);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ backgroundColor: agent.color || '#0052d9' }}
                    >
                      <AgentIcon size={20} color="white" />
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
          <p className="text-xs mt-1.5" style={{ color: 'var(--td-text-color-placeholder)' }}>
            指定 Agent 的工作目录，用于文件操作等
          </p>
        </div>

        {/* 选中的 Agent 预览 */}
        {selectedAgent && (
          <div 
            className="p-4 rounded-xl border border-red-200/50 dark:border-red-800/50"
            style={{ 
              background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-component))' 
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = ICON_MAP[selectedAgent.icon || 'Bot'] || Bot;
                return (
                  <>
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: selectedAgent.color || '#0052d9' }}
                    >
                      <Icon size={14} color="white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
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
        
        {/* 提示文字 */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--td-text-color-placeholder)' }}>
          模型和权限模式可在输入框下方切换
        </p>
      </div>
    </div>
  );
}
