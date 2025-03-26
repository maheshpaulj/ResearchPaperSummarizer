"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SEPM Project</h1>
        <p className="mb-8 text-lg">AI-Driven Research Paper Summarizer</p>
        <Link 
          href="/signin" 
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </motion.div>
  );
}