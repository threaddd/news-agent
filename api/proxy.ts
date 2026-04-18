/**
 * Vercel Serverless Function - CodeBuddy API 代理
 * 处理前端到 CodeBuddy API 的请求，解决 CORS 问题
 */

// 简单的 JSON 响应助手
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
    const { prompt, model, systemPrompt, stream, permissionMode } = body;

    // 获取 API Key
    const apiKey = process.env.CODEBUDDY_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'API Key 未配置' }, 401);
    }

    // 获取 API 基础地址
    const apiBaseUrl = process.env.CODEBUDDY_API_BASE_URL || 'https://api.codebuddy.ai/v1';

    // 调用 CodeBuddy API
    const response = await fetch(`${apiBaseUrl}/agents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        systemPrompt,
        stream: stream ?? true,
        permissionMode: permissionMode || 'default',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return jsonResponse({ 
        error: errorData.message || `API 请求失败: ${response.status}` 
      }, response.status);
    }

    // 如果是流式响应
    if (stream) {
      // 对于流式响应，我们使用 ReadableStream 转发
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

// 处理 OPTIONS 请求（CORS 预检）
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
