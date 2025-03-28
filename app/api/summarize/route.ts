// app/api/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import pdfParse from "pdf-parse";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  console.log("Received POST request to /api/summarize");

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
  }
  console.log("User ID:", userId);

  const { fileUrl } = await req.json();
  if (!fileUrl || typeof fileUrl !== "string") {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }
  console.log("File URL received:", fileUrl);

  try {
    // Step 1: Download PDF from Vercel Blob
    console.log("Downloading PDF from Vercel Blob...");
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log("PDF downloaded, size:", pdfBuffer.length);

    // Step 2: Extract text from the PDF
    console.log("Extracting PDF text...");
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;
    console.log("Extracted text length:", pdfText.length);

    // Step 3: Summarize using OpenRouter
    console.log("Calling OpenRouter API...");
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "AI Research Paper Summarizer",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: [
          {
            role: "system",
            content: "You are an expert research paper summarizer, From the given research paper, summarize each topic and give a brief and mention any important points like dataset used, algorithms used and whatnot. Return a JSON object wrapped in markdown code block (```json). Include fields: title, authors(always as a list []), abstract, introduction, model, experiments, results, conclusion. Use full markdown syntax (#, ##, **bold**, *italic*) within string values.",
          },
          { role: "user", content: `Summarize this research paper:\n\n${pdfText}` },
        ],
        temperature: 0.7,
        max_tokens: 8172,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API failed:", openRouterResponse.status, errorText);
      throw new Error(`OpenRouter API failed: ${openRouterResponse.statusText}`);
    }

    const openRouterData = await openRouterResponse.json();
    const summaryContent = openRouterData.choices[0].message.content;
    console.log("Raw summary content:", summaryContent);

    // Step 4: Extract JSON from markdown
    const jsonMatch = summaryContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) {
      console.error("Failed to extract JSON from markdown:", summaryContent);
      throw new Error("Invalid summary format: JSON not found in markdown");
    }
    const jsonString = jsonMatch[1].trim();
    const parsedSummary = JSON.parse(jsonString);
    console.log("Parsed summary:", parsedSummary);

    // Step 5: Save to Neon Postgres
    console.log("Saving to Neon Postgres...");
    const prisma = new PrismaClient();
    const title = parsedSummary.title; // Use title from OpenRouter response
    const summary = await prisma.summary.create({
      data: {
        userId,
        title,
        content: summaryContent, // Store raw markdown for display
        fileUrl,
      },
    });
    console.log("Saved summary ID:", summary.id);
    await prisma.$disconnect();

    return NextResponse.json({ message: "File summarized", summary }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/summarize:", error);
    return NextResponse.json({ error: "Failed to summarize file" }, { status: 500 });
  }
}