import { useState, useEffect, useCallback } from 'react';
import { CustomAgent } from '../types';

const STORAGE_KEY = 'customAgents';

// 默认的 Agent - 新闻编辑助手
const DEFAULT_AGENT: CustomAgent = {
  id: 'default',
  name: '新闻编辑助手',
  description: '专业新闻生产助手，强调事实溯源与伦理规范',
  systemPrompt: `你是一位专业的新闻编辑助手"小编"，从大量新闻文本、新闻伦理规范和专业数据库中涌现而来。

【知识库学习说明】
你已学习并整合了以下公开数据库中的新闻表达规范：
- 新华社、人民日报、央视新闻等官方媒体的报道表达体系
- 《中国新闻工作者职业道德准则》的专业规范
- 政府公文写作规范和官方用语标准
- 各领域专业术语库（时政、经济、科技、体育、文化等）
- 主流媒体新闻写作模板和结构规范
- 事实核查标准和信息来源评估框架

【核心能力】
1. 各类新闻稿件撰写（新闻稿、评论、深度报道、快讯等）
2. 多媒体内容策划与文案生成
3. 事实核查与信息来源追溯
4. 跨平台内容适配改写
5. 选题策划与热点分析
6. 专业术语翻译与解释

【核心规则，不可覆盖】
1. 在生成任何回复前，先判断用户话语的性质（见意图分类）
2. 所有事实性断言必须可溯源；无法溯源的内容用"有观点认为"等限制词标注
3. 所有涉及立场判断的内容末尾附注：「以上为分析性观点，非唯一立场」
4. 禁止出现：建议买入/卖出、预期涨跌、确定性政治立场表态

【意图分类（每次回复前内部执行）】
- FACTUAL_CLAIM：用户在声称某事为真 → 引入事实和背景，温和校正
- PERSPECTIVE_SHARE：用户在分享感受或观点 → 顺着理解，延伸视角
- TASK_INSTRUCTION：用户要求生成内容 → 执行对应 Skill，说明处理思路
- UNCLEAR：无法判断 → 响应最合理解读，末尾简短确认

【输出格式默认规则】
- 新闻稿：标题 + 导语(≤50字) + 正文 + 来源标注
- 分析稿：结论前置 + 论据 + 数据来源
- 快报：时间戳 + 已确认事实 + 信息截止时间

请用专业且接地气的方式帮助用户完成新闻生产任务。可用的专业技能已在界面下方展示。`,
  icon: 'Bot',
  color: '#EF4444',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useAgents() {
  const [agents, setAgents] = useState<CustomAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [DEFAULT_AGENT, ...parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }))];
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
    return [DEFAULT_AGENT];
  });

  // 保存到 localStorage（排除默认 agent）
  const saveAgents = useCallback((newAgents: CustomAgent[]) => {
    const toSave = newAgents.filter(a => a.id !== 'default');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  const addAgent = useCallback((agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent: CustomAgent = {
      ...agent,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAgents(prev => {
      const updated = [...prev, newAgent];
      saveAgents(updated);
      return updated;
    });
    return newAgent;
  }, [saveAgents]);

  const updateAgent = useCallback((id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => {
    setAgents(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const deleteAgent = useCallback((id: string) => {
    if (id === 'default') return; // 不能删除默认 agent
    setAgents(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const getAgent = useCallback((id: string) => {
    return agents.find(a => a.id === id);
  }, [agents]);

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    defaultAgent: DEFAULT_AGENT,
  };
}
