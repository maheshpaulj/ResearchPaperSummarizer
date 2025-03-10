"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<{
    title: string;
    content: string;
    fileUrl: string;
  } | null>(null);

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === "unauthenticated" || !session) {
    router.push("/signin");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("File selected:", e.target.files[0].name);
      setFile(e.target.files[0]);
      setCurrentSummary(null);
    }
  };

  const handleUploadAndSummarize = async () => {
    if (!file) return;

    setUploading(true);
    console.log("Starting upload for file:", file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload to /api/upload
      console.log("Sending POST request to /api/upload");
      const uploadRes = await fetch("http://localhost:6600/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", uploadRes.status);
      const uploadText = await uploadRes.text();
      console.log("Upload response:", uploadText);

      if (!uploadRes.ok) {
        console.error("Upload failed with status:", uploadRes.status, "Response:", uploadText);
        return;
      }

      const { fileUrl } = JSON.parse(uploadText);
      console.log("Uploaded file URL:", fileUrl);

      // Step 2: Summarize using /api/summarize
      console.log("Sending POST request to /api/summarize");
      const summarizeRes = await fetch("http://localhost:6600/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      console.log("Summarize response status:", summarizeRes.status);
      const summarizeText = await summarizeRes.text();
      console.log("Summarize response:", summarizeText);

      if (summarizeRes.ok) {
        const { summary } = JSON.parse(summarizeText);
        console.log("Received summary:", summary);
        setCurrentSummary({
          title: summary.title,
          content: summary.content,
          fileUrl: summary.fileUrl,
        });
        setFile(null);
      } else {
        console.error("Summarize failed with status:", summarizeRes.status, "Response:", summarizeText);
      }
    } catch (error) {
      console.error("Error during upload or summarize:", error);
    } finally {
      setUploading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex justify-start items-center">
          <h1 className="text-3xl font-bold text-gray-800">Upload Research Paper</h1>
        </div>

        <div className="flex gap-4">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1"
            disabled={uploading}
          />
          <Button
            onClick={handleUploadAndSummarize}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? "Processing..." : "Upload & Summarize"}
          </Button>
        </div>

        {currentSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{currentSummary.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{currentSummary.content}</p>
                <a
                  href={currentSummary.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}