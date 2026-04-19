import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  Search,
  Video,
  BarChart3,
  Mic,
  Image as ImageIcon,
  Send,
  Clock,
  BookOpen,
  Upload,
  PenTool,
  Share2,
  Wand2,
} from 'lucide-react';
import { AudioUploader } from '../components/AudioUploader';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  prompt: string;
  priority: 'P0' | 'P1' | 'P2';
  onClick: (prompt: string) => void;
  isAction?: boolean;
  onAction?: () => void;
}

interface NewsToolsPageProps {
  onSelectTool: (prompt: string) => void;
  onOpenImageGen?: () => void;
}

function ToolCard({ title, description, icon, category, priority, onClick, isAction, onAction }: ToolCardProps) {
  const priorityConfig = {
    P0: { color: 'var(--td-error-color)', bg: 'rgba(213, 73, 65, 0.08)' },
    P1: { color: 'var(--td-warning-color)', bg: 'rgba(227, 115, 24, 0.08)' },
    P2: { color: 'var(--td-brand-color)', bg: 'var(--td-brand-color-light)' },
  };

  const handleClick = () => {
    if (isAction && onAction) {
      onAction();
    } else {
      onClick(title);
    }
  };

  const config = priorityConfig[priority];

  return (
    <button
      onClick={handleClick}
      className="group relative w-full text-left p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--td-bg-color-container)',
        border: '1px solid var(--td-component-stroke)',
        boxShadow: 'var(--td-shadow-1)',
      }}
    >
      {/* Priority Badge */}
      <span 
        className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        {priority}
      </span>

      {/* Icon */}
      <div 
        className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform"
        style={{ 
          background: 'linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover))',
          boxShadow: '0 4px 12px rgba(0, 82, 217, 0.15)',
        }}
      >
        {icon}
      </div>

      {/* Category */}
      <p 
        className="text-[11px] font-medium uppercase tracking-wider mb-1"
        style={{ color: 'var(--td-brand-color)' }}
      >
        {category}
      </p>

      {/* Title */}
      <h3 
        className="text-base font-semibold mb-1.5 group-hover:translate-x-0.5 transition-transform"
        style={{ color: 'var(--td-text-color-primary)' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--td-text-color-placeholder)' }}>
        {description}
      </p>

      {/* Hover Effect Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl"
        style={{ background: 'linear-gradient(90deg, var(--td-brand-color), var(--color-accent-orange))' }}
      />
    </button>
  );
}

export function NewsToolsPage({ onSelectTool, onOpenImageGen }: NewsToolsPageProps) {
  const navigate = useNavigate();
  const [showAudioUploader, setShowAudioUploader] = useState(false);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
  };

  const handleTranscriptionRequest = (file: File) => {
    onSelectTool(`请帮我转录这段录音文件：${file.name}，并将内容整理成结构化文本，标注关键引用和要点。`);
  };

  const handleToolClick = (toolName: string) => {
    const prompts: Record<string, string> = {
      '采访提纲生成': '请帮我生成一份采访提纲。我要采访的主题是：[请描述主题]，采访对象是：[请描述受访者]，预计时长为：[时长]。请包含开场问题、核心问题、敏感问题（谨慎处理）和结束问题。',
      '新闻稿撰写': '请帮我撰写一篇新闻稿。事件是：[描述新闻事件]，请采用倒金字塔结构，包含导语（最重要的事实）、主体（详细背景）、背景（相关 Context）。请确保语言简洁、专业，符合新闻写作规范。',
      '录音整理': '请帮我整理这段录音的内容。我会提供录音文件，请将其转录为文字，并按发言人、结构化整理，标注关键要点和引用。',
      '新闻评论': '请帮我撰写一篇新闻评论。事件是：[描述事件]，请提供2-3个不同的分析角度，每个角度包含论点、论据。请注意标注"⚠️ 这是一种分析角度，不代表客观事实"。',
      '标题生成': '请为这篇新闻稿生成3个标题选项，每个标题包含主标题和副标题。主标题要求简洁有吸引力（不超过15字），副标题补充关键信息。',
      '事实核查': '请帮我核查以下信息的准确性：[提供需要核查的内容]。请进行Web Search验证，列出信息来源，标注可靠程度。',
      '热点聚合': '请帮我追踪今日热点话题。搜索当前最热的新闻事件，按热度排序，提供每个热点的简要概述和潜在新闻价值。',
      '选题推荐': '请基于当前热点：[描述热点或留空让AI分析]，推荐3个新闻选题，每个选题包含：选题方向、报道角度、预计影响力、建议采访对象。',
      '历史案例': '请帮我查找与当前事件相似的历史案例。事件是：[描述当前事件]。请提供案例背景、异同点对比、对当前报道的启示。',
      '发稿计划': '请帮我制定一份发稿计划。选题是：[描述选题]，目标平台是：[平台列表]，请包含：发布时间线、每阶段内容重点、平台适配策略。',
      '跨平台改写': '请帮我将这篇内容改写成适配不同平台的版本：\n- 微信公众号（1000字深度）\n- 微博（140字+话题标签）\n- 抖音文案（15-60秒口播）\n- 小红书（图文种草风格）',
      '口播稿生成': '请帮我生成一份口播稿。内容是：[描述主题]，时长要求：[时长]，请使用口语化表达，包含开场hook、核心内容、结尾引导，保持自然的说话节奏。',
    };

    const prompt = prompts[toolName] || `请帮我完成【${toolName}】任务。`;
    onSelectTool(prompt);
    navigate('/');
  };

  const p0Tools = [
    { title: '采访提纲生成', description: '基于事件/人物生成专业采访问题，包含开场、核心、敏感和结束问题', icon: <PenTool size={22} />, category: '文字生产', prompt: '' },
    { title: '新闻稿撰写', description: '采用倒金字塔结构，包含导语、主体、背景，符合新闻写作规范', icon: <BookOpen size={22} />, category: '文字生产', prompt: '' },
    { title: '录音整理', description: '上传录音文件，自动转录并结构化整理，标注关键引用', icon: <Mic size={22} />, category: '文字生产', prompt: '' },
    { title: '新闻评论', description: '多角度分析框架，生成深度评论稿件，附带观点免责标注', icon: <BarChart3 size={22} />, category: '文字生产', prompt: '' },
    { title: '标题生成', description: '生成多个版本标题，包含主标题和副标题，吸引读者点击', icon: <PenTool size={22} />, category: '文字生产', prompt: '' },
    { title: '事实核查', description: 'Web Search验证事实性断言，列出信息来源和可靠程度', icon: <Search size={22} />, category: '文字生产', prompt: '' },
  ];

  const p1Tools = [
    { title: '热点聚合', description: '自动追踪和汇总当日热点话题，按热度排序并提供概述', icon: <Search size={22} />, category: '选题收集', prompt: '' },
    { title: '选题推荐', description: '基于热点生成选题建议，包含报道角度、影响力和建议采访对象', icon: <BarChart3 size={22} />, category: '选题收集', prompt: '' },
    { title: '历史案例', description: '查找相似历史事件作为报道参考，提供对比分析', icon: <BookOpen size={22} />, category: '选题收集', prompt: '' },
    { title: '发稿计划', description: '制定完整报道规划，包含时间线、平台适配策略', icon: <Clock size={22} />, category: '选题收集', prompt: '' },
    { title: '跨平台改写', description: '一稿多发，自动适配微信公众号、微博、抖音、小红书', icon: <Share2 size={22} />, category: '跨平台分发', prompt: '' },
    { title: '口播稿生成', description: '生成适合口播的文稿，适配视频和音频内容创作', icon: <Video size={22} />, category: '音视频', prompt: '' },
  ];

  const p2Tools = [
    { title: 'AI配图建议', description: '根据稿件内容推荐配图风格和关键词，便于图库搜索', icon: <ImageIcon size={22} />, category: '多媒体', prompt: '' },
    { title: 'AI生图创作', description: '基于腾讯混元大模型的智能图像生成，支持多种风格', icon: <Wand2 size={22} />, category: '多媒体', prompt: '', isAction: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
            >
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--td-text-color-primary)' }}>
                新闻生产工作台
              </h1>
              <p className="text-sm" style={{ color: 'var(--td-text-color-placeholder)' }}>
                Journalist Persona · 新闻专业主义驱动的智能采编助手
              </p>
            </div>
          </div>

          {/* 意图分类说明 */}
          <div 
            className="mt-5 p-4 rounded-lg"
            style={{ 
              backgroundColor: 'var(--td-brand-color-light)',
              border: '1px solid rgba(0, 82, 217, 0.1)',
            }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--td-brand-color)' }}>
              💡 意图分类说明
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { label: '事实断言', desc: '引入背景，温和校正', color: 'var(--td-brand-color)', bg: 'var(--td-brand-color-light)' },
                { label: '观点表达', desc: '延伸视角，不强行纠错', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
                { label: '任务指令', desc: '直接执行，说明思路', color: 'var(--td-success-color)', bg: 'rgba(43, 164, 113, 0.08)' },
                { label: '不明确', desc: '合理响应，确认意图', color: 'var(--td-warning-color)', bg: 'rgba(227, 115, 24, 0.08)' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <span 
                    className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    {item.label}
                  </span>
                  <span style={{ color: 'var(--td-text-color-secondary)' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* P0 Core Features */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span 
            className="px-2 py-0.5 text-xs font-semibold rounded-full"
            style={{ color: 'var(--td-error-color)', backgroundColor: 'rgba(213, 73, 65, 0.08)' }}
          >
            P0 核心
          </span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--td-text-color-primary)' }}>
            文字内容生产
          </h2>
        </div>

        {/* 录音上传快捷入口 */}
        <div className="mb-4">
          <button
            onClick={() => setShowAudioUploader(!showAudioUploader)}
            className="w-full p-4 rounded-xl transition-colors flex items-center gap-4"
            style={{ 
              border: '1.5px dashed var(--td-brand-color)',
              backgroundColor: 'var(--td-brand-color-light)',
            }}
          >
            <div 
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
            >
              <Upload size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--td-brand-color)' }}>
                录音整理
              </p>
              <p className="text-xs" style={{ color: 'var(--td-text-color-secondary)' }}>
                上传音频文件，AI自动转录并整理
              </p>
            </div>
          </button>

          {showAudioUploader && (
            <div className="mt-4">
              <AudioUploader
                onFileSelect={handleFileSelect}
                onTranscriptionRequest={handleTranscriptionRequest}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {p0Tools.filter(tool => tool.title !== '录音整理').map((tool) => (
            <ToolCard
              key={tool.title}
              {...tool}
              priority="P0"
              onClick={handleToolClick}
            />
          ))}
        </div>
      </section>

        {/* P1 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span 
              className="px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ color: 'var(--td-warning-color)', backgroundColor: 'rgba(227, 115, 24, 0.08)' }}
            >
              P1 进阶
            </span>
            <h2 className="text-base font-semibold" style={{ color: 'var(--td-text-color-primary)' }}>
              选题收集 · 跨平台分发 · 音视频
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p1Tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} priority="P1" onClick={handleToolClick} />
            ))}
          </div>
        </section>

        {/* P2 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span 
              className="px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ color: 'var(--td-brand-color)', backgroundColor: 'var(--td-brand-color-light)' }}
            >
              P2 探索
            </span>
            <h2 className="text-base font-semibold" style={{ color: 'var(--td-text-color-primary)' }}>
              多媒体辅助
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p2Tools.map((tool) => (
              <ToolCard 
                key={tool.title} 
                {...tool} 
                priority="P2" 
                onClick={handleToolClick}
                isAction={tool.isAction}
                onAction={tool.isAction ? onOpenImageGen : undefined}
              />
            ))}
          </div>
        </section>

        {/* 底部提示 */}
        <div 
          className="p-4 rounded-lg"
          style={{ 
            backgroundColor: 'var(--td-bg-color-component)',
            border: '1px solid var(--td-component-stroke)',
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--td-text-color-placeholder)' }}>
            ⚠️ <strong>新闻专业主义提示</strong>：AI辅助生成内容需人工审核，事实性内容请务必核实来源。
            所有AI生成内容将标注【AI辅助生成】标识。
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewsToolsPage;
