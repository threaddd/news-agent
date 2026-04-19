import { Loading } from 'tdesign-react';
import { ChatMarkdown } from '@tdesign-react/chat';
import { User, Bot } from 'lucide-react';
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
}

export function ChatMessages({ 
  messages, 
  models, 
  messagesEndRef,
  permissionRequest,
  onPermissionAllow,
  onPermissionDeny
}: ChatMessagesProps) {
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
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full self-start"
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
            className={`flex flex-col gap-1.5 max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}
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
