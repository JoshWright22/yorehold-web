import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { loadDocs } from "@/lib/docs";

export const metadata: Metadata = { title: "Docs" };

// Built once, from the files in the sibling repos at build time.
export const dynamic = "force-static";

export default async function Docs() {
  const docs = await loadDocs();

  if (docs.length === 0) {
    return (
      <>
        <PageHead title="Docs" kicker="For writers" />
        <p className="notice">The format docs weren&apos;t there when this site was built.</p>
      </>
    );
  }

  return (
    <>
      <PageHead title="Docs" kicker="For writers">
        <p className="muted">How content files are written. These are the same documents that ship with the game.</p>
      </PageHead>
      <div className="docs-layout">
        <nav className="docs-nav" aria-label="Documents">
          <h2>Documents</h2>
          <ul>
            {docs.map((doc) => (
              <li key={doc.slug}>
                <a href={"#" + doc.slug}>{doc.title}</a>
                <span className="docs-source">{doc.source}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="docs-body">
          {docs.map((doc) => (
            <section key={doc.slug} id={doc.slug} className="doc">
              <p className="kicker">{doc.source}</p>
              {/* The text comes from this project's own repos at build time, not from visitors. */}
              <div className="markdown" dangerouslySetInnerHTML={{ __html: doc.html }} />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
