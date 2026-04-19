import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Shield, TrendingUp, Home, Scale, Rocket, 
  BookOpen, Trophy, Star, Medal, Globe, ChevronRight, Sparkles,
} from 'lucide-react';
import { experts, Expert } from '../data/experts';

const categoryIcons: Record<string, React.ReactNode> = {
  '时政': <Brain className="w-4 h-4" />,
  '经济': <TrendingUp className="w-4 h-4" />,
  '民生': <Home className="w-4 h-4" />,
  '法治': <Scale className="w-4 h-4" />,
  '科技': <Rocket className="w-4 h-4" />,
  '文教': <BookOpen className="w-4 h-4" />,
  '体育': <Trophy className="w-4 h-4" />,
  '文艺': <Star className="w-4 h-4" />,
  '军事': <Medal className="w-4 h-4" />,
  '国际': <Globe className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  '时政': '#D54941',
  '经济': '#2BA471',
  '民生': '#E37318',
  '法治': '#7B61FF',
  '科技': '#EF4444',
  '文教': '#0594FA',
  '体育': '#34C724',
  '文艺': '#F76560',
  '军事': '#6E7178',
  '国际': '#2979FF',
};

interface ExpertCardProps {
  expert: Expert;
  onSelect: (expert: Expert) => void;
}

function ExpertCard({ expert, onSelect }: ExpertCardProps) {
  const color = categoryColors[expert.category] || 'var(--td-brand-color)';
  
  return (
    <button
      onClick={() => onSelect(expert)}
      className="group relative w-full text-left p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
      style={{
        backgroundColor: 'var(--td-bg-color-container)',
        border: '1px solid var(--td-component-stroke)',
        boxShadow: 'var(--td-shadow-1)',
      }}
    >
      {/* 头像区 */}
      <div className="flex items-center gap-3.5 mb-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 4px 12px ${color}25`,
          }}
        >
          {expert.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--td-text-color-primary)' }}>
            {expert.name}
          </h3>
          <p className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>{expert.alias}</p>
        </div>
        <ChevronRight 
          className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" 
          style={{ color: 'var(--td-brand-color)' }} 
        />
      </div>
      
      {/* 分类标签 */}
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
        style={{ 
          backgroundColor: `${color}12`,
          color: color,
        }}
      >
        {categoryIcons[expert.category]}
        {expert.category}
      </div>
      
      {/* 头衔 */}
      <p className="text-sm mt-2.5 font-medium" style={{ color: 'var(--td-text-color-secondary)' }}>
        {expert.title}
      </p>
      
      {/* 简介 */}
      <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--td-text-color-placeholder)' }}>
        {expert.description}
      </p>
      
      {/* 专业领域 */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {expert.specialties.slice(0, 3).map((skill) => (
          <span 
            key={skill}
            className="text-[11px] px-2 py-0.5 rounded-md"
            style={{ 
              backgroundColor: 'var(--td-bg-color-component)',
              color: 'var(--td-text-color-secondary)',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
      
      {/* 底部渐变条 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

interface ExpertCenterProps {
  onSelectExpert: (expert: Expert) => void;
  onBack?: () => void;
}

export function ExpertCenter({ onSelectExpert, onBack }: ExpertCenterProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(experts.map(e => e.category)));
  const filteredExperts = activeCategory 
    ? experts.filter(e => e.category === activeCategory)
    : experts;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--td-text-color-primary)' }}>
                专家中心
              </h1>
              <p className="text-sm" style={{ color: 'var(--td-text-color-placeholder)' }}>
                10位专业领域专家，为您提供深度资讯分析
              </p>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3.5 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: activeCategory === null ? 'var(--td-brand-color)' : 'var(--td-bg-color-component)',
              color: activeCategory === null ? 'white' : 'var(--td-text-color-secondary)',
            }}
          >
            全部
          </button>
          {categories.map((category) => {
            const color = categoryColors[category] || 'var(--td-brand-color)';
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? color : 'var(--td-bg-color-component)',
                  color: isActive ? 'white' : 'var(--td-text-color-secondary)',
                }}
              >
                {categoryIcons[category]}
                {category}
              </button>
            );
          })}
        </div>

        {/* 专家网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperts.map((expert) => (
            <ExpertCard 
              key={expert.id} 
              expert={expert}
              onSelect={onSelectExpert}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div
          className="mt-8 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--td-brand-color-light)',
            border: '1px solid rgba(0, 82, 217, 0.1)',
          }}
        >
          <p className="text-sm text-center" style={{ color: 'var(--td-brand-color)' }}>
            💡 点击任意专家卡片将直接进入聊天界面，使用该专家的专业技能为您服务
          </p>
        </div>
      </div>
    </div>
  );
}
