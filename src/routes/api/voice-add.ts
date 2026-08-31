import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const STT_MODEL = "openai/gpt-4o-mini-transcribe";
const CHAT_MODEL = "google/gemini-3.7-flash";

interface Parsed {
  name?: string | undefined;
  expiryDate?: string | null | undefined;
  category?: string | undefined;
  note?: string | undefined;
}

export const Route = createFileRoute("/api/voice-add")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "AI key not configured" }, { status: 500 });
        }

        const buf = await request.arrayBuffer();
        if (buf.byteLength < 1024) {
          return Response.json({ error: "录音为空，请重试" }, { status: 400 });
        }
        if (buf.byteLength > 25 * 1024 * 1024) {
          return Response.json({ error: "录音过长" }, { status: 413 });
        }

        // 1. Speech-to-text
        const fd = new FormData();
        fd.append("model", STT_MODEL);
        fd.append("file", new Blob([buf], { type: "audio/wav" }), "recording.wav");
        fd.append("language", "zh");

        const trRes = await fetch(`${GATEWAY}/audio/transcriptions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: fd,
        });
        if (!trRes.ok) {
          const detail = await trRes.text().catch(() => "");
          return Response.json(
            { error: `转写失败 (${trRes.status})`, detail },
            { status: 502 },
          );
        }
        const trJson = (await trRes.json()) as { text?: string };
        const transcript = (trJson.text ?? "").trim();
        if (!transcript) {
          return Response.json({ error: "没听清，请再说一次" }, { status: 422 });
        }

        // 2. Parse transcript into structured fields via chat completion
        const parsed = await parseTranscript(apiKey, transcript);
        if (!parsed) {
          return Response.json(
            { transcript, name: "", expiryDate: null, category: "other" },
            { status: 200 },
          );
        }
        return Response.json({ transcript, ...parsed });
      },
    },
  },
});

async function parseTranscript(apiKey: string, transcript: string): Promise<Parsed | null> {
  const system =
    "你是一个保质期记录助手。用户用中文口语描述一件物品及其过期时间。请把转写文本解析为结构化 JSON。" +
    "字段：name(物品名，简洁，不带\"过期\"等修饰)，expiryDate(YYYY-MM-DD，根据\"X月X号/日\"、\"明天/后天/今天\"等推断，跨年则用下一个该月份的年份)，" +
    "category(只能是 food/medicine/daily/other 之一，食品=food 药品=medicine 日化清洁护肤=daily 其他=other)，note(可选备注)。" +
    "只输出 JSON，不要解释，不要 markdown 代码块。";
  const userMsg = `转写文本：${transcript}`;

  try {
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const json = extractJson(content);
    const parsed = z
      .object({
        name: z.string().optional(),
        expiryDate: z.string().nullable().optional(),
        category: z.string().optional(),
        note: z.string().optional(),
      })
      .parse(json);
    return parsed;
  } catch {
    return null;
  }
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
