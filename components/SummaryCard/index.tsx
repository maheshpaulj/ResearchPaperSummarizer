// components/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SummaryCardProps {
  title: string;
  content: string; // Raw markdown string containing JSON
  fileUrl: string;
}

export function SummaryCard({ title, content, fileUrl }: SummaryCardProps) {
  // Extract JSON from markdown
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch || !jsonMatch[1]) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-600">Invalid summary format</p>
        </CardContent>
      </Card>
    );
  }
  const parsedContent = JSON.parse(jsonMatch[1]);

  return (
    <div
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {parsedContent.title || title} {/* Fallback to prop title if needed */}
          </CardTitle>
          {parsedContent.authors && (
            <div className="flex flex-wrap gap-2 mt-2">
              {parsedContent.authors.map((author: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {author}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Abstract */}
          {parsedContent.abstract && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Abstract
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.abstract}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Introduction */}
          {parsedContent.introduction && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Introduction
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.introduction}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Model */}
          {parsedContent.model && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Model
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.model}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Experiments */}
          {parsedContent.experiments && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Experiments
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.experiments}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Results */}
          {parsedContent.results && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Results
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.results}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Conclusion */}
          {parsedContent.conclusion && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Conclusion
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parsedContent.conclusion}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* PDF Link */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
          >
            View Original PDF
          </a>
        </CardContent>
      </Card>
    </div>
  );
}