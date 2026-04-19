"""
政治新闻报道技能 - pol_05
记者招待会/媒体发布会转录分析与报道生成
"""

POL_05_METADATA = {
    "id": "pol_05",
    "name": "记者会转录分析",
    "category": "politics",
    "description": "记者招待会转录、发言人识别、争议问答标注、生成结构化报道",
    "icon": "Mic",
    "color": "#DC2626",
    "input_schema": {
        "media_file": "bytes (音频或视频文件)",
        "institution": "str (发布机构名称)",
        "date": "str (日期)",
        "known_speakers": "list (可选[{name, title}])"
    }
}

INPUT_SCHEMA = {
    "media_file": bytes,
    "institution": str,
    "date": str,
    "known_speakers": list  # [{name, title}]
}

OUTPUT_SCHEMA = {
    "full_transcript": str,       # 带时间戳全文
    "structured_segments": dict,  # {opening, qa_pairs, closing}
    "controversy_items": list,    # 争议问答清单
    "key_points": list,          # [{point, timestamp, quote_excerpt}]
    "article": dict              # 新闻稿
}

# 发布会结构模板
PRESS_CONFERENCE_TEMPLATE = {
    "header": {
        "title": "",            # 发布会标题
        "institution": "",      # 主办机构
        "date": "",             # 日期时间
        "location": "",         # 地点
        "duration": "",         # 时长
    },
    "opening": {
        "speaker": "",          # 主发言人
        "title": "",            # 职务
        "statement": "",        # 开场声明
        "timestamp": "",         # 时间戳
    },
    "qa_pairs": [],             # 问答对 [{questioner_org, question, answer, timestamp}]
    "closing": {
        "speaker": "",
        "statement": "",
        "timestamp": "",
    }
}

# 争议类型定义
CONTROVERSY_TYPES = {
    "repeated_question": {
        "name": "追问重复",
        "description": "同一问题被多家媒体追问",
        "severity": "high"
    },
    "evasion": {
        "name": "问题回避",
        "description": "发言人明显回避或转移话题",
        "severity": "high"
    },
    "data_discrepancy": {
        "name": "数据出入",
        "description": "答案中的数据与已知信息有出入",
        "severity": "medium"
    },
    "ambiguous": {
        "name": "表述模糊",
        "description": "存在歧义或语焉不详的表述",
        "severity": "low"
    }
}

# 发言人占位符
SPEAKER_PLACEHOLDERS = ["SPEAKER_A", "SPEAKER_B", "SPEAKER_C", "SPEAKER_D"]

# 时间戳格式
TIMESTAMP_PATTERN = r"\[?\d{1,2}:\d{2}(?::\d{2})?\]?"

# 转录格式模板
TRANSCRIPT_TEMPLATE = """[{timestamp}] {speaker}: {content}"""

# 要点摘要模板
KEY_POINT_TEMPLATE = """【{index}】{point}
⏱ {timestamp}
📌 引用："{quote_excerpt}"
"""

# 争议标注模板
CONTROVERSY_TEMPLATE = """⚠️ 【争议标注】{type}
- 时间：{timestamp}
- 原文："{original_text}"
- 分析：{analysis}
"""

def format_transcript(raw_text: str, known_speakers: list = None) -> str:
    """格式化转录文本"""
    if not known_speakers:
        return raw_text

    # 替换占位符为真实姓名
    speaker_map = {}
    for i, speaker in enumerate(known_speakers[:4]):
        placeholder = f"SPEAKER_{chr(65 + i)}"
        speaker_map[placeholder] = f"{speaker.get('name', '未知')}（{speaker.get('title', '')}）"

    formatted = raw_text
    for placeholder, name in speaker_map.items():
        formatted = formatted.replace(placeholder, name)

    return formatted

def extract_key_points(transcript: str, max_points: int = 8) -> list:
    """从转录中提取核心信息点"""
    # 简单实现：按长度分段取摘要
    # 实际使用LLM进行语义提取
    points = []
    segments = transcript.split('\n')

    for i, seg in enumerate(segments[:max_points]):
        if seg.strip() and len(seg) > 10:
            # 提取时间戳
            import re
            timestamp_match = re.search(TIMESTAMP_PATTERN, seg)
            timestamp = timestamp_match.group(0) if timestamp_match else f"{i+1}"

            # 提取引文（引号内内容）
            quote_match = re.search(r'"([^"]+)"', seg)
            quote = quote_match.group(1)[:100] if quote_match else seg[:100]

            points.append({
                "index": i + 1,
                "point": seg[:150].strip(),
                "timestamp": timestamp,
                "quote_excerpt": quote
            })

    return points

