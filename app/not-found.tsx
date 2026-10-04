import Link from "next/link";

export default function NotFound() {
  return (
    <div className="narrow">
      <h1>Not found</h1>
      <p>There is nothing at this address. It may have been removed, or the link may be wrong.</p>
      <p>
        <Link href="/library">Browse the library</Link> or go <Link href="/">home</Link>.
      </p>
    </div>
  );
}
