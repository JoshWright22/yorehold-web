import type { Metadata } from "next";
import { loadDocs } from "@/lib/docs";

export const metadata: Metadata = { title: "Docs" };

// Built once, from the files in the sibling repos at build time.
export const dynamic = "force-static";

export default async function Docs() {
  const docs = await loadDocs();

  if (docs.length === 0) {
    return (
      <>
        <h1>Docs</h1>
        <p className="notice">The format docs weren&apos;t there when this site was built.</p>
      </>
    );
  }

  return (
    <>
      <h1>Docs</h1>
      <p className="muted">How content files are written. These are the same documents that ship with the game.</p>
      <nav aria-label="Documents">
        <ul className="tags">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <a href={"#" + doc.slug}>{doc.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      {docs.map((doc) => (
        <section key={doc.slug} id={doc.slug} className="doc">
          <p className="meta">
            <span>{doc.source}</span>
          </p>
          {/* The text comes from this project's own repos at build time, not from visitors. */}
          <div className="markdown" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </section>
      ))}
    </>
  );
}