def identify_controversy(qa_pairs: list) -> list:
    """识别争议性问答"""
    controversies = []

    # 检测重复问题
    questions = {}
    for i, qa in enumerate(qa_pairs):
        q = qa.get('question', '')[:50]
        if q in questions:
            controversies.append({
                "type": "repeated_question",
                "type_name": CONTROVERSY_TYPES["repeated_question"]["name"],
                "timestamp": qa.get('timestamp', ''),
                "original_text": q,
                "analysis": f"该问题已被{questions[q]}号媒体追问"
            })
        else:
            questions[q] = i

    # 检测回避模式
    evasive_phrases = ["这个问题很好", "我来回答一下", "具体情况", "多方面因素", "需要进一步研究"]
    for qa in qa_pairs:
        if any(phrase in qa.get('answer', '') for phrase in evasive_phrases):
            if len(qa.get('answer', '')) < 50:
                controversies.append({
                    "type": "evasion",
                    "type_name": CONTROVERSY_TYPES["evasion"]["name"],
                    "timestamp": qa.get('timestamp', ''),
                    "original_text": qa.get('answer', ''),
                    "analysis": "回答简短，可能存在回避"
                })

    return controversies

def segment_press_conference(transcript: str) -> dict:
    """将发布会转录分段"""
    segments = {
        "opening": None,
        "qa_pairs": [],
        "closing": None
    }

    lines = transcript.split('\n')
    current_section = "opening"

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 检测问答开始（通常包含问号）
        if '?' in line or '？' in line or '提问' in line:
            current_section = "qa"
        # 检测结束语
        elif '谢谢' in line or '发布会' in line and '结束' in line:
            current_section = "closing"

        if current_section == "opening":
            if segments["opening"]:
                segments["opening"] += "\n" + line
            else:
                segments["opening"] = line
        elif current_section == "qa":
            segments["qa_pairs"].append({
                "raw": line,
                "timestamp": "",
                "question": line if '?' in line else "",
                "answer": ""
            })
        else:
            if segments["closing"]:
                segments["closing"] += "\n" + line
            else:
                segments["closing"] = line

    return segments

def format_article(
    key_points: list,
    controversy_items: list,
    institution: str,
    date: str
) -> dict:
    """生成发布会报道稿"""
    # 要点串联
    content_parts = []
    for point in key_points[:5]:
        content_parts.append(f"{point['point']}")

    # 争议问答（作为延伸阅读）
    controversy_section = ""
    if controversy_items:
        controversy_section = "\n\n【延伸阅读·争议问答】\n"
        for item in controversy_items[:3]:
            controversy_section += f"• {item['type_name']}：{item['analysis']}\n"

    article = f"""**{institution}发布会要点速览**（{date}）

{' '.join(content_parts)}

{controversy_section}

*AI辅助生成，内容经人工整理，请以官方发布为准。*"""

    return {
        "headline": f"{institution}发布会要点速览",
        "subtitle": f"{date}，{' '.join([p['point'][:30] for p in key_points[:3]])}",
        "content": article,
        "key_points_count": len(key_points),
        "controversy_count": len(controversy_items)
    }

# 转录提示词
ASR_TRANSCRIBE_PROMPT = """
请将提供的音频/视频文件转录为文字。
要求：
1. 保留时间戳（格式：[分:秒]）
2. 发言人标注为 SPEAKER_A, SPEAKER_B, SPEAKER_C...
3. 完整转录，不省略内容
4. 标注语气词和停顿（如 [停顿]、[笑声]）
"""

SPEAKER_REPLACE_PROMPT = """
根据以下机构信息和上下文，替换转录中的发言人占位符：

机构：{institution}
已知发言人：{known_speakers}
转录内容：{transcript}

规则：
- 优先根据机构官网信息确认发言人身份
- 根据上下文对话逻辑判断
- 无法确认者保留占位符，绝不猜测
"""

STRUCTURE_SEGMENT_PROMPT = """
将以下记者会转录按结构分段：

转录内容：{transcript}

输出JSON格式：
{{
  "opening": {{"speaker": "", "statement": "", "timestamp": ""}},
  "qa_pairs": [{{"questioner_org": "", "question": "", "answer": "", "timestamp": ""}}],
  "closing": {{"speaker": "", "statement": "", "timestamp": ""}}
}}
"""

CONTROVERSY_IDENTIFY_PROMPT = """
识别以下记者会转录中的争议性问答：

转录内容：{transcript}

需识别的争议类型：
1. repeated_question：同一问题被多家媒体追问
2. evasion：发言人明显回避或转移的问题
3. data_discrepancy：答案中的数据与已知信息有出入
4. ambiguous：存在歧义或语焉不详的表述

输出JSON格式的争议列表。
"""

KEY_POINTS_EXTRACT_PROMPT = """
从以下记者会转录中提炼5-8个核心信息点：

转录内容：{transcript}

要求：
- 每点≤50字
- 必须附对应时间戳
- 选择最有新闻价值的内容
- 包含直接引语（引号内内容）
"""

ARTICLE_GENERATE_PROMPT = """
根据以下材料生成记者会报道稿：

核心信息点：{key_points}
争议问答：{controversy_items}
发布机构：{institution}
日期：{date}

报道结构：
1. 导语（50字以内，核心要点）
2. 要点串联（用自然语言串联各信息点）
3. 延伸阅读（争议问答作为附注）

规范：
- 引用需注明发言人
- 末尾附注："以上内容经AI辅助整理，请以官方发布为准"
"""
