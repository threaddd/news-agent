import { Input } from 'tdesign-react';
import { FolderOpenIcon } from 'tdesign-icons-react';
import { Bot, Sparkles, Newspaper, Zap, Layers, ArrowRight } from 'lucide-react';
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
      {/* 高级背景效果 - 灵感来自 Linear/Vercel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主渐变光晕 */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.08] animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.06] animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-orange), var(--td-brand-color))', animationDelay: '-2s' }}
        />
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--td-text-color-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--td-text-color-secondary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10 px-6">
        {/* Logo 和标题 - 精致设计 */}
        <div className="text-center mb-12 animate-fade-in-up">
          {/* Logo 容器 - 玻璃拟态效果 */}
          <div className="relative inline-block mb-6">
            <div 
              className="absolute inset-0 rounded-3xl blur-xl opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
            />
            <div 
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Newspaper size={32} className="text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h2 
            className="text-3xl font-bold mb-3 tracking-tight"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            {APP_CONFIG.name}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--td-text-color-secondary)' }}>
            新闻专业主义驱动的智能采编助手
          </p>
          
          {/* 状态指示器 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" 
              style={{ backgroundColor: 'var(--td-bg-color-secondarycontainer)', color: 'var(--td-success-color)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              系统就绪
            </div>
          </div>
        </div>
        
        {/* 快捷功能入口 - 玻璃态卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Layers, label: '新闻工作台', desc: '专业工具集', gradient: 'linear-gradient(135deg, #EF4444, #F97316)' },
            { icon: Zap, label: '智能写作', desc: 'AI辅助创作', gradient: 'linear-gradient(135deg, #F97316, #FBBF24)' },
            { icon: Bot, label: '智能对话', desc: '记者人格助手', gradient: 'linear-gradient(135deg, #22C55E, #10B981)' },
          ].map((item, i) => (
            <div 
              key={i}
              className="group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              style={{ 
                backgroundColor: 'var(--td-bg-color-container)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid var(--td-component-stroke)',
              }}
            >
              {/* Hover 时的渐变背景 */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.03), rgba(249,115,22,0.03))' }}
              />
              
              {/* 图标 */}
              <div 
                className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ 
                  background: item.gradient,
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
                }}
              >
                <item.icon size={22} className="text-white" />
              </div>
              
              <h3 className="relative font-semibold text-sm mb-1 group-hover:text-[var(--td-brand-color)] transition-colors" style={{ color: 'var(--td-text-color-primary)' }}>
                {item.label}
              </h3>
              <p className="relative text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
                {item.desc}
              </p>
              
              {/* 箭头指示器 */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={14} style={{ color: 'var(--td-brand-color)' }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Agent 选择 - 精致卡片列表 */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--td-text-color-primary)' }}>
            <span>选择 Agent</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--td-bg-color-secondarycontainer)', color: 'var(--td-text-color-secondary)' }}>
              {agents.length} 个可用
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
            {agents.map((agent, index) => {
              const AgentIcon = ICON_MAP[agent.icon || 'Bot'] || Bot;
              const isSelected = agent.id === newChatAgentId;
              return (
                <div
                  key={agent.id}
                  className="group relative p-4 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    border: isSelected ? '2px solid var(--td-brand-color)' : '1px solid var(--td-component-stroke)',
                    backgroundColor: isSelected 
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.04))' 
                      : 'var(--td-bg-color-container)',
                    boxShadow: isSelected 
                      ? '0 4px 16px rgba(239, 68, 68, 0.15)' 
                      : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    if (agent.permissionMode) {
                      onSetPermissionMode(agent.permissionMode);
                    }
                  }}
                >
                  {/* 选中状态指示器 */}
                  {isSelected && (
                    <div 
                      className="absolute top-3 right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--td-brand-color)' }}
                    />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{ 
                        background: `linear-gradient(135deg, ${agent.color || 'var(--td-brand-color)'}, ${agent.color || 'var(--td-brand-color)'}dd)`,
                        boxShadow: `0 4px 12px ${agent.color || 'var(--td-brand-color)'}30`,
                      }}
                    >
                      <AgentIcon size={20} color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate group-hover:text-[var(--td-brand-color)] transition-colors" 
                        style={{ color: 'var(--td-text-color-primary)' }}>
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
            style={{ borderRadius: '12px' }}
          />
        </div>

        {/* 选中的 Agent 预览 - 精致设计 */}
        {selectedAgent && (
          <div 
            className="relative p-5 rounded-2xl overflow-hidden animate-fade-in-up"
            style={{ 
              background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.03))',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.08)',
            }}
          >
            {/* 装饰性角标 */}
            <div 
              className="absolute top-0 right-0 w-20 h-20 opacity-5"
              style={{ 
                background: 'radial-gradient(circle at 100% 0%, var(--td-brand-color) 0%, transparent 70%)',
              }}
            />
            
            <div className="relative flex items-center gap-3 mb-3">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedAgent.color || 'var(--td-brand-color)' }}
              >
                {(() => {
                  const Icon = ICON_MAP[selectedAgent.icon || 'Bot'] || Bot;
                  return <Icon size={14} color="white" />;
                })()}
              </div>
              <span className="text-base font-semibold" style={{ color: 'var(--td-brand-color)' }}>
                {selectedAgent.name}
              </span>
            </div>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--td-text-color-secondary)' }}>
              {selectedAgent.systemPrompt}
            </p>
          </div>
        )}
        
        {/* 底部提示 */}
        <div className="flex items-center justify-center gap-1.5 mt-8 text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
          <Sparkles size={12} />
          <span>模型和权限模式可在输入框下方切换</span>
        </div>
      </div>
    </div>
  );
}
