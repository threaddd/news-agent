import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  Search,
  Video,
  BarChart3,
  Mic,
  Image as ImageIcon,
  Upload,
  PenTool,
  Share2,
  Wand2,
  Clock,
  BookOpen,
  Landmark,
  TrendingUp,
  Palette,
  Trophy,
  Cpu,
  Globe,
  ArrowLeft,
  FileText,
  Zap,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AudioUploader } from '../components/AudioUploader';

// 六大新闻板块配置
const NEWS_SECTIONS = [
  { 
    id: 'politics', 
    name: '政治', 
    icon: <Landmark size={20} />,
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.08)',
    description: '政策解读、政务新闻、外交动态',
    keywords: ['政策', '政府', '外交', '两会', '人大', '政协', '部委']
  },
  { 
    id: 'economy', 
    name: '经济', 
    icon: <TrendingUp size={20} />,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    description: '宏观经济、市场行情、产业趋势',
    keywords: ['经济', '股市', '金融', '贸易', 'GDP', 'CPI', '房价']
  },
  { 
    id: 'culture', 
    name: '文化', 
    icon: <Palette size={20} />,
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.08)',
    description: '文娱动态、文化遗产、文艺评论',
    keywords: ['文化', '电影', '音乐', '文学', '艺术', '文物', '非遗']
  },
  { 
    id: 'sports', 
    name: '体育', 
    icon: <Trophy size={20} />,
    color: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.08)',
    description: '赛事报道、运动员动态、体育产业',
    keywords: ['体育', '足球', '篮球', '奥运', '亚运', '世界杯', '中超']
  },
  { 
    id: 'tech', 
    name: '科技', 
    icon: <Cpu size={20} />,
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    description: '科技创新、行业动态、技术前沿',
    keywords: ['科技', 'AI', '芯片', '互联网', '5G', '新能源', '智能']
  },
  { 
    id: 'international', 
    name: '国际', 
    icon: <Globe size={20} />,
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.08)',
    description: '国际要闻、地区局势、全球治理',
    keywords: ['国际', '美国', '欧洲', '亚太', '联合国', 'G20', '一带一路']
  },
];

// 政治板块技能类型定义
interface PoliticsSkill {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  priority: 'P0' | 'P1' | 'P2';
  skillConfig?: {
    inputSchema: string[];
    outputFormat: string;
  };
  prompt?: string;
}

// 政治板块技能（使用 Skill 系统）
const POLITICS_SKILLS: PoliticsSkill[] = [
  {
    id: 'pol_01',
    title: '政策解读报道',
    description: '【专业技能】结构化政策解读，核心条款提取、多方立场对比、生成符合新闻规范的报道。支持微信/微博/报纸多平台输出。',
    icon: <FileText size={22} />,
    color: '#DC2626',
    priority: 'P0',
    skillConfig: {
      inputSchema: ['policy_text (必填)', 'audience: professional|general', 'platform: print|wechat|weibo'],
      outputFormat: '结构卡 + 背景摘要 + 立场矩阵 + 影响评估 + 新闻稿',
    }
  },
  {
    id: 'pol_04',
    title: '突发新闻快报',
    description: '【时效优先】3分钟内生成首发快报。信源分级核实(A/B/C级)，只使用已确认事实，滚动更新跟踪。',
    icon: <Zap size={22} />,
    color: '#F59E0B',
    priority: 'P0',
    skillConfig: {
      inputSchema: ['event_description (必填)', 'known_sources', 'urgency: breaking|urgent|normal'],
      outputFormat: '信源评级 + 核实事实 + 首发快报(≤200字) + 滚动更新',
    }
  },
  {
    id: 'pol_05',
    title: '记者会转录分析',
    description: '【专业技能】发布会音频/视频转录，发言人识别、争议问答标注、生成结构化报道稿。',
    icon: <Mic size={22} />,
    color: '#7C3AED',
    priority: 'P0',
    skillConfig: {
      inputSchema: ['media_file (音频/视频)', 'institution (机构名称)', 'date (日期)', 'known_speakers (可选)'],
      outputFormat: '带时间戳全文 + 结构分段 + 争议标注 + 核心要点 + 新闻稿',
    }
  },
  {
    id: 'politics_report',
    title: '两会报道',
    description: '策划两会报道方案，包括预热报道、进程报道、深度解读三个阶段。',
    icon: <Landmark size={22} />,
    color: '#DC2626',
    priority: 'P1',
    prompt: '请帮我策划两会报道方案，包括预热报道、进程报道、深度解读三个阶段。',
  },
  {
    id: 'diplomacy_news',
    title: '外交新闻',
    description: '撰写外交活动新闻稿，包含活动概述、参与者表态、双边关系背景。',
    icon: <Globe size={22} />,
    color: '#0891B2',
    priority: 'P1',
    prompt: '请帮我撰写外交活动新闻稿，事件：[描述外交活动]，参与者：[参与者信息]。',
  },
  {
    id: 'politics_comment',
    title: '时事评论',
    description: '分析政治事件的多个维度，提供客观中立的分析框架。',
    icon: <BarChart3 size={22} />,
    color: '#7C3AED',
    priority: 'P1',
    prompt: '请帮我分析以下政治事件的多个维度，事件：[描述事件]，请提供客观中立的分析框架。',
  },
];

