import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, name } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Optional: Verify the userId matches the session (security check)
  if (session.user.id && userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return NextResponse.json({ message: "Name updated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update name" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Optional: Verify the userId matches the session (security check)
  if (session.user.id && userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ message: "Account deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}