import type { ReactNode } from "react";
import { PageHead } from "./ui";

export interface HelpSection {
  id: string;
  title: string;
  body: ReactNode;
}

// A help page: the heading, a contents list down the side, and the sections as plain text.
export default function HelpPage({ title, kicker, lead, sections }: { title: string; kicker: string; lead: string; sections: HelpSection[] }) {
  return (
    <>
      <PageHead title={title} kicker={kicker}>
        <p>{lead}</p>
      </PageHead>
      <div className="help-layout">
        <nav className="index-toc" aria-label="Contents">
          <p className="index-toc-head">Contents</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={"#" + section.id}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="help-text">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
