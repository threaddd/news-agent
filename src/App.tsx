import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@tdesign-react/chat/es/style/index.js';

import { useAgents } from './hooks/useAgents';
import { useTheme } from './hooks/useTheme';
import { useSessions } from './hooks/useSessions';
import { useModels } from './hooks/useModels';
import { useChat } from './hooks/useChat';
import { PermissionMode } from './types';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SettingsPage } from './components/SettingsPage';
import { ChatPage } from './pages/ChatPage';
import { NewsToolsPage } from './pages/NewsToolsPage';
import { ImageGenPage } from './pages/ImageGenPage';
import { ExpertCenter } from './pages/ExpertCenter';
import { ExpertChat } from './pages/ExpertChat';
import { Expert } from './data/experts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/tools" element={<AppContent />} />
      <Route path="/image-gen" element={<AppContent />} />
      <Route path="/experts" element={<AppContent />} />
      <Route path="/expert-chat" element={<AppContent />} />
      <Route path="/chat/:sessionId" element={<AppContent />} />
      <Route path="/settings" element={<AppContent />} />
    </Routes>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';
  const isToolsPage = location.pathname === '/tools';
  const isImageGenPage = location.pathname === '/image-gen';
  const isExpertCenterPage = location.pathname === '/experts';
  const isExpertChatPage = location.pathname === '/expert-chat';

  // 专家中心相关状态
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [expertSkills, setExpertSkills] = useState<Expert['skills'] | null>(null);
  const [expertColor, setExpertColor] = useState<string>('var(--td-brand-color)');

  // Hooks
  const { theme, mode, toggleTheme, setThemeMode } = useTheme();
  const { agents, addAgent, updateAgent, deleteAgent, getAgent } = useAgents();
  const { models, selectedModel, selectedProviderId, setSelectedModel, setSelectedProviderId, fetchModels } = useModels();
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

  // 聊天 Hook
  const {
    isLoading,
    inputValue,
    setInputValue,
    permissionRequest,
    sendMessage,
    handleStop,
    handlePermissionAllow,
    handlePermissionDeny,
    editMessage,
    regenerateMessage,
  } = useChat({
    currentSession,
    currentSessionId,
    selectedModel,
    selectedProviderId,
    getAgent,
    addSession,
    updateSession,
    updateSessionMessages,
    updateSessionModel,
    setCurrentSessionId,
    setSessions,
  });

  // 处理消息编辑
  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
    // 同时更新输入框
    setInputValue(newContent);
  }, [editMessage, setInputValue]);

  // 处理消息重新生成
  const handleRegenerate = useCallback((messageId: string) => {
    regenerateMessage(messageId);
  }, [regenerateMessage]);

  // 处理新闻工具页面选择
  const handleSelectTool = useCallback((prompt: string) => {
    // 设置输入框内容并跳转到首页
    setInputValue(prompt);
    navigate('/');
  }, [setInputValue, navigate]);

  // 获取当前会话的 Agent
  const currentAgent = currentSession?.agentId ? getAgent(currentSession.agentId) : getAgent('default');

  // 从 URL 同步 sessionId
  useEffect(() => {
    if (urlSessionId && urlSessionId !== currentSessionId) {
      setCurrentSessionId(urlSessionId);
    } else if (!urlSessionId && !isSettingsPage && currentSessionId) {
      setCurrentSessionId(null);
    }
  }, [urlSessionId, isSettingsPage, currentSessionId, setCurrentSessionId]);

  // 当切换会话时，恢复该会话的模型选择
  useEffect(() => {
    if (currentSessionId && sessionModels[currentSessionId]) {
      setSelectedModel(sessionModels[currentSessionId]);
    } else if (currentSession) {
      setSelectedModel(currentSession.model);
    }
  }, [currentSessionId, sessionModels, currentSession, setSelectedModel]);

  // 初始加载会话列表
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // 更新当前会话的模型
  const updateCurrentSessionModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    if (currentSessionId) {
      updateSessionModel(currentSessionId, modelId);
    }
  }, [currentSessionId, updateSessionModel, setSelectedModel]);

  // 删除会话处理
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const navigateTo = await deleteSession(sessionId);
    if (navigateTo) {
      navigate(navigateTo);
    }
  }, [deleteSession, navigate]);

  // 侧边栏事件处理
  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    navigate('/');
  }, [navigate, setCurrentSessionId]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    navigate(`/chat/${sessionId}`);
  }, [navigate, setCurrentSessionId]);

  const handleOpenSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Sidebar 状态
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 权限模式状态
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');

  // 打开新闻工具页面
  const handleOpenTools = useCallback(() => {
    navigate('/tools');
  }, [navigate]);

  // 打开生图页面
  const handleOpenImageGen = useCallback(() => {
    navigate('/image-gen');
  }, [navigate]);

  // 打开专家中心
  const handleOpenExperts = useCallback(() => {
    setSelectedExpert(null);
    navigate('/experts');
  }, [navigate]);

  // 选择专家 - 直接跳转到聊天页面使用专家技能
  const handleSelectExpert = useCallback((expert: Expert) => {
    // 设置专家技能和颜色
    setExpertSkills(expert.skills || null);
    setExpertColor(expert.color || 'var(--td-brand-color)');
    
    // 如果专家有技能，使用第一个技能作为初始提示
    const initialPrompt = expert.skills && expert.skills.length > 0
      ? expert.skills[0].prompt
      : `你好，我是${expert.name}，${expert.description}。请问我能帮你什么？`;
    
    setInputValue(initialPrompt);
    navigate('/');
  }, [navigate]);

  return (
    <div 
      className="flex h-screen w-screen"
      style={{ backgroundColor: 'var(--td-bg-color-page)' }}
    >
      {/* 侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isSettingsPage={isSettingsPage}
        isToolsPage={isToolsPage}
        isExpertCenterPage={isExpertCenterPage}
        sidebarOpen={sidebarOpen}
        agents={agents}
        getAgent={getAgent}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={handleOpenSettings}
        onOpenTools={handleOpenTools}
        onOpenExperts={handleOpenExperts}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 主内容区 */}
      <main 
        className="flex-1 flex flex-col min-w-0"
        style={{ backgroundColor: 'var(--td-bg-color-page)' }}
      >
        {/* 顶部栏 */}
        <Header
          isSettingsPage={isSettingsPage}
          isToolsPage={isToolsPage}
          sidebarOpen={sidebarOpen}
          theme={theme}
          themeMode={mode}
          currentSession={currentSession}
          currentAgent={currentAgent}
          models={models}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleTheme={toggleTheme}
          onSetThemeMode={setThemeMode}
          onRefreshModels={fetchModels}
        />

        {/* 设置页面、工具页面或聊天页面 */}
        {isSettingsPage ? (
          <SettingsPage
            agents={agents}
            onAdd={addAgent}
            onUpdate={updateAgent}
            onDelete={deleteAgent}
          />
        ) : isToolsPage ? (
          <NewsToolsPage onSelectTool={handleSelectTool} onOpenImageGen={handleOpenImageGen} />
        ) : isImageGenPage ? (
          <ImageGenPage />
        ) : isExpertChatPage && selectedExpert ? (
          <ExpertChat expert={selectedExpert} />
        ) : isExpertCenterPage ? (
          <ExpertCenter onSelectExpert={handleSelectExpert} onBack={() => navigate('/')} />
        ) : (
          <ChatPage
            currentSession={currentSession}
            models={models}
            selectedModel={selectedModel}
            agents={agents}
            isLoading={isLoading}
            inputValue={inputValue}
            permissionRequest={permissionRequest}
            permissionMode={permissionMode}
            onSendMessage={sendMessage}
            onStop={handleStop}
            onInputChange={setInputValue}
            onModelChange={updateCurrentSessionModel}
            onPermissionAllow={handlePermissionAllow}
            onPermissionDeny={handlePermissionDeny}
            onPermissionModeChange={setPermissionMode}
            onEditMessage={handleEditMessage}
            onRegenerate={handleRegenerate}
            expertSkills={expertSkills}
            expertColor={expertColor}
          />
        )}
      </main>
    </div>
  );
}

export default App;
