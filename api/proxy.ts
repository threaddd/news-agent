/**
 * Vercel Serverless Function - OpenAI 兼容 API 代理
 */

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, baseUrl, model, messages, stream } = body;

    // 获取 API 配置
    const key = apiKey || process.env.OPENAI_API_KEY;
    const base = baseUrl || process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';

    if (!key) {
      return jsonResponse({ error: 'API Key 未配置' }, 401);
    }

    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        stream: stream ?? true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return jsonResponse({
        error: errorData.error?.message || `API 请求失败: ${response.status}`
      }, response.status);
    }

    // 流式响应
    if (stream) {
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (e) {
            // 忽略错误
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // 非流式响应
    const data = await response.json();
    return jsonResponse(data);

  } catch (error: any) {
    console.error('Proxy error:', error);
    return jsonResponse({
      error: `服务器错误: ${error.message || '未知错误'}`
    }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
