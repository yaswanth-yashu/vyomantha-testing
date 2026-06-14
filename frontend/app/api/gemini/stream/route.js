import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { cacheGet, cacheSet, makeCacheKey } from '@/lib/cache';
import { getRotatedKey } from '@/lib/keys';

export async function POST(request) {
  const { system, user, maxOutputTokens } = await request.json();
  const apiKey = getRotatedKey();

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured on the server.' }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: 'User message is required.' }, { status: 400 });
  }

  const cacheKey = makeCacheKey('stream', system, user, maxOutputTokens);
  const cached = cacheGet(cacheKey);
  if (cached) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(cached));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  }

  try {
    const provider = createGoogleGenerativeAI({ apiKey });
    const model = provider.languageModel('gemini-2.5-flash');

    const result = streamText({
      model,
      system,
      prompt: user,
      temperature: 0.4,
      maxTokens: maxOutputTokens || 8192,
      onFinish({ text }) {
        if (text) cacheSet(cacheKey, text);
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`[Error: ${e.message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
