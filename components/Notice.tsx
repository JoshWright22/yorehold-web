import type { Failure } from "@/lib/server";

// Shown in place of anything that needed the game server and didn't get an answer.
export function FailureNotice({ failure, what }: { failure: Failure; what: string }) {
  if (failure.offline) {
    return (
      <p className="notice offline" role="status">
        <strong>Offline.</strong> The game server can&apos;t be reached right now, so {what} can&apos;t be shown. Try again
        in a little while.
      </p>
    );
  }
  return (
    <p className="notice error" role="status">
      <strong>Couldn&apos;t load {what}.</strong> {failure.message}
    </p>
  );
}
