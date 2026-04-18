import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Home, 
  Scale, 
  Rocket, 
  BookOpen, 
  Trophy, 
  Star, 
  Medal,
  Globe,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { experts, Expert } from '../data/experts';

// 分类图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  '时政': <Brain className="w-5 h-5" />,
  '经济': <TrendingUp className="w-5 h-5" />,
  '民生': <Home className="w-5 h-5" />,
  '法治': <Scale className="w-5 h-5" />,
  '科技': <Rocket className="w-5 h-5" />,
  '文教': <BookOpen className="w-5 h-5" />,
  '体育': <Trophy className="w-5 h-5" />,
  '文艺': <Star className="w-5 h-5" />,
  '军事': <Medal className="w-5 h-5" />,
  '国际': <Globe className="w-5 h-5" />,
};

// 分类颜色映射
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '时政': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  '经济': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  '民生': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  '法治': { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  '科技': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  '文教': { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  '体育': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  '文艺': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  '军事': { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' },
  '国际': { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
};

interface ExpertCardProps {
  expert: Expert;
  onSelect: (expert: Expert) => void;
}

function ExpertCard({ expert, onSelect }: ExpertCardProps) {
  const colors = categoryColors[expert.category] || categoryColors['时政'];
  
  return (
    <button
      onClick={() => onSelect(expert)}
      className="card-gradient-border group relative w-full text-left p-6 rounded-2xl border-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
      style={{ borderColor: 'var(--td-component-stroke)' }}
    >
      {/* 背景装饰 */}
      <div 
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${expert.gradient}`}
      />
      
      {/* 头像区 */}
      <div className="relative flex items-center gap-4 mb-4">
        <div 
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${expert.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {expert.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {expert.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{expert.alias}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* 分类标签 */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
        {categoryIcons[expert.category]}
        {expert.category}
      </div>
      
      {/* 头衔 */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 font-medium">
        {expert.title}
      </p>
      
      {/* 简介 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">
        {expert.description}
      </p>
      
      {/* 专业领域 */}
      <div className="flex flex-wrap gap-2 mt-4">
        {expert.specialties.slice(0, 3).map((skill) => (
          <span 
            key={skill}
            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {skill}
          </span>
        ))}
      </div>
      
      {/* 底部渐变条 */}
      <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${expert.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
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

  const handleSelectExpert = (expert: Expert) => {
    onSelectExpert(expert);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                专家中心
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                10位专业领域专家，为您提供深度资讯分析
              </p>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            全部专家
          </button>
          {categories.map((category) => {
            const colors = categoryColors[category] || {};
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
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
              onSelect={handleSelectExpert}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            💡 点击任意专家卡片即可开始与该领域专家对话，获取专业的新闻资讯分析
          </p>
        </div>
      </div>
    </div>
  );
}
