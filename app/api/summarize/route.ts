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
            content: `You are an expert research paper summarizer. 
            - Full markdown (#, ##, **bold**, *italic*)
            - Return content in the exact JSON format requested.`,
          },
          { role: "user", content: pdfText },
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
    console.log("Summary content:", summaryContent);

    // Step 4: Save to Neon Postgres
    console.log("Saving to Neon Postgres...");
    const prisma = new PrismaClient();
    const title = fileUrl.split("/").pop()?.replace(/\.pdf$/, "") || "Untitled";
    const summary = await prisma.summary.create({
      data: {
        userId,
        title,
        content: summaryContent,
        fileUrl,
      },
    });
    console.log("Saved summary ID:", summary.id);

    return NextResponse.json({ message: "File summarized", summary }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/summarize:", error);
    return NextResponse.json({ error: "Failed to summarize file" }, { status: 500 });
  }
}