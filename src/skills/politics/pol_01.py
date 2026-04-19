"""
政治新闻报道技能 - pol_01
政策解读与多方立场分析报道
"""

POL_01_METADATA = {
    "id": "pol_01",
    "name": "政策解读报道",
    "category": "politics",
    "description": "专业政策文本解读，生成含多方立场对比的结构化报道",
    "icon": "FileText",
    "color": "#DC2626",
    "input_schema": {
        "policy_text": "str",           # 政策原文（必填）
        "audience": "professional | general",
        "platform": "print | wechat | weibo"
    }
}

INPUT_SCHEMA = {
    "policy_text": str,           # 政策原文（必填）
    "audience": "professional | general",
    "platform": "print | wechat | weibo"
}

OUTPUT_SCHEMA = {
    "structured_card": dict,      # 核心条款、适用范围、生效时间
    "background_summary": str,    # ≤300字背景摘要
    "stance_matrix": list,        # [{party, stance, source, quote}]
    "impact_assessment": str,     # 影响评估段落（含限制词）
    "article": dict,              # 生成的新闻稿
    "fact_check_report": list    # [{claim, verified, source}]
}

WORKFLOW = """
## 工作流程

### Step 1 - 解析政策文本
从以下政策文本中提取：核心条款列表、适用范围、生效时间、主管部门

### Step 2 - 检索历史背景
使用 web_search 搜索：f"{policy_name} {authority} 背景 历史 出台原因"
生成 background_summary（≤300字，注明来源）

### Step 3 - 多方立场检索（强制执行）
使用 web_search 执行3次搜索：
- query1: f"{policy_name} 官方解读 表态"
- query2: f"{policy_name} 专家学者 评价"
- query3: f"{policy_name} 影响 相关群体"

输出 stance_matrix，格式：[{party, stance, source, quote}]
约束：每方立场必须标注来源URL和发布时间

### Step 4 - 影响评估
基于stance_matrix，分析政策对不同群体的影响。
必须使用限制词：可能、预计、或将、有望。
禁止确定性表述如：将会、必然、肯定。

### Step 5 - 生成稿件
按照以下格式要求生成新闻报道

### Step 6 - 数字核查（自动）
验证稿件中每个数字与structured_card的一致性
标记所有需人工确认的事实性表述
"""

POL_01_ARTICLE_PROMPT = """
你是资深政策记者。根据以下材料生成政策报道稿。

政策结构卡：{structured_card}
历史背景：{background_summary}
各方立场：{stance_matrix}
影响评估：{impact_assessment}

报道要求：
1. 结构：导语(核心要点) → 政策内容 → 背景分析 → 各方反应 → 影响展望
2. 导语不超过50字，直接点明最重要信息
3. 各方立场段落必须包含支持方和质疑方，篇幅基本平衡
4. 所有引用必须注明来源（机构名+时间）
5. 末尾附注：「以上影响评估为分析性观点，非唯一立场」

受众：{audience}
平台：{platform}（wechat需小标题，weibo需压缩至500字以内）
"""

# 新闻稿结构模板
NEWS_ARTICLE_TEMPLATE = {
    "headline": "",        # 主标题
    "subtitle": "",       # 副标题/导语
    "sections": {
        "lead": "",       # 导语
        "policy_content": "",  # 政策内容
        "background": "",      # 背景分析
        "reactions": [],      # 各方反应 [{party, stance, quote}]
        "outlook": ""          # 影响展望
    },
    "metadata": {
        "sources": [],    # 引用来源
        "author_note": "以上影响评估为分析性观点，非唯一立场"
    }
}

# 限制词列表
RESTRICTED_WORDS = [
    "将会", "必然", "肯定", "必定", "一定",
    "绝对", "毫无疑问", "毫无疑问地"
]

# 建议使用词语
SUGGESTED_WORDS = [
    "可能", "预计", "或将", "有望", "预期",
    "或将", "估计", "倾向于", "观察人士认为"
]

def validate_article(article_text: str) -> dict:
    """验证文章是否符合规范"""
    issues = []
    
    # 检查限制词
    for word in RESTRICTED_WORDS:
        if word in article_text:
            issues.append(f"使用了限制词: {word}")
    
    # 检查来源标注
    if "来源" not in article_text and "据" not in article_text:
        issues.append("缺少来源标注")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues
    }

def format_for_platform(article: dict, platform: str) -> str:
    """根据平台格式化输出"""
    if platform == "wechat":
        return format_wechat(article)
    elif platform == "weibo":
        return format_weibo(article)
    else:  # print
        return format_print(article)

def format_wechat(article: dict) -> str:
    """微信格式：小标题分段"""
    output = f"## {article['headline']}\n\n"
    if article.get('subtitle'):
        output += f"*{article['subtitle']}*\n\n"
    output += f"### 一、政策内容\n{article['sections']['policy_content']}\n\n"
    output += f"### 二、背景分析\n{article['sections']['background']}\n\n"
    output += f"### 三、各方反应\n"
    for r in article['sections']['reactions']:
        output += f"**{r['party']}**：{r['quote']}\n\n"
    output += f"### 四、影响展望\n{article['sections']['outlook']}\n\n"
    output += f"*{article['metadata']['author_note']}*"
    return output

def format_weibo(article: dict) -> str:
    """微博格式：压缩至500字"""
    content = f"{article['subtitle']} "
    content += f"{article['sections']['policy_content'][:200]} "
    content += f"各方反应："
    for r in article['sections']['reactions'][:2]:
        content += f"{r['party']}称'{r['quote'][:50]}...' "
    content += f"后续影响待观察。"
    return content[:500]

def format_print(article: dict) -> str:
    """印刷格式：完整报道"""
    output = f"# {article['headline']}\n"
    if article.get('subtitle'):
        output += f"## {article['subtitle']}\n\n"
    for section_name, section_content in article['sections'].items():
        if isinstance(section_content, list):
            for item in section_content:
                output += f"**{item['party']}**：{item['quote']}\n"
        else:
            output += f"{section_content}\n\n"
    output += f"\n*来源：{'、'.join(article['metadata']['sources'])}*\n"
    output += f"*{article['metadata']['author_note']}*"
    return output
