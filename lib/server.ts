// The one client for the game server (Nakama). Every call answers a Result and never throws, so a
// page can render an "offline" notice when the server is down or not configured.
//
// Server only: it reads the keys from the environment. Do not import it from a client component.

import { sampleOn, sampleRpc, sampleSignIn } from "./sample";

export type ContentKind = "adventure" | "ruleset" | "definitions";
export const contentKinds: ContentKind[] = ["adventure", "ruleset", "definitions"];
// Everyone plays by one set of rules, so the site offers no ruleset tab even though the server
// still knows the kind.
export const shownKinds: ContentKind[] = ["adventure", "definitions"];

// "favourites", "updated" and "lowest" are newer than the server; until it learns them only the
// sample sorts by them, and the server answers with its own default order.
export type ContentSort = "score" | "new" | "name" | "favourites" | "updated" | "lowest";
export const contentSorts: ContentSort[] = ["score", "new", "name", "favourites", "updated", "lowest"];

export type Vote = "up" | "down" | "";
export type VoteRequest = "up" | "down" | "clear";

export interface ContentAuthor {
  id: string;
  name: string;
}

export interface ContentItem {
  id: string;
  kind: ContentKind;
  name: string;
  description: string;
  tags: string[];
  // 0 means "any".
  levelMin: number;
  levelMax: number;
  revision: number;
  rulesetVersion: string;
  fileHash: string;
  fileSize: number;
  fileUrl: string;
  author: ContentAuthor;
  score: number;
  votesUp: number;
  votesDown: number;
  // How many players keep it as a favourite. Older servers leave it out.
  favourites?: number;
  hidden: boolean;
  // Milliseconds since 1970 (UTC).
  createdAt: number;
  updatedAt: number;
}

export interface ContentSearchRequest {
  kind?: ContentKind;
  tag?: string;
  text?: string;
  // A user id, not a name.
  author?: string;
  levelMin?: number;
  levelMax?: number;
  sort?: ContentSort;
  // 1 to 50.
  limit?: number;
  cursor?: string;
}

export interface ContentSearchResponse {
  content: ContentItem[];
  // Empty when there are no more pages.
  cursor: string;
}

export interface ContentGetResponse {
  content: ContentItem;
  myVote: Vote;
}

export interface ContentVoteResponse {
  id: string;
  vote: Vote;
  score: number;
  votesUp: number;
  votesDown: number;
}

export interface PartyMember {
  name?: string;
  class?: string;
  level?: number;
  [key: string]: unknown;
}

export interface Completion {
  adventure: string;
  revision: number;
  party: PartyMember[];
  difficulty: string;
  completedAt: number;
  firstCompletedAt: number;
  times: number;
}

export interface CompletionsListResponse {
  userId: string;
  completions: Completion[];
  cursor: string;
}

export type ReportKind = "content" | "user";

export interface Report {
  id: string;
  reporter: string;
  kind: ReportKind;
  target: string;
  reason: string;
  status: "open" | "closed";
  createdAt: number;
  closedAt: number;
  closedBy: string;
  resolution: string;
}

export interface ReportResponse {
  report: Report;
}

export type ConfigResponse = { [key: string]: unknown };

export interface StatPoint {
  // The first day the point covers, as YYYY-MM-DD.
  day: string;
  value: number;
}

export interface StatsResponse {
  // Content published in each of the last weeks, oldest first.
  publishedWeekly: StatPoint[];
  // Different players who played on each of the last days, oldest first.
  playersDaily: StatPoint[];
}

