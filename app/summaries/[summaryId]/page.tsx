// app/summaries/[summaryId]/page.tsx
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SummaryPageProps {
  params: { summaryId: string };
}

const prisma = new PrismaClient();

async function getSummary(summaryId: string) {
  const summary = await prisma.summary.findUnique({
    where: { id: summaryId },
  });
  await prisma.$disconnect();
  return summary;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const summary = await getSummary(params.summaryId);

  if (!summary) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/summaries">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Summaries
          </Button>
        </Link>

        {/* Use SummaryCard */}
        <SummaryCard
          title={summary.title}
          content={summary.content}
          fileUrl={summary.fileUrl}
        />
      </div>
    </div>
  );
}

export const revalidate = 0; // Disable caching for dynamic data