"""
政治新闻报道技能 - pol_04
时效性最高的突发新闻快报技能，目标：3分钟内生成首发快报
"""

POL_04_METADATA = {
    "id": "pol_04",
    "name": "突发新闻快报",
    "category": "politics",
    "description": "时效性最高的突发新闻快报生成，3分钟内完成首发",
    "icon": "Zap",
    "color": "#DC2626",
    "input_schema": {
        "event_description": "str",
        "known_sources": "list",        # [{content, source_name, source_type}]
        "urgency": "breaking | urgent | normal"
    }
}

INPUT_SCHEMA = {
    "event_description": str,
    "known_sources": list,        # [{content, source_name, source_type}]
    "urgency": "breaking | urgent | normal"
}

OUTPUT_SCHEMA = {
    "source_rating": list,        # [{source, credibility_level, reason}]
    "verified_facts": list,       # 已确认事实列表
    "unverified_items": list,     # 待核实内容列表
    "breaking_report": str,       # ≤200字首发快报
    "rolling_updates": list,      # 滚动更新列表（带时间戳）
    "deep_report": str            # 深度背景稿（事件稳定后生成）
}

# 信源等级定义
SOURCE_LEVELS = {
    "A": {
        "name": "官方/权威",
        "sources": ["新华社", "人民日报", "央视新闻", "政府官网", "外交部", "官方声明", "路透社", "AP", "BBC", "法新社"],
        "description": "可直接引用"
    },
    "B": {
        "name": "主流媒体",
        "sources": ["澎湃新闻", "财新", "凤凰网", "网易新闻", "新浪新闻", "腾讯新闻"],
        "description": "可引用但需标注"
    },
    "C": {
        "name": "社交/匿名",
        "sources": ["微博", "推特", "微信", "朋友圈", "匿名", "网传", "知情人士"],
        "description": "快报中禁止使用"
    }
}

# 禁止词汇
FORBIDDEN_WORDS = [
    "据悉", "显然", "必然", "预计", "估计", "可能（无依据时）",
    "业内人士", "知情人士透露", "消息人士称"
]

# 快讯模板
BREAKING_TEMPLATE = """【快讯】{location} {event}（北京时间 {timestamp}）

{content}

「事态持续发展，本报将滚动更新。信息截止：{timestamp}」"""

# 滚动更新模板
ROLLING_UPDATE_TEMPLATE = """【{timestamp} 更新】{update_content}
来源：{source}"""

def rate_source(source_name: str, source_type: str = "unknown") -> dict:
    """对单一信源进行评级"""
    source_upper = source_name.upper()
    
    for level, info in SOURCE_LEVELS.items():
        for trusted_source in info["sources"]:
            if trusted_source.upper() in source_upper or source_upper in trusted_source.upper():
                return {
                    "source": source_name,
                    "level": level,
                    "reason": f"匹配{info['name']}来源：{trusted_source}"
                }
    
    # 基于信源类型判断
    if source_type in ["official", "government", "press"]:
        return {"source": source_name, "level": "A", "reason": "官方/政府信源"}
    elif source_type in ["social", "personal", "unknown"]:
        return {"source": source_name, "level": "C", "reason": "社交媒体/匿名信源"}
    
    return {"source": source_name, "level": "B", "reason": "主流媒体信源"}

def verify_facts(sources: list) -> dict:
    """核实事实并分级"""
    verified = []
    unverified = []
    
    for source in sources:
        rating = rate_source(source.get("source_name", ""), source.get("source_type", "unknown"))
        fact = {
            "content": source.get("content", ""),
            "source": source.get("source_name", ""),
            "rating": rating["level"]
        }
        
        if rating["level"] in ["A", "B"]:
            verified.append(fact)
        else:
            unverified.append(fact)
    
    return {
        "verified_facts": verified,
        "unverified_items": unverified
    }

def generate_timestamp() -> str:
    """生成北京时间戳"""
    from datetime import datetime
    import pytz
    
    beijing_tz = pytz.timezone('Asia/Shanghai')
    now = datetime.now(beijing_tz)
    return now.strftime("%Y年%m月%d日 %H:%M")

def check_forbidden_words(text: str) -> list:
    """检查禁止词汇"""
    found = []
    for word in FORBIDDEN_WORDS:
        if word in text:
            found.append(word)
    return found

def validate_breaking_report(report: str) -> dict:
    """验证快报文稿"""
    issues = []
    warnings = []
    
    # 字数检查
    word_count = len(report.replace("【快讯】", "").replace("「", "").replace("」", ""))
    if word_count > 200:
        issues.append(f"字数超限：{word_count}字（限制200字）")
    
    # 禁止词汇检查
    forbidden_found = check_forbidden_words(report)
    if forbidden_found:
        issues.append(f"使用了禁止词汇：{', '.join(forbidden_found)}")
    
    # 必须包含元素检查
    if "【快讯】" not in report:
        issues.append("缺少【快讯】标记")
    if "信息截止" not in report:
        issues.append("缺少信息截止时间标注")
    if "北京时间" not in report:
        warnings.append("建议添加北京时间标注")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "word_count": word_count
    }

def format_breaking_report(
    event: str,
    location: str = "",
    verified_facts: list = None,
    timestamp: str = None
) -> str:
    """格式化首发快报"""
    if timestamp is None:
        timestamp = generate_timestamp()
    
    if not verified_facts:
        verified_facts = []
    
    # 组合内容（只使用A级和B级信源的事实）
    valid_facts = [f["content"] for f in verified_facts if f.get("rating") in ["A", "B"]]
    content = "；".join(valid_facts) if valid_facts else event
    
    report = BREAKING_TEMPLATE.format(
        location=location or "某地",
        event=event[:50],
        content=content[:150],
        timestamp=timestamp
    )
    
    return report

def generate_rolling_update(update: str, source: str, timestamp: str = None) -> str:
    """生成滚动更新"""
    if timestamp is None:
        timestamp = generate_timestamp()
    
    return ROLLING_UPDATE_TEMPLATE.format(
        timestamp=timestamp,
        update_content=update,
        source=source
    )

# 快报告警词检测
ALERT_KEYWORDS = {
    "政治": ["外交", "制裁", "军事", "抗议", "选举", "政权"],
    "经济": ["股市", "汇率", "金融危机", "银行", "破产"],
    "社会": ["疫情", "灾难", "事故", "伤亡", "犯罪"],
    "国际": ["战争", "冲突", "峰会", "谈判", "协议"]
}

def detect_urgency_level(event_description: str) -> str:
    """检测紧急程度"""
    alert_count = 0
    for category, keywords in ALERT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in event_description:
                alert_count += 1
    
    if alert_count >= 3:
        return "breaking"
    elif alert_count >= 1:
        return "urgent"
    else:
        return "normal"
