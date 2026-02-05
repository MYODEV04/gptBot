// OpenAI 호출
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildSearchQuery(input: {
  grade?: string;
  name?: string;
  year?: string;
  setName?: string;
}) {
  return [
    input.name?.trim(),
    input.setName?.trim(),
    input.year?.trim(),
    input.grade?.trim(),
    "pokemon",
    "card",
    "price",
    "sold",
    "completed",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          ok: false,
          error:
            "OPENAI_API_KEY가 서버에 설정되어 있지 않습니다. (Vercel Environment Variables에 추가 필요)",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { grade, name, year, setName, currency = "JPY" } = body || {};

    if (!grade || !name) {
      return Response.json(
        { ok: false, error: "grade(등급)와 name(카드명)은 필수입니다." },
        { status: 400 }
      );
    }

    const query = buildSearchQuery({ grade, name, year, setName });

    // ⚠️ web_search는 계정/플랜에 따라 비활성일 수 있음.
    // 만약 에러가 나면, "가격 API(eBay 등) → GPT 정리" 방식(B안)으로 바꾸는 게 안정적.
    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      tools: [{ type: "web_search" }],
      input: [
        {
          role: "system",
          content:
            "You are a trading card price research assistant. Prefer SOLD/COMPLETED data and reputable marketplaces. Provide a short price range and evidence bullets. End with one-line 결론 in Korean.",
        },
        {
          role: "user",
          content: `
Card:
- Grade: ${grade}
- Name: ${name}
- Year: ${year || "(unknown)"}
- Set: ${setName || "(unknown)"}

Search query:
${query}

Output:
1) SOLD/COMPLETED 중심
2) 가격 범위(low/typical/high)
3) 근거 5~10개 bullet
4) 마지막 줄: "결론: ..."
Preferred currency: ${currency}
          `.trim(),
        },
      ],
    });

    return Response.json({ ok: true, query, answer: resp.output_text });
  } catch (e: any) {
    return Response.json(
      {
        ok: false,
        error: "OpenAI 호출 실패",
        detail: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
