import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
  }
  console.log("User ID:", userId);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const blob = await put(`summaries/${userId}/${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ message: "File uploaded", fileUrl: blob.url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}