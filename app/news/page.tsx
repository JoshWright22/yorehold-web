import type { Metadata } from "next";
import { NewsList, PageHead } from "@/components/ui";
import { news } from "@/lib/news";

export const metadata: Metadata = { title: "News" };

// Every post from lib/news.ts; the front page shows only the newest few.
export default function News() {
  return (
    <>
      <PageHead title="News" kicker="Home" />
      <div className="news-page">
        <NewsList items={news} empty="No news yet." />
      </div>
    </>
  );
}
