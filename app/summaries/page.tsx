"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";

export default function SummariesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [summaries, setSummaries] = useState<
    { id: string; title: string }[]
  >([]);
  const [filteredSummaries, setFilteredSummaries] = useState<
    { id: string; title: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fetchSummaries");
      if (!res.ok) {
        throw new Error("Failed to fetch summaries");
      }
      const { summaries } = await res.json();
      setSummaries(summaries);
      setFilteredSummaries(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summaries when session changes
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchSummaries();
    }
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [session, status, router]);

  // Filter summaries based on search term
  useEffect(() => {
    const filtered = summaries.filter((summary) =>
      summary.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSummaries(filtered);
  }, [searchTerm, summaries]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Your Summaries</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search summaries by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Summaries List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              All Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading summaries...</p>
            ) : filteredSummaries.length > 0 ? (
              <ul className="space-y-4">
                {filteredSummaries.map((summary) => (
                  <motion.li
                    key={summary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={`/summaries/${summary.id}`}
                      className="text-blue-600 hover:underline font-medium text-lg"
                    >
                      {summary.title}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">
                {searchTerm
                  ? "No summaries match your search."
                  : "No summaries found."}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}