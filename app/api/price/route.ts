// OpenAI 호출
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { grade, name, year, set, currency } = body;

    const prompt = `
Estimate the market price of the following Pokémon card.
Return ONLY a JSON object.

Grade: ${grade}
Card Name: ${name}
Year: ${year}
Set: ${set}
Currency: ${currency}

Format:
{
  "price": number,
  "currency": string,
  "confidence": "low" | "medium" | "high",
  "reason": string
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text =
      response.output_text ||
      response.output[0]?.content[0]?.text;

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error("PRICE API ERROR:", err);
    return NextResponse.json(
      { error: "OpenAI 호출 실패" },
      { status: 500 }
    );
  }
}
