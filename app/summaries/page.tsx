"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Search, Calendar, ArrowUpDown } from "lucide-react";

interface Summary {
  id: string;
  title: string;
  createdAt: string; // ISO date string
}

export default function SummariesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch summaries from API
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fetchSummaries");
      if (!res.ok) throw new Error("Failed to fetch summaries");
      const { summaries } = await res.json();
      setSummaries(summaries);
      setFilteredSummaries(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summaries on session change
  useEffect(() => {
    if (status === "authenticated" && session) fetchSummaries();
    if (status === "unauthenticated") router.push("/signin");
  }, [session, status, router]);

  // Filter and sort summaries
  useEffect(() => {
    let result = [...summaries];

    // Filter by search term
    if (searchTerm) {
      result = result.filter((summary) =>
        summary.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by createdAt
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredSummaries(result);
  }, [searchTerm, summaries, sortOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6 pt-28">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-800 underline">Your Summaries</h1>
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search summaries by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </Button>
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
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <Link
                      href={`/summaries/${summary.id}`}
                      className="block hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-blue-600 hover:underline">
                            {summary.title}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(summary.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
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