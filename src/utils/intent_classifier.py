"""
新闻助手意图分类器
调用方式：intent = classify_intent(user_input)
"""

import os
import re
from enum import Enum
from typing import Optional

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


class IntentType(Enum):
    FACTUAL_CLAIM = "FACTUAL_CLAIM"      # 事实性声明
    PERSPECTIVE_SHARE = "PERSPECTIVE_SHARE"  # 观点分享
    TASK_INSTRUCTION = "TASK_INSTRUCTION"  # 任务指令
    UNCLEAR = "UNCLEAR"                  # 无法判断


INTENT_PROMPT = """
判断以下用户输入属于哪种类型，只返回一个标签。

用户输入：{user_input}

判断标准：
- FACTUAL_CLAIM：含有"是""不是""根据""数据显示""事实""证明"等断言性表达
- PERSPECTIVE_SHARE：含有"我觉得""感觉""可能""好像""我认为"等主观性表达
- TASK_INSTRUCTION：含有动词指令如"写""生成""分析""整理""帮我""创作""制作"
- UNCLEAR：以上都不明显，或输入过短无法判断

只返回标签，不要解释。
"""


# ============ 关键词快速匹配（无需 LLM 调用）============

FACTUAL_KEYWORDS = [
    "是", "不是", "根据", "数据显示", "事实", "证明", "证实",
    "发生", "造成", "导致", "来自", "位于", "截至", "总计",
    "据报道", "据悉", "从 X 获取", "数据显示", "调查表明"
]

PERSPECTIVE_KEYWORDS = [
    "我觉得", "我感觉", "我认为", "可能", "好像", "似乎",
    "大概", "也许", "估计", "推测", "个人看法", "主观认为",
    "有望", "或将", "或将", "料将", "预计"  # 这些是推测性表达
]

TASK_KEYWORDS = [
    "帮我", "请", "写", "生成", "分析", "整理", "创作",
    "制作", "翻译", "总结", "提取", "查找", "搜索", "生成",
    "起草", "策划", "编辑", "润色", "改写", "续写", "推荐"
]


def quick_classify(user_input: str) -> Optional[IntentType]:
    """
    快速分类：基于关键词匹配，无需 LLM 调用
    返回 None 表示需要 LLM 进一步判断
    """
    if not user_input or len(user_input.strip()) < 3:
        return IntentType.UNCLEAR
    
    # 统计各类关键词出现次数
    factual_count = sum(1 for kw in FACTUAL_KEYWORDS if kw in user_input)
    perspective_count = sum(1 for kw in PERSPECTIVE_KEYWORDS if kw in user_input)
    task_count = sum(1 for kw in TASK_KEYWORDS if kw in user_input)
    
    counts = {
        IntentType.FACTUAL_CLAIM: factual_count,
        IntentType.PERSPECTIVE_SHARE: perspective_count,
        IntentType.TASK_INSTRUCTION: task_count,
    }
    
    # 如果有明显的关键词匹配
    max_count = max(counts.values())
    if max_count >= 2:
        for intent, count in counts.items():
            if count == max_count:
                return intent
    
    # 单个关键词也可能是明确的指令
    if task_count >= 1 and any(kw in user_input for kw in ["帮我", "请", "写", "生成"]):
        return IntentType.TASK_INSTRUCTION
    
    return None  # 需要 LLM 判断


# ============ LLM 分类器 ============

class IntentClassifier:
    """支持多种 LLM 的意图分类器"""
    
    def __init__(self, provider: str = "openai", model: str = "gpt-3.5-turbo"):
        self.provider = provider
        self.model = model
        
        if provider == "openai" and HAS_OPENAI:
            self.client = openai.OpenAI(
                api_key=os.getenv("OPENAI_API_KEY")
            )
        elif provider == "anthropic" and HAS_ANTHROPIC:
            self.client = anthropic.Anthropic(
                api_key=os.getenv("ANTHROPIC_API_KEY")
            )
        else:
            self.client = None
    
    def classify(self, user_input: str) -> IntentType:
        """使用 LLM 进行意图分类"""
        
        # 先尝试快速分类
        quick_result = quick_classify(user_input)
        if quick_result:
            return quick_result
        
        # 需要 LLM 判断
        if not self.client:
            return IntentType.UNCLEAR
        
        prompt = INTENT_PROMPT.format(user_input=user_input)
        
        try:
            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0,
                    max_tokens=20
                )
                result = response.choices[0].message.content.strip()
            
            elif self.provider == "anthropic":
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=20,
                    messages=[{"role": "user", "content": prompt}]
                )
                result = response.content[0].text.strip()
            
            # 解析结果
            for intent in IntentType:
                if intent.value in result.upper():
                    return intent
            
            return IntentType.UNCLEAR
            
        except Exception as e:
            print(f"LLM 分类失败: {e}")
            return IntentType.UNCLEAR


# ============ 便捷函数 ============

# 默认分类器实例（可通过环境变量配置）
_default_classifier: Optional[IntentClassifier] = None


def get_classifier() -> IntentClassifier:
    global _default_classifier
    if _default_classifier is None:
        provider = os.getenv("INTENT_CLASSIFIER_PROVIDER", "openai")
        model = os.getenv("INTENT_CLASSIFIER_MODEL", "gpt-3.5-turbo")
        _default_classifier = IntentClassifier(provider=provider, model=model)
    return _default_classifier


def classify_intent(user_input: str, use_llm: bool = True) -> str:
    """
    便捷函数：判断用户输入的意图类型
    
    Args:
        user_input: 用户输入的文本
        use_llm: 是否在快速分类失败时使用 LLM
    
    Returns:
        IntentType 枚举值的字符串形式
    
    Example:
        >>> intent = classify_intent("帮我写一篇关于AI的新闻稿")
        >>> print(intent)
        "TASK_INSTRUCTION"
    """
    # 快速分类
    quick_result = quick_classify(user_input)
    if quick_result:
        return quick_result.value
    
    # 需要 LLM
    if use_llm:
        classifier = get_classifier()
        result = classifier.classify(user_input)
        return result.value
    
    return IntentType.UNCLEAR.value


# ============ 批处理 ============

def batch_classify_intent(inputs: list[str], use_llm: bool = True) -> list[str]:
    """
    批量分类多个用户输入
    
    Example:
        >>> intents = batch_classify_intent([
        ...     "帮我写一篇新闻稿",
        ...     "AI可能会改变新闻行业",
        ...     "该公司宣布盈利"
        ... ])
        >>> print(intents)
        ["TASK_INSTRUCTION", "PERSPECTIVE_SHARE", "FACTUAL_CLAIM"]
    """
    return [classify_intent(inp, use_llm=use_llm) for inp in inputs]


# ============ 测试 ============

if __name__ == "__main__":
    test_cases = [
        "帮我写一篇关于AI的新闻稿",
        "AI可能会改变新闻行业格局",
        "该公司昨日宣布季度盈利增长20%",
        "这个话题很有趣",
        "hello",
        "根据最新数据显示，经济增长放缓",
        "我觉得这个问题值得深入探讨",
        "生成一份市场分析报告",
    ]
    
    print("=" * 50)
    print("意图分类测试")
    print("=" * 50)
    
    for text in test_cases:
        intent = classify_intent(text)
        print(f"[{intent:20}] {text}")
