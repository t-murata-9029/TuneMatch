import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Gemini に渡す内容
    const result = await model.generateContent(`レビュー内容: ${prompt}`);
    const text = result.response.text();

    return Response.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return Response.json({ text: 'エラーが発生しました。' }, { status: 500 });
  }
}
