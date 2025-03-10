// app/api/fetchSummaries/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  console.log("Received GET request to /api/fetchSummaries");

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
  }
  console.log("User ID:", userId);

  try {
    const summaries = await prisma.summary.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        fileUrl: true,
        createdAt: true, // Optional: include creation date
      },
      orderBy: { createdAt: "desc" }, // Newest first
    });

    console.log("Fetched summaries:", summaries.length);
    await prisma.$disconnect();

    return NextResponse.json({ summaries }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/fetchSummaries:", error);
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 });
  }
}