// What the server counts about one account. Scores, works and favourites a writer has earned are
// counted from the library on the site; these are the things only the server sees.
export interface ProfileStatsResponse {
  player: {
    // Seconds spent in adventures.
    playTime: number;
    // Rank among all players by play time; 0 when unranked.
    rank: number;
    sessions: number;
    adventuresStarted: number;
    adventuresFinished: number;
    charactersMade: number;
    charactersFallen: number;
    longestSession: number;
    joinedAt: number;
    lastPlayedAt: number;
    // Hours played in each of the last months, oldest first.
    hoursMonthly: StatPoint[];
  };
  writer: {
    // How many times others started, and finished, this writer's adventures.
    plays: number;
    finishes: number;
    // Seconds others have spent in this writer's adventures.
    timePlayed: number;
    // Plays of this writer's work in each of the last months, oldest first.
    playsMonthly: StatPoint[];
  };
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  created?: boolean;
}

export interface ServerUser {
  id: string;
  username: string;
  display_name?: string;
  create_time?: string;
}

// The gRPC codes the server answers with (see the server README).
export const Codes = {
  invalidArgument: 3,
  notFound: 5,
  alreadyExists: 6,
  permissionDenied: 7,
  resourceExhausted: 8,
  failedPrecondition: 9,
  aborted: 10,
  unauthenticated: 16,
} as const;

export interface Failure {
  ok: false;
  // True when the server could not be reached at all (down, not configured, timed out).
  offline: boolean;
  // The server's gRPC code, or 0 when it gave none.
  code: number;
  message: string;
}

export type Result<T> = { ok: true; data: T } | Failure;

const timeoutMs = 5000;

function serverAddress(): string {
  return (process.env.YOREHOLD_SERVER ?? "").trim().replace(/\/+$/, "");
}

export function serverConfigured(): boolean {
  return serverAddress() !== "";
}

export function downloadUrl(): string {
  return (process.env.YOREHOLD_DOWNLOAD_URL ?? "").trim() || "https://github.com/JoshWright22/yorehold/releases";
}

function offline(message: string): Failure {
  return { ok: false, offline: true, code: 0, message };
}

