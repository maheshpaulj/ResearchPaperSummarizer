"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { SummaryCard } from "@/components/SummaryCard";
import { UploadIcon, FileIcon } from "lucide-react";

interface Summary {
  title: string;
  content: string;
  fileUrl: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading...
      </div>
    );
  }

  // Redirect unauthenticated users
  if (status === "unauthenticated" || !session) {
    router.push("/signin");
    return null;
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      console.log("File selected:", e.target.files[0].name);
      setFile(e.target.files[0]);
      setCurrentSummary(null);
    }
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => { // eslint-disable-line react-hooks/rules-of-hooks
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      console.log("File dropped:", droppedFile.name);
      setFile(droppedFile);
      setCurrentSummary(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Upload and summarize handler
  const handleUploadAndSummarize = async () => {
    if (!file) return;

    setUploading(true);
    console.log("Starting upload for file:", file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload to /api/upload
      console.log("Sending POST request to /api/upload");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { fileUrl } = await uploadRes.json();
      console.log("Uploaded file URL:", fileUrl);

      // Step 2: Summarize using /api/summarize
      console.log("Sending POST request to /api/summarize");
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!summarizeRes.ok) throw new Error("Summarize failed");
      const { summary } = await summarizeRes.json();
      console.log("Received summary:", summary);

      setCurrentSummary({
        title: summary.title,
        content: summary.content,
        fileUrl: summary.fileUrl,
      });
      setFile(null);
    } catch (error) {
      console.error("Error during upload or summarize:", error);
    } finally {
      setUploading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6 pt-28">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 underline">
          Upload Research Paper
        </h1>

        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <UploadIcon
            className={`w-12 h-12 mb-4 ${
              isDragging ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-gray-600 text-center">
            {isDragging
              ? "Drop your PDF here!"
              : "Drag and drop a PDF file here, or"}
          </p>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-4 w-full max-w-xs bg-white"
            disabled={uploading}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <FileIcon className="w-4 h-4 mr-1" /> {file.name}
            </p>
          )}
          <Button
            onClick={handleUploadAndSummarize}
            disabled={!file || uploading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {uploading ? "Processing..." : "Upload & Summarize"}
          </Button>
        </div>

        {/* Summary Display */}
        {currentSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SummaryCard
              title={currentSummary.title}
              content={currentSummary.content}
              fileUrl={currentSummary.fileUrl}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}