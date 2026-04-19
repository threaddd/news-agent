import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Square, Loader2, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Expert, ExpertSkill, getExpertById } from '../data/experts';
import { useChat } from '../hooks/useChat';
import { useAgents } from '../hooks/useAgents';
import { useSessions } from '../hooks/useSessions';
import { useModels } from '../hooks/useModels';
import { ChatMessages } from '../components/ChatMessages';
import { NewChatView } from '../components/NewChatView';
import { PermissionRequest } from '../types';

interface ExpertChatProps {
  expert: Expert;
}

export function ExpertChat({ expert }: ExpertChatProps) {
  const navigate = useNavigate();
  const { agents, addAgent, updateAgent, deleteAgent, getAgent } = useAgents();
  const { models, selectedModel, setSelectedModel, fetchModels } = useModels();
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    sessionModels,
    fetchSessions,
    deleteSession,
    updateSessionModel,
    addSession,
    updateSession,
    updateSessionMessages,
  } = useSessions();
  const [showSkills, setShowSkills] = useState(true);

  // 创建临时的专家 Agent
  const [expertAgentId] = useState(`expert-${expert.id}-${Date.now()}`);
  
  // 初始化专家 Agent
  useEffect(() => {
    const expertAgent = {
      id: expertAgentId,
      name: expert.name,
      systemPrompt: expert.systemPrompt,
      model: 'claude-sonnet-4-20250514',
    };
    addAgent(expertAgent);
  }, [expertAgentId, expert, addAgent]);

  const {
    isLoading,
    inputValue,
    setInputValue,
    permissionRequest,
    sendMessage,
    handleStop,
    handlePermissionAllow,
    handlePermissionDeny,
  } = useChat({
    currentSession,
    currentSessionId,
    selectedModel,
    getAgent,
    addSession,
    updateSession,
    updateSessionMessages,
    updateSessionModel,
    setCurrentSessionId,
    setSessions,
    // 使用专家 Agent 初始化新会话
    initialAgentId: expertAgentId,
  });

  const handleBack = () => {
    navigate('/experts');
  };

  // 处理技能点击
  const handleSkillClick = (skill: ExpertSkill) => {
    setInputValue(skill.prompt);
    // 自动发送
    if (skill.prompt && !isLoading) {
      sendMessage(skill.prompt);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 顶部栏 - 专家信息 */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${expert.gradient} flex items-center justify-center text-xl shadow-md`}
          >
            {expert.avatar}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {expert.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {expert.alias} · {expert.title}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* 专业领域标签 */}
        <div className="flex gap-2">
          {expert.specialties.slice(0, 2).map((skill) => (
            <span 
              key={skill}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-hidden">
        {!currentSession || currentSession.messages.length === 0 ? (
          <NewChatView
            agent={getAgent(expertAgentId)}
            onSendFirstMessage={sendMessage}
          />
        ) : (
          <ChatMessages
            messages={currentSession.messages}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* 技能面板 */}
      {expert.skills && expert.skills.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          {/* 技能面板头部 */}
          <button
            onClick={() => setShowSkills(!showSkills)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: expert.color }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {expert.name}的专业技能
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${expert.color}20`, color: expert.color }}>
                {expert.skills.length}个可用
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
                {expert.skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillClick(skill)}
                    disabled={isLoading}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:-translate-y-0.5"
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

      {/* 输入框 */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && inputValue.trim()) {
                    sendMessage(inputValue);
                  }
                }
              }}
              placeholder={`向${expert.name}提问，或点击上方技能快速开始...`}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ maxHeight: '120px', minHeight: '48px' }}
            />
          </div>

          <button
            onClick={() => {
              if (isLoading) {
                handleStop();
              } else if (inputValue.trim()) {
                sendMessage(inputValue);
              }
            }}
            disabled={!inputValue.trim() && !isLoading}
            className={`p-3 rounded-xl transition-all ${
              isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : inputValue.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Square className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 权限请求弹窗 */}
      {permissionRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              权限请求
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {permissionRequest.tool} 
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePermissionAllow}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                允许
              </button>
              <button
                onClick={handlePermissionDeny}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