async function send<T>(path: string, init: RequestInit): Promise<Result<T>> {
  const address = serverAddress();
  if (address === "") return offline("No game server is configured (YOREHOLD_SERVER is not set).");

  let response: Response;
  try {
    response = await fetch(address + path, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return offline("The game server could not be reached.");
  }

  let body: unknown = null;
  try {
    const text = await response.text();
    body = text === "" ? {} : JSON.parse(text);
  } catch {
    // A gateway in front of the server answering with an error page lands here.
    return offline("The game server gave an answer that could not be read.");
  }

  if (!response.ok) {
    const error = (body ?? {}) as { message?: unknown; code?: unknown };
    // 5xx without a gRPC code is a proxy or a server that is starting up, not a refusal.
    const code = typeof error.code === "number" ? error.code : 0;
    return {
      ok: false,
      offline: code === 0 && response.status >= 500,
      code: code !== 0 ? code : response.status === 401 ? Codes.unauthenticated : 0,
      message: typeof error.message === "string" && error.message !== "" ? error.message : "The game server refused the request (" + response.status + ").",
    };
  }
  return { ok: true, data: body as T };
}

// Calls an RPC. With a session token the caller is that user; without one the call is made with
// the server's HTTP key and is anonymous. With YOREHOLD_SAMPLE=1 an unreachable server answers
// from lib/sample.ts instead, for working on the pages locally.
async function rpc<T>(id: string, payload: object, token?: string): Promise<Result<T>> {
  const result = await rpcLive<T>(id, payload, token);
  if (result.ok || !result.offline || !sampleOn()) return result;
  const answer = sampleRpc(id, payload);
  if (answer === null) {
    return id === "content_get" ? { ok: false, offline: false, code: Codes.notFound, message: "No such content." } : result;
  }
  return { ok: true, data: answer as T };
}

async function rpcLive<T>(id: string, payload: object, token?: string): Promise<Result<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  let query = "?unwrap";
  if (token) {
    headers.Authorization = "Bearer " + token;
  } else {
    const key = (process.env.YOREHOLD_SERVER_HTTP_KEY ?? "").trim();
    if (key === "") return offline("No server HTTP key is configured (YOREHOLD_SERVER_HTTP_KEY is not set).");
    query = "?http_key=" + encodeURIComponent(key) + "&unwrap";
  }
  return send<T>("/v2/rpc/" + encodeURIComponent(id) + query, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

// A call that works for anyone but says more to a signed-in user. If the session has run out the
// call is made again anonymously, so an old cookie never breaks a public page.
async function rpcPreferSession<T>(id: string, payload: object, token?: string): Promise<Result<T>> {
  if (!token) return rpc<T>(id, payload);
  const result = await rpc<T>(id, payload, token);
  if (!result.ok && result.code === Codes.unauthenticated) return rpc<T>(id, payload);
  return result;
}

// Leaves out empty fields, which the server treats the same as missing ones.
function compact(request: object): object {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(request)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function contentSearch(request: ContentSearchRequest): Promise<Result<ContentSearchResponse>> {
  return rpc<ContentSearchResponse>("content_search", compact(request));
}

export function contentGet(id: string, token?: string): Promise<Result<ContentGetResponse>> {
  return rpcPreferSession<ContentGetResponse>("content_get", { id }, token);
}

export function contentVote(id: string, vote: VoteRequest, token: string): Promise<Result<ContentVoteResponse>> {
  return rpc<ContentVoteResponse>("content_vote", { id, vote }, token);
}

export function completionsList(userId: string, limit = 50, cursor = ""): Promise<Result<CompletionsListResponse>> {
  return rpc<CompletionsListResponse>("completions_list", { userId, limit, cursor });
}

export function report(kind: ReportKind, id: string, reason: string, token: string): Promise<Result<ReportResponse>> {
  return rpc<ReportResponse>("report", { kind, id, reason }, token);
}

// Not on the server yet; until it is, the home page graphs show only with YOREHOLD_SAMPLE=1.
export function stats(): Promise<Result<StatsResponse>> {
  return rpc<StatsResponse>("stats", {});
}

// Not on the server yet either; profiles show only the library's numbers without it.
export function profileStats(userId: string): Promise<Result<ProfileStatsResponse>> {
  return rpc<ProfileStatsResponse>("profile_stats", { userId });
}

export function config(): Promise<Result<ConfigResponse>> {
  return rpc<ConfigResponse>("config", {});
}

// Sign in, or sign up when create is true, with Nakama's own email accounts.
// With YOREHOLD_SAMPLE=1 and no server, any email and password sign in to a local stand-in account.
export async function authenticateEmail(email: string, password: string, create: boolean, username?: string): Promise<Result<AuthResponse>> {
  const result = await authenticateLive(email, password, create, username);
  if (result.ok || !result.offline || !sampleOn()) return result;
  return { ok: true, data: sampleSignIn(email, username) };
}

function authenticateLive(email: string, password: string, create: boolean, username?: string): Promise<Result<AuthResponse>> {
  const key = (process.env.YOREHOLD_SERVER_KEY ?? "").trim();
  if (key === "") return Promise.resolve(offline("No server key is configured (YOREHOLD_SERVER_KEY is not set)."));
  let query = "?create=" + (create ? "true" : "false");
  if (create && username) query += "&username=" + encodeURIComponent(username);
  return send<AuthResponse>("/v2/account/authenticate/email" + query, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Basic " + Buffer.from(key + ":").toString("base64"),
    },
    body: JSON.stringify({ email, password }),
  });
}

// Finds a user by name. Nakama only answers this for a signed-in caller.
export async function userByName(name: string, token: string): Promise<Result<ServerUser | null>> {
  const result = await send<{ users?: ServerUser[] }>("/v2/user?usernames=" + encodeURIComponent(name), {
    method: "GET",
    headers: { Accept: "application/json", Authorization: "Bearer " + token },
  });
  if (!result.ok) return result;
  return { ok: true, data: result.data.users?.[0] ?? null };
}

// Ids are 1 to 64 of letters, digits, "_", "-" and ".".
export function isId(value: string): boolean {
  return /^[A-Za-z0-9_.-]{1,64}$/.test(value);
}

export function isUserId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
