"""
经济新闻报道技能 - eco_01
经济数据解读与财经报道生成
"""

ECO_01_METADATA = {
    "id": "eco_01",
    "name": "经济数据解读",
    "category": "economy",
    "description": "宏观经济数据解读，历史序列分析，国际对比，专家观点呈现",
    "icon": "TrendingUp",
    "color": "#059669",
    "input_schema": {
        "indicator_name": "str (指标名称)",
        "value": "float (数值)",
        "unit": "str (%/亿元/万人等)",
        "statistical_scope": "str (同比/环比/季调后)",
        "release_authority": "str (发布机构)",
        "period": "str (统计周期)"
    }
}

INPUT_SCHEMA = {
    "indicator_name": str,
    "value": float,
    "unit": str,
    "statistical_scope": str,
    "release_authority": str,
    "period": str
}

OUTPUT_SCHEMA = {
    "data_card": dict,
    "historical_series": list,
    "yoy_mom": dict,
    "international_comparison": list,
    "expert_views": list,
    "article": dict,
    "number_check": list
}

# 强制规则
MANDATORY_RULES = [
    "1. 百分比变化必须同时注明：基期、计算方式（同比/环比/定基）",
    "2. 预测类数据必须标注机构名称，禁止以AI名义预测",
    "3. "增长""下滑""创历史新高"等判断词必须附数字依据",
    "4. 国际对比只在统计口径一致时进行，否则注明"口径差异，仅供参考"",
    "5. 专家观点须标注机构立场（如：某机构与该政策有利益关系）"
]

# 数据卡模板
DATA_CARD_TEMPLATE = {
    "indicator_name": "",
    "value": None,
    "unit": "",
    "statistical_scope": "",
    "release_authority": "",
    "period": "",
    "release_date": "",
    "previous_value": None,
    "previous_period": "",
    "yoy_change": None,
    "mom_change": None,
}

# 禁止词汇
FORBIDDEN_WORDS = [
    "肯定", "必然", "将会", "一定", "必定",
    "无疑", "毫无疑问", "必将", "注定"
]

# 限制词（预测时使用）
FORECAST_WORDS = [
    "预计", "有望", "或将", "可能", "预期",
    "估计", "倾向于", "观察人士认为", "市场预期"
]

# 历史数据点模板
HISTORICAL_POINT_TEMPLATE = {
    "period": "",
    "value": None,
    "change": None,
    "note": ""
}

# 国际对比模板
INTERNATIONAL_COMPARISON_TEMPLATE = {
    "country_region": "",
    "indicator": "",
    "value": None,
    "unit": "",
    "period": "",
    "caliber_match": True,
    "caliber_note": ""
}

# 专家观点模板
EXPERT_VIEW_TEMPLATE = {
    "expert": "",
    "institution": "",
    "view": "",
    "stance": "bullish | bearish | neutral",
    "source": "",
    "conflict_of_interest": ""
}

# 数字核查报告模板
NUMBER_CHECK_TEMPLATE = {
    "original_number": "",
    "usage_context": "",
    "verified": True,
    "source": "",
    "issue": ""
}

# 报道结构模板
ARTICLE_TEMPLATE = {
    "headline": "",
    "subtitle": "",
    "sections": {
        "lead": "",           # 导语
        "data_presentation": "",  # 数据呈现
        "international": "",     # 国际对比
        "expert_views": [],      # 专家解读
        "outlook": ""            # 前瞻
    },
    "metadata": {
        "sources": [],
        "disclaimer": "以上内容经AI辅助整理，仅供参考，不构成投资建议。"
    }
}

def validate_data_report(text: str) -> dict:
    """验证数据报道合规性"""
    issues = []
    warnings = []

    # 检查禁止词汇
    for word in FORBIDDEN_WORDS:
        if word in text:
            issues.append(f"使用了禁止词汇: {word}")

    # 检查数字来源标注
    if not any(word in text for word in ["据", "来源", "数据显示", "统计局"]):
        warnings.append("建议添加数据来源标注")

    # 检查预测段落限制词
    if "前瞻" in text or "展望" in text:
        forecast_section = text[text.find("前瞻"):] if "前瞻" in text else text[text.find("展望"):]
        has_restriction_word = any(word in forecast_section for word in FORECAST_WORDS)
        if not has_restriction_word:
            issues.append("前瞻段落缺少限制词（预计/有望等）")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings
    }

def format_data_card(
    indicator_name: str,
    value: float,
    unit: str,
    statistical_scope: str,
    release_authority: str,
    period: str
) -> dict:
    """格式化数据卡"""
    return {
        "indicator_name": indicator_name,
        "value": value,
        "unit": unit,
        "statistical_scope": statistical_scope,
        "release_authority": release_authority,
        "period": period,
        "formatted_value": f"{value}{unit}"
    }

