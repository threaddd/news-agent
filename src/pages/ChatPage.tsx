import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Model, Session, PermissionMode, CustomAgent, PermissionRequest } from '../types';
import { NewChatView } from '../components/NewChatView';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import { ExpertSkill } from '../data/experts';

interface ChatPageProps {
  currentSession: Session | undefined;
  models: Model[];
  selectedModel: string;
  agents: CustomAgent[];
  isLoading: boolean;
  inputValue: string;
  permissionRequest: PermissionRequest | null;
  permissionMode: PermissionMode;
  onSendMessage: (message: string, newChatOptions?: NewChatOptions, onNavigate?: (path: string) => void) => void;
  onStop: () => void;
  onInputChange: (value: string) => void;
  onModelChange: (modelId: string) => void;
  onPermissionAllow: () => void;
  onPermissionDeny: () => void;
  onPermissionModeChange: (mode: PermissionMode) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  expertSkills?: ExpertSkill[] | null;
  expertColor?: string;
}

interface NewChatOptions {
  agentId: string;
  cwd: string;
  permissionMode: PermissionMode;
}

export function ChatPage({
  currentSession,
  models,
  selectedModel,
  agents,
  isLoading,
  inputValue,
  permissionRequest,
  permissionMode,
  onSendMessage,
  onStop,
  onInputChange,
  onModelChange,
  onPermissionAllow,
  onPermissionDeny,
  onPermissionModeChange,
  onEditMessage,
  onRegenerate,
  expertSkills,
  expertColor,
}: ChatPageProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 新对话页面状态
  const [newChatAgentId, setNewChatAgentId] = useState('default');
  const [newChatCwd, setNewChatCwd] = useState('');
  
  // 专家技能面板状态
  const [showSkills, setShowSkills] = useState(true);
  
  // 处理技能点击 - 先填入提示词，再发送
  const handleSkillClick = (skill: ExpertSkill) => {
    // 先填入技能提示词
    onInputChange(skill.prompt);
    // 延迟发送，确保输入框内容已更新
    setTimeout(() => {
      onSendMessage(skill.prompt);
    }, 100);
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // 处理发送消息
  const handleSend = useCallback((message: string) => {
    if (!currentSession) {
      // 新对话
      onSendMessage(message, {
        agentId: newChatAgentId,
        cwd: newChatCwd,
        permissionMode: permissionMode,
      }, (path) => {
        // 重置新对话选项
        setNewChatAgentId('default');
        setNewChatCwd('');
        navigate(path);
      });
    } else {
      onSendMessage(message);
    }
  }, [currentSession, newChatAgentId, newChatCwd, permissionMode, onSendMessage, navigate]);

  const showNewChatView = !currentSession || currentSession.messages.length === 0;

  return (
    <>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {showNewChatView ? (
          <NewChatView
            agents={agents}
            models={models}
            selectedModel={selectedModel}
            newChatAgentId={newChatAgentId}
            newChatCwd={newChatCwd}
            newChatPermissionMode={permissionMode}
            onSelectModel={onModelChange}
            onSelectAgent={setNewChatAgentId}
            onSetCwd={setNewChatCwd}
            onSetPermissionMode={onPermissionModeChange}
          />
        ) : (
          <ChatMessages
            messages={currentSession!.messages}
            models={models}
            messagesEndRef={messagesEndRef}
            permissionRequest={permissionRequest}
            onPermissionAllow={onPermissionAllow}
            onPermissionDeny={onPermissionDeny}
            onEditMessage={onEditMessage}
            onRegenerate={onRegenerate}
          />
        )}
      </div>

      {/* 专家技能面板 */}
      {expertSkills && expertSkills.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          {/* 技能面板头部 */}
          <button
            onClick={() => setShowSkills(!showSkills)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: expertColor }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                专业技能
              </span>
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full" 
                style={{ backgroundColor: `${expertColor}20`, color: expertColor }}
              >
                {expertSkills.length}个可用
              </span>
            </div>
            {showSkills ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* 技能列表 */}
          {showSkills && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {expertSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillClick(skill)}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    style={{
                      backgroundColor: `${skill.color}10`,
                      border: `1px solid ${skill.color}30`,
                    }}
                  >
                    <span className="text-base">{skill.icon}</span>
                    <div className="text-left">
                      <div className="font-medium" style={{ color: skill.color }}>
                        {skill.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden group-hover:block">
                        {skill.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 输入区域 */}
      <ChatInput
        inputValue={inputValue}
        selectedModel={selectedModel}
        models={models}
        isLoading={isLoading}
        permissionMode={permissionMode}
        onSend={handleSend}
        onStop={onStop}
        onChange={onInputChange}
        onModelChange={onModelChange}
        onPermissionModeChange={onPermissionModeChange}
      />
    </>
  );
}