// 分板块工具模板
// 使用 any 以支持不同类型的工具配置
const SECTION_TOOLS: Record<string, any[]> = {
  politics: POLITICS_SKILLS,
  economy: [
    {
      id: 'eco_01',
      title: '经济数据解读',
      description: '【专业技能】宏观经济数据解读，历史序列分析，国际对比，专家观点呈现，生成合规财经报道。',
      icon: <TrendingUp size={22} />,
      color: '#059669',
      priority: 'P0',
      skillConfig: {
        inputSchema: ['indicator_name (指标名称)', 'value (数值)', 'unit (%/亿元等)', 'statistical_scope (同比/环比)', 'release_authority (发布机构)', 'period (统计周期)'],
        outputFormat: '数据卡 + 历史序列 + 同比/环比 + 国际对比 + 专家观点 + 报道稿',
      }
    },
    {
      id: 'eco_04',
      title: '市场快讯',
      description: '【时效优先】每日市场收盘/开盘快讯，异动板块分析，成因归因表述，生成合规财经报道。',
      icon: <BarChart3 size={22} />,
      color: '#10B981',
      priority: 'P0',
      skillConfig: {
        inputSchema: ['market_type (stock|forex|commodity|bond)', 'session (open|close|midday|weekly)', 'focus_events (当日重点事件，可选)'],
        outputFormat: '市场总体 + 异动板块/品种 + 成因分析 + 明日关注（≤600字）',
      }
    },
    {
      id: 'eco_report',
      title: '财经快讯',
      description: '撰写财经快讯，事件描述清晰，时间线准确，数据来源可靠。',
      icon: <TrendingUp size={22} />,
      color: '#059669',
      priority: 'P1',
      prompt: '请帮我撰写财经快讯，事件：[描述财经事件]，要求：时间线清晰、数据准确。',
    },
    {
      id: 'industry_analysis',
      title: '行业分析',
      description: '分析行业发展趋势，市场规模、竞争格局、未来预测。',
      icon: <BarChart3 size={22} />,
      color: '#10B981',
      priority: 'P1',
      prompt: '请帮我分析[行业名称]的发展趋势，包括市场规模、竞争格局、未来预测。',
    },
    {
      id: 'financial_report',
      title: '财报摘要',
      description: '提炼财报核心信息，生成结构化摘要，标注关键数据。',
      icon: <BookOpen size={22} />,
      color: '#059669',
      priority: 'P1',
      prompt: '请帮我提炼以下财报的核心信息：[粘贴财报内容]，生成结构化摘要。',
    },
  ],
  culture: [
    { title: '影视评论', prompt: '请帮我撰写[电影/剧集名称]的深度评论，从主题、叙事、表演等角度分析。' },
    { title: '展览报道', prompt: '请帮我撰写[展览名称]的报道稿，介绍展览内容、特色展品、观展指南。' },
    { title: '文化专题', prompt: '请帮我策划一个关于[文化主题]的深度报道专题，包含多个报道角度。' },
    { title: '人物专访', prompt: '请帮我生成[文化领域人物]的采访提纲，包含专业问题和个人故事问题。' },
  ],
  sports: [
    { title: '赛事报道', prompt: '请帮我撰写[赛事名称]的报道稿，比分：[比分]，关键亮点：[描述亮点]。' },
    { title: '人物特写', prompt: '请帮我撰写[运动员/教练]的人物特写，包含职业生涯高光时刻和背后故事。' },
    { title: '赛季前瞻', prompt: '请帮我分析[联赛/杯赛]的新赛季形势，包括夺冠热门、黑马预测。' },
    { title: '数据新闻', prompt: '请帮我用数据可视化角度分析[体育事件]，提取有趣的统计数据和对比。' },
  ],
  tech: [
    {
      id: 'tech_02',
      title: '科技报道',
      description: '【专业技能】三层次技术翻译、声明可信度分级、夸大风险检测，生成合规科技报道。',
      icon: <Cpu size={22} />,
      color: '#2563EB',
      priority: 'P0',
      skillConfig: {
        inputSchema: ['technology (技术名称)', 'trigger_event (新研究/新应用/争议事件)', 'audience (professional|general)'],
        outputFormat: '三层次翻译 + 声明分级 + 夸大检测 + 报道稿',
      }
    },
    {
      id: 'tech_03',
      title: '研究论文解读',
      description: '【专业技能】方法论核查、局限性标注、科研报道合规转化，生成大众可读且严谨的研究报道。',
      icon: <BookOpen size={22} />,
      color: '#6366F1',
      priority: 'P0',
      skillConfig: {
        inputSchema: ['research_abstract (研究摘要)', 'methodology_flags (方法论问题)', 'peer_review_summary (同行评价)'],
        outputFormat: '方法论检查清单 + 报道稿 + 研究局限性',
      }
    },
    { title: '产品评测', prompt: '请帮我撰写[产品名称]的评测报告，从外观、性能、体验、性价比等维度分析。' },
    { title: '行业观察', prompt: '请帮我分析[科技领域]的最新动态，评估其对行业和用户的影响。' },
    { title: '技术科普', prompt: '请帮我用通俗易懂的语言解释[技术概念]，面向普通读者。' },
    { title: '创业故事', prompt: '请帮我策划[科技公司/创始人]的创业故事报道，包含创业历程、核心产品、行业洞察。' },
  ],
  international: [
    {
      id: 'intl_01',
      title: '国际突发报道',
      description: '【专业技能】多信源交叉核实、立场归因标注、生成合规国际突发快报和背景稿。',
      icon: <Globe size={22} />,
      color: '#0891B2',
      priority: 'P0',
      skillConfig: {
        inputSchema: ['event (事件描述)', 'sources (已有信源)', 'regional_background (地区背景)'],
        outputFormat: '多信源核实矩阵 + 快报(≤200字) + 背景稿(≤800字)',
      }
    },
    { title: '国际快讯', prompt: '请帮我编译国际要闻简报，基于以下素材：[粘贴素材]，提取关键信息。' },
    { title: '地区分析', prompt: '请帮我分析[地区名称]的最新局势，包括各方立场、历史背景、未来走向。' },
    { title: '全球议题', prompt: '请帮我深度分析[全球性议题]，提供多角度观点和数据支撑。' },
    { title: '驻外见闻', prompt: '请帮我撰写[国家/地区]的见闻稿，从文化、社会、民生角度呈现。' },
  ],
};

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
  accentColor?: string;
}