def format_yoy_mom(current: float, previous: float, scope: str) -> dict:
    """计算同比/环比变化"""
    if previous == 0:
        return {"yoy": None, "mom": None, "error": "基期数据为0"}

    change = ((current - previous) / previous) * 100

    if "同比" in scope:
        return {"yoy": round(change, 2), "mom": None, "scope": scope}
    elif "环比" in scope:
        return {"yoy": None, "mom": round(change, 2), "scope": scope}
    else:
        return {"yoy": None, "mom": round(change, 2), "scope": scope}

def format_article(
    data_card: dict,
    historical_series: list,
    yoy_mom: dict,
    expert_views: list,
    international_comparison: list = None
) -> dict:
    """生成经济数据报道"""
    # 导语
    change_desc = ""
    if yoy_mom.get("yoy"):
        change_desc = f"同比{'增长' if yoy_mom['yoy'] > 0 else '下降'}{abs(yoy_mom['yoy'])}个百分点"
    elif yoy_mom.get("mom"):
        change_desc = f"环比{'增长' if yoy_mom['mom'] > 0 else '下降'}{abs(yoy_mom['mom'])}%"

    lead = f"{data_card['indicator_name}发布，{data_card['value']}{data_card['unit']}，{change_desc}。"

    # 数据呈现
    if historical_series:
        values = [p.get('value') for p in historical_series if p.get('value')]
        if values:
            avg = sum(values) / len(values)
            max_val = max(values)
            min_val = min(values)
            position = "高于" if data_card['value'] > avg else "低于"
            data_presentation = f"当期数据{position}近{len(values)}期平均水平（{round(avg, 2)}{data_card['unit']}）"
    else:
        data_presentation = f"当期数据为{data_card['value']}{data_card['unit']}"

    # 专家解读
    expert_section = []
    for view in expert_views[:3]:
        stance_icon = {"bullish": "📈", "bearish": "📉", "neutral": "➖"}.get(view.get("stance", "neutral"), "")
        expert_section.append(f"{stance_icon} {view.get('institution', '专家')}：{view.get('view', '')}")

    # 前瞻
    outlook = f"展望未来，{data_card['release_authority']}等机构预计，下阶段{data_card['indicator_name']}有望继续保持稳定态势。"

    article = f"""**{data_card['indicator_name']}数据解读**

{lead}

**数据解读**
{data_presentation}

**各方观点**
{'。'.join(expert_section)}

**前瞻**
{outlook}

*数据来源：{data_card['release_authority']} | 口径：{data_card['statistical_scope']}*
*{data_card['metadata']['disclaimer'] if 'metadata' in data_card else '以上内容经AI辅助整理，仅供参考。'}*"""

    return {
        "headline": f"{data_card['indicator_name']}出炉：{data_card['value']}{data_card['unit']}",
        "subtitle": lead,
        "content": article,
        "expert_views_count": len(expert_views),
        "has_international": international_comparison is not None and len(international_comparison) > 0
    }

# 数据报道提示词
DATA_REPORT_PROMPT = """
你是财经记者。根据以下经济数据生成报道稿。

数据卡：{data_card}
历史序列：{historical_series}（近12期）
同比/环比：{yoy_mom}
国际对比：{international_comparison}（注意口径标注）
专家解读：{expert_views}

报道结构（严格按此顺序）：
1. 导语：数据核心信息 + 与上期对比（1-2句）
2. 数据呈现：当期数值 + 历史位置（近年最高/最低/平均水平）
3. 国际横向（仅口径一致时）
4. 专家解读（至少呈现2种不同观点）
5. 前瞻（必须标注机构来源，使用"预计""有望"等限制词）

禁止词：肯定、必然、将会（前瞻段落）
禁止：以AI名义直接预测经济走势
"""

# 历史数据检索提示词
HISTORICAL_SEARCH_PROMPT = """
请检索 {indicator_name} 近12期的历史数据。

要求：
- 尽量获取完整的同比/环比数据
- 标注每期的特殊情况（如春节因素、基数效应等）
- 注明数据来源和发布时间
"""

# 国际对比提示词
INTERNATIONAL_COMPARE_PROMPT = """
请检索以下经济指标的国际对比数据：

指标：{indicator_name}
当期数值：{value} {unit}
中国时期：{period}

注意：
- 仅在统计口径一致时进行对比
- 如口径不同，注明"口径差异，仅供参考"
- 标注各国数据的发布时间
"""

# 专家观点检索提示词
EXPERT_VIEWS_SEARCH_PROMPT = """
请检索权威机构和专家对以下经济数据的最新解读：

指标：{indicator_name}
最新值：{value} {unit}
时期：{period}

要求：
- 涵盖至少3个不同立场的观点（乐观/中性/谨慎）
- 注明专家/机构的背景
- 标注利益冲突（如：某机构与政策有利益关系）
"""

# 数字核查提示词
NUMBER_CHECK_PROMPT = """
请核查以下报道中的数字使用是否准确：

{article_content}

核查要点：
1. 每个数字与原始数据是否一致
2. 百分比变化计算是否正确
3. "增长""下滑""创新高"等表述是否有数字依据
4. 引用数据是否标注来源
"""
