/**
 * Vercel Serverless Function - 多 AI 提供商代理
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

const PROVIDERS: Record<string, { baseUrl: string; envKey: string }> = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    envKey: 'GROQ_API_KEY',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    envKey: 'OPENROUTER_API_KEY',
  },
  together: {
    baseUrl: 'https://api.together.xyz/v1',
    envKey: 'TOGETHER_API_KEY',
  },
  fireworks: {
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    envKey: 'FIREWORKS_API_KEY',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    envKey: 'DEEPSEEK_API_KEY',
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, model, messages, stream } = body;

    if (!provider || !model || !messages) {
      return jsonResponse({ error: '缺少必要参数' }, 400);
    }

    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return jsonResponse({ error: `未知的提供商: ${provider}` }, 400);
    }

    const apiKey = process.env[providerConfig.envKey];
    if (!apiKey) {
      return jsonResponse({ error: `${provider} API Key 未配置` }, 401);
    }

    const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