interface NewsToolsPageProps {
  onSelectTool: (prompt: string) => void;
  onOpenImageGen?: () => void;
}

function ToolCard({ title, description, icon, category, priority, onClick, isAction, onAction, accentColor }: ToolCardProps) {
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
  const color = accentColor || 'var(--td-brand-color)';

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
          background: accentColor 
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
            : 'linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover))',
          boxShadow: accentColor 
            ? `0 4px 12px ${accentColor}33`
            : '0 4px 12px rgba(0, 82, 217, 0.15)',
        }}
      >
        {icon}
      </div>

      {/* Category */}
      <p 
        className="text-[11px] font-medium uppercase tracking-wider mb-1"
        style={{ color: color }}
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
        style={{ 
          background: accentColor 
            ? `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`
            : 'linear-gradient(90deg, var(--td-brand-color), var(--color-accent-orange))'
        }}
      />
    </button>
  );
}

function SectionCard({ section, onClick }: { section: typeof NEWS_SECTIONS[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--td-bg-color-container)',
        border: '1px solid var(--td-component-stroke)',
        boxShadow: 'var(--td-shadow-1)',
      }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform"
        style={{ 
          background: `linear-gradient(135deg, ${section.color}, ${section.color}cc)`,
          boxShadow: `0 4px 12px ${section.color}33`,
        }}
      >
        {section.icon}
      </div>

      {/* Title */}
      <h3 
        className="text-lg font-bold mb-1.5 group-hover:translate-x-0.5 transition-transform"
        style={{ color: 'var(--td-text-color-primary)' }}
      >
        {section.name}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--td-text-color-secondary)' }}>
        {section.description}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {section.keywords.slice(0, 4).map(keyword => (
          <span 
            key={keyword}
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: section.bgColor,
              color: section.color,
            }}
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Hover Effect Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[3px] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl"
        style={{ background: `linear-gradient(90deg, ${section.color}, ${section.color}88)` }}
      />
    </button>
  );
}

