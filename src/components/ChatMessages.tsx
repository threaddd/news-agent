import { useState } from 'react';
import { Loading } from 'tdesign-react';
import { ChatMarkdown } from '@tdesign-react/chat';
import { User, Bot, Pencil, RotateCcw, Check, X } from 'lucide-react';
import { Message, Model, PermissionRequest, ContentBlock } from '../types';
import { ToolCallsCollapse } from './ToolCallsCollapse';
import { InlinePermissionCard } from './InlinePermissionCard';

interface ChatMessagesProps {
  messages: Message[];
  models: Model[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  permissionRequest?: PermissionRequest | null;
  onPermissionAllow?: () => void;
  onPermissionDeny?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessages({ 
  messages, 
  models, 
  messagesEndRef,
  permissionRequest,
  onPermissionAllow,
  onPermissionDeny,
  onEditMessage,
  onRegenerate,
}: ChatMessagesProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // 开始编辑消息
  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim() && onEditMessage) {
      onEditMessage(editingMessageId, editContent.trim());
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  // 键盘快捷键支持
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatModelName = (modelId: string) => {
    const model = models.find(m => m.modelId === modelId);
    const name = model?.name || modelId;
    return name
      .replace(/^(Claude|GPT|Gemini|Kimi|DeepSeek|Qwen|GLM)\s*/i, '')
      .replace(/-/g, ' ')
      .trim() || name;
  };

  const renderContentBlock = (block: ContentBlock, index: number, isStreaming?: boolean, isLast?: boolean) => {
    if (block.type === 'text') {
      return (
        <div 
          key={`text-${index}`}
          className="px-4 py-3 leading-relaxed break-words"
          style={{
            backgroundColor: 'var(--td-bg-color-component)',
            color: 'var(--td-text-color-primary)',
            borderRadius: '2px 12px 12px 12px',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <div className="chat-markdown">
            <ChatMarkdown content={block.text} />
          </div>
          {isStreaming && isLast && (
            <span 
              className="animate-cursor-blink ml-0.5"
              style={{ color: 'var(--td-brand-color)' }}
            >
              |
            </span>
          )}
        </div>
      );
    } else if (block.type === 'tool_use') {
      return (
        <ToolCallsCollapse
          key={`tool-${block.toolCall.id}`}
          toolCalls={[block.toolCall]}
          isStreaming={isStreaming && block.toolCall.status === 'running'}
        />
      );
    }
    return null;
  };

  const renderAssistantContent = (message: Message) => {
    if (message.contentBlocks && message.contentBlocks.length > 0) {
      return message.contentBlocks.map((block, index) => 
        renderContentBlock(block, index, message.isStreaming, index === message.contentBlocks!.length - 1)
      );
    }
    
    return (
      <>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <ToolCallsCollapse
            toolCalls={message.toolCalls}
            isStreaming={message.isStreaming}
          />
        )}
        {message.content && (
          <div 
            className="px-4 py-3 leading-relaxed break-words"
            style={{
              backgroundColor: 'var(--td-bg-color-component)',
              color: 'var(--td-text-color-primary)',
              borderRadius: '2px 12px 12px 12px',
              border: '1px solid var(--td-component-stroke)',
            }}
          >
            <div className="chat-markdown">
              <ChatMarkdown content={message.content} />
            </div>
            {message.isStreaming && (
              <span 
                className="animate-cursor-blink ml-0.5"
                style={{ color: 'var(--td-brand-color)' }}
              >
                |
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={`flex gap-3 message-enter ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* 头像 */}
          <div 
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full self-start avatar-small"
            style={{
              backgroundColor: message.role === 'user' 
                ? 'var(--td-brand-color)' 
                : 'var(--td-bg-color-component)',
              color: message.role === 'user' 
                ? 'white' 
                : 'var(--td-text-color-secondary)',
              border: message.role === 'assistant' ? '1px solid var(--td-component-stroke)' : 'none',
            }}
          >
            {message.role === 'user' ? <User size={15} /> : <Bot size={15} />}
          </div>
          <div 
            className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'items-end' : ''} message-bubble-container`}
          >
            {message.role === 'assistant' && message.model && (
              <span 
                className="text-xs px-1"
                style={{ color: 'var(--td-text-color-placeholder)' }}
              >
                {formatModelName(message.model)}
              </span>
            )}
            
            {/* 用户消息 */}
            {message.role === 'user' && (
              <>
                {editingMessageId === message.id ? (
                  // 编辑模式
                  <div className="w-full max-w-[90%]">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="w-full px-4 py-2.5 text-sm leading-relaxed break-words resize-none rounded-xl edit-textarea"
                      style={{
                        backgroundColor: 'var(--td-bg-color-container)',
                        color: 'var(--td-text-color-primary)',
                        border: '2px solid var(--td-brand-color)',
                        outline: 'none',
                      }}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <span className="text-xs hidden sm:inline" style={{ color: 'var(--td-text-color-placeholder)' }}>
                        Ctrl+Enter 保存 · Esc 取消
                      </span>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                        style={{ backgroundColor: 'var(--td-bg-color-component)' }}
                      >
                        <X size={12} />
                        取消
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--td-brand-color)' }}
                      >
                        <Check size={12} />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 普通模式
                  <div className="group relative message-bubble">
                    <div 
                      className="px-4 py-2.5 leading-relaxed break-words text-[14px]"
                      style={{
                        background: 'var(--td-brand-color)',
                        color: 'white',
                        borderRadius: '12px 2px 12px 12px',
                      }}
                    >
                      {message.content}
                    </div>
                    {/* 操作按钮 */}
                    {(onEditMessage || onRegenerate) && (
                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {onEditMessage && (
                          <button
                            onClick={() => handleStartEdit(message)}
                            className="p-1.5 rounded-full shadow-md transition-all hover:scale-110"
                            style={{ backgroundColor: 'var(--td-bg-color-container)' }}
                            title="编辑消息"
                          >
                            <Pencil size={12} style={{ color: 'var(--td-text-color-secondary)' }} />
                          </button>
                        )}
                        {onRegenerate && (
                          <button
                            onClick={() => onRegenerate(message.id)}
                            className="p-1.5 rounded-full shadow-md transition-all hover:scale-110"
                            style={{ backgroundColor: 'var(--td-bg-color-container)' }}
                            title="重新生成"
                          >
                            <RotateCcw size={12} style={{ color: 'var(--td-text-color-secondary)' }} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* 助手消息 */}
            {message.role === 'assistant' && renderAssistantContent(message)}
            
            {/* 思考中 */}
            {message.role === 'assistant' && message.isStreaming && 
             !message.content && 
             (!message.contentBlocks || message.contentBlocks.length === 0) && 
             (!message.toolCalls || message.toolCalls.length === 0) && (
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--td-bg-color-component)',
                  border: '1px solid var(--td-component-stroke)',
                }}
              >
                <Loading size="small" />
                <span 
                  className="text-sm"
                  style={{ color: 'var(--td-text-color-secondary)' }}
                >
                  思考中...
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* 内联权限确认 */}
      {permissionRequest && onPermissionAllow && onPermissionDeny && (
        <div className="flex gap-3 ml-11">
          <InlinePermissionCard
            request={permissionRequest}
            onAllow={onPermissionAllow}
            onDeny={onPermissionDeny}
          />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