function SectionDetail({ section, onBack, onSelectTool }: {
  section: typeof NEWS_SECTIONS[0];
  onBack: () => void;
  onSelectTool: (prompt: string) => void;
}) {
  const tools = SECTION_TOOLS[section.id as keyof typeof SECTION_TOOLS] || [];

  const handleToolClick = (tool: any) => {
    if (tool.skillConfig) {
      // P0 专业技能：发送技能ID和输入参数模板
      const skillPrompt = `[SKILL: ${tool.id}]\n请使用【${tool.title}】技能帮我完成以下任务：\n\n请先说明技能输入参数要求：\n${tool.skillConfig.inputSchema.map((p: string) => `- ${p}`).join('\n')}\n\n请简要说明输出格式：\n${tool.skillConfig.outputFormat}`;
      onSelectTool(skillPrompt);
    } else if (tool.prompt) {
      // 普通工具
      onSelectTool(tool.prompt);
    } else {
      // 新格式的工具
      onSelectTool(`请帮我完成【${tool.title}】：${tool.description.replace(/【[^】]+】/g, '')}`);
    }
  };

  const getPriorityConfig = (priority: string) => ({
    P0: { color: 'var(--td-error-color)', bg: 'rgba(213, 73, 65, 0.08)', label: 'P0 专业' },
    P1: { color: 'var(--td-warning-color)', bg: 'rgba(227, 115, 24, 0.08)', label: 'P1 通用' },
    P2: { color: 'var(--td-brand-color)', bg: 'var(--td-brand-color-light)', label: 'P2 探索' },
  }[priority] || { color: 'var(--td-brand-color)', bg: 'var(--td-brand-color-light)', label: 'P2' });

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ color: 'var(--td-text-color-secondary)' }}
      >
        <ArrowLeft size={18} />
        <span className="text-sm">返回板块列表</span>
      </button>

      {/* Section Header */}
      <div
        className="p-6 rounded-xl mb-6"
        style={{
          background: `linear-gradient(135deg, ${section.color}15, ${section.color}05)`,
          border: `1px solid ${section.color}30`,
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white"
            style={{ background: `linear-gradient(135deg, ${section.color}, ${section.color}cc)` }}
          >
            {section.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--td-text-color-primary)' }}>
              {section.name}新闻板块
            </h2>
            <p className="text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
              {section.description}
            </p>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2">
          {section.keywords.map(keyword => (
            <span
              key={keyword}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: section.bgColor,
                color: section.color,
              }}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Skills Header (有P0专业技能的板块) */}
      {tools.some((t: any) => t.skillConfig) && (
        <div
          className="mb-4 p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: `${section.color}10`,
            border: `1px solid ${section.color}30`,
          }}
        >
          <AlertCircle size={18} style={{ color: section.color, marginTop: 2 }} />
          <div className="text-sm" style={{ color: 'var(--td-text-color-secondary)' }}>
            <strong style={{ color: section.color }}>专业技能说明</strong>：
            P0技能内置专业工作流，会自动执行多步处理并输出结构化结果。
            点击后将提示您输入所需参数。
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool: any, index) => {
          const pConfig = getPriorityConfig(tool.priority || 'P2');
          const toolColor = tool.color || section.color;
          const toolIcon = tool.icon || section.icon;

          return (
            <button
              key={tool.id || tool.title}
              onClick={() => handleToolClick(tool)}
              className="group text-left p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--td-bg-color-container)',
                border: '1px solid var(--td-component-stroke)',
                boxShadow: 'var(--td-shadow-1)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${toolColor}, ${toolColor}cc)`,
                    boxShadow: `0 4px 12px ${toolColor}33`,
                  }}
                >
                  {toolIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-semibold group-hover:translate-x-0.5 transition-transform"
                      style={{ color: 'var(--td-text-color-primary)' }}
                    >
                      {tool.title}
                    </h3>
                    {tool.priority && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ color: pConfig.color, backgroundColor: pConfig.bg }}
                      >
                        {pConfig.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--td-text-color-placeholder)' }}>
                    {tool.description ? tool.description.replace(/【[^】]+】/g, '').slice(0, 80) : tool.prompt?.slice(0, 80) || ''}
                  </p>
                  {tool.skillConfig && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tool.skillConfig.inputSchema.slice(0, 2).map((param: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${toolColor}15`, color: toolColor }}
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Assistant Hint */}
      <div
        className="mt-6 p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--td-brand-color-light)',
          border: '1px solid rgba(0, 82, 217, 0.1)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--td-brand-color)' }}>
          💡 <strong>提示</strong>：您也可以直接描述您的需求，AI 会根据【{section.name}】板块的专业规范为您生成内容。
        </p>
      </div>
    </div>
  );
}

export function NewsToolsPage({ onSelectTool, onOpenImageGen }: NewsToolsPageProps) {
  const navigate = useNavigate();
  const [showAudioUploader, setShowAudioUploader] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
  };

  const handleTranscriptionRequest = (file: File) => {
    onSelectTool(`请帮我转录这段录音文件：${file.name}，并将内容整理成结构化文本，标注关键引用和要点。`);
  };

  const handleToolClick = (toolName: string) => {
    const prompts: Record<string, string> = {
      '采访提纲生成': '请帮我生成一份采访提纲。我要采访的主题是：[请描述主题]，采访对象是：[请描述受访者]，预计时长为：[时长]。请包含开场问题、核心问题、敏感问题（谨慎处理）和结束问题。',
      '新闻稿撰写': '请帮我撰写一篇新闻稿。事件是：[描述新闻事件]，请采用倒金字塔结构，包含导语（最重要的事实）、主体（详细背景）、背景（相关 Context）。请确保语言简洁，专业，符合新闻写作规范。',
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

  const handleSectionToolSelect = (prompt: string) => {
    onSelectTool(prompt);
    navigate('/');
  };

  const selectedSectionData = NEWS_SECTIONS.find(s => s.id === selectedSection);

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

  // 热门技能列表（用于快速调用面板）
  const quickSkills = [
    { id: 'pol_01', name: '政策解读报道', icon: <FileText size={16} />, color: '#DC2626', category: '时政', prompt: '请使用【政策解读报道】技能帮我完成：\n\n请先说明技能输入参数要求。' },
    { id: 'pol_04', name: '突发新闻快报', icon: <Zap size={16} />, color: '#F59E0B', category: '时政', prompt: '请使用【突发新闻快报】技能帮我处理突发事件：\n\n请先说明技能输入参数要求。' },
    { id: 'eco_01', name: '经济数据解读', icon: <TrendingUp size={16} />, color: '#059669', category: '经济', prompt: '请使用【经济数据解读】技能帮我分析：\n\n请先说明技能输入参数要求。' },
    { id: 'eco_04', name: '市场快讯', icon: <BarChart3 size={16} />, color: '#10B981', category: '经济', prompt: '请使用【市场快讯】技能帮我生成市场快讯：\n\n请先说明技能输入参数要求。' },
    { id: 'tech_02', name: '科技报道', icon: <Cpu size={16} />, color: '#2563EB', category: '科技', prompt: '请使用【科技报道】技能帮我分析科技事件：\n\n请先说明技能输入参数要求。' },
    { id: 'tech_03', name: '研究论文解读', icon: <BookOpen size={16} />, color: '#6366F1', category: '科技', prompt: '请使用【研究论文解读】技能帮我解读研究论文：\n\n请先说明技能输入参数要求。' },
    { id: 'intl_01', name: '国际突发报道', icon: <Globe size={16} />, color: '#0891B2', category: '国际', prompt: '请使用【国际突发报道】技能帮我处理国际突发事件：\n\n请先说明技能输入参数要求。' },
    { id: 'pol_05', name: '记者会转录分析', icon: <Mic size={16} />, color: '#7C3AED', category: '时政', prompt: '请使用【记者会转录分析】技能帮我处理发布会内容：\n\n请先说明技能输入参数要求。' },
  ];

  const [showQuickSkills, setShowQuickSkills] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {selectedSection && selectedSectionData ? (
          <SectionDetail 
            section={selectedSectionData}
            onBack={() => setSelectedSection(null)}
            onSelectTool={handleSectionToolSelect}
          />
        ) : (
          <>
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

              {/* ========== 专业技能快速调用面板 ========== */}
              <div
                className="mt-5 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: 'var(--td-bg-color-container)',
                  border: '1px solid var(--td-component-stroke)',
                }}
              >
                {/* 面板头部 */}
                <button
                  onClick={() => setShowQuickSkills(!showQuickSkills)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: 'var(--td-brand-color)' }} />
                    <span className="font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                      专业技能快速调用
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--td-brand-color-light)',
                        color: 'var(--td-brand-color)',
                      }}
                    >
                      点击直接使用
                    </span>
                  </div>
                  {showQuickSkills ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* 技能列表 */}
                {showQuickSkills && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {quickSkills.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => {
                            onSelectTool(skill.prompt);
                            navigate('/');
                          }}
                          className="group flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            backgroundColor: `${skill.color}08`,
                            border: `1px solid ${skill.color}25`,
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${skill.color}, ${skill.color}cc)`,
                            }}
                          >
                            {skill.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: skill.color }}>
                              {skill.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{skill.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-center" style={{ color: 'var(--td-text-color-placeholder)' }}>
                      点击技能将跳转到聊天界面并自动调用该专业技能
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ========== 分区新闻板块 ========== */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--td-brand-color), var(--color-accent-orange))' }}
                >
                  <span className="text-white text-sm">📰</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--td-text-color-primary)' }}>
                    分区新闻板块
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
                    选择板块，获取针对性的新闻生产工具
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {NEWS_SECTIONS.map(section => (
                  <SectionCard 
                    key={section.id}
                    section={section}
                    onClick={() => setSelectedSection(section.id)}
                  />
                ))}
              </div>
            </section>

            {/* ========== 通用工具 ========== */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default NewsToolsPage;
