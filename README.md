# yorehold-web

The website side of [Yorehold](https://github.com/JoshWright22/yorehold).

## What it does

- Accounts and writer profiles
- Chapter library: upload, browse, play links
- Canon process: chapters go Draft, then Published, then Nominated, then Canon review, then Canon
- Skin library with one-click install
- Leaderboards
- `yorehold.com/play`: the browser build of the game (desktop browsers only; phones get sent to the app)

## Status

A working skeleton: [Next.js](https://nextjs.org/) (App Router, TypeScript), plain CSS. Dark, flat blocks with thick borders and hard shadows; every colour comes from one 29-colour palette in `app/theme.css`. It talks only to the [Nakama backend](https://github.com/JoshWright22/yorehold-server), through its RPCs.

Builds and type-checks; not yet run against a live server.

## Running locally

Requirements: [Node.js](https://nodejs.org/) LTS.

```shell
git clone https://github.com/JoshWright22/yorehold-web
cd yorehold-web
npm install
cp .env.example .env.local   # then fill it in
npm run dev                  # http://localhost:3000
```

The site runs without a server: every page that needs one shows an "offline" notice instead. To see real data, start [yorehold-server](https://github.com/JoshWright22/yorehold-server) and copy its keys into `.env.local`.

Checks:

```shell
npx tsc --noEmit
npm run lint
npm run build
```

`/docs` is filled at build time from `../yorehold/docs/CONTENT.md`, `../yorehold-framework/docs/DIALOGUE.md` and `QUESTS.md`, so clone those repos next to this one to get it. A file that isn't there is left out.

`/compendium` is filled at build time the same way, from the game's own files in `../yorehold-godot/assets` (chapters, creatures, items, spells and classes). A folder that isn't there shows up as an empty tab.

## Environment variables

Set in `.env.local` (gitignored). `.env.example` lists them.

| Variable | What it is |
|---|---|
| `YOREHOLD_SERVER` | Where the game server answers HTTP, for example `http://127.0.0.1:7350` |
| `YOREHOLD_SERVER_HTTP_KEY` | The server's HTTP key (`HTTP_KEY` in its `.env`), for the public RPCs |
| `YOREHOLD_SERVER_KEY` | The server's client key (`SERVER_KEY` in its `.env`), for signing in and signing up |
| `YOREHOLD_DOWNLOAD_URL` | Where the game download lives (optional; defaults to the game's releases page) |

The keys are only read by server code and never reach the browser.

## Pages

| Address | What is there |
|---|---|
| `/` | Featured (best scored) and newest content |
| `/library` | Search by text, kind, tag and level range, sorted by score, newest or name, with paging. Driven by the query string: `?q=&kind=&tag=&min=&max=&sort=&cursor=`. The page it gets is shown as a table that can be filtered and sorted in place, with the picked entry beside it |
| `/compendium/<kind>` | The game's chapters, creatures, items, spells and classes as a filterable table with a stat block beside it; skins is an empty tab for now |
| `/compendium/<kind>/<id>` | The same, with that entry picked |
| `/c/<id>` | A content page: name, author, description, tags, level range, revision, score with vote buttons, "Open in Yorehold" (`yorehold://content/<id>`) with the file download as the fallback |
| `/c/<id>/report` | Report that content to the moderators (signed in) |
| `/u/<name>` | A profile: published work and completed adventures |
| `/login` | Sign in, or sign up with `?mode=signup`, by email and password |
| `/logout` | Signs out (POST) |
| `/account` | The signed-in user's own name, content and completions |
| `/play` | Placeholder for the browser build of the game, with the download link |
| `/forums` | Placeholder: the categories, "coming soon" |
| `/canon` | Placeholder for the review queue |
| `/docs` | The format docs from the game and framework repos |

## Layout

```
app/                 the pages, one folder per address
app/api/session/     GET who is signed in, POST sign in or sign up (sets the cookie)
app/c/[id]/actions.ts  the vote and report server actions
app/theme.css        the palette and the theme variables (colour, spacing, radii, shadows)
components/ui.tsx    card, tab bar, filter bar, stat tile, stat block, button, chip, split view
components/Browser.tsx  the list and detail browser: filter, sort, pick an entry
components/          also the top bar, footer, profile header, tabs, content and completion lists, the offline notice
lib/server.ts        the one typed client for the server's RPCs; every call fails soft
lib/session.ts       reads the session cookie
lib/docs.ts          reads and renders the format docs
lib/compendium.ts    reads the game's files into rows for the compendium
lib/sheet.ts, rows.ts  the row and stat block data the browser shows
```

Signing in keeps the server's session token in an httpOnly cookie (`yorehold_session`) that lasts as long as the token does.

## Not built yet

- The embedded game on `/play`, the forums and the canon queue: placeholders only.
- Publishing and uploading from the site (it happens from Create in the game), screenshots, and a revision history on content pages.
- Staying signed in past the session token's life (no refresh token is kept), password reset, linking a device account, changing a name.
- `/u/<name>` by name alone: the server only looks a name up for a signed-in visitor, so links to profiles carry the user id (`?id=`), and a bare name asks the visitor to sign in.
- Reporting a user (the server supports it; only content has a report page), blocking, and the admin pages for reports and bans.
- Paging on profiles and the account page (the first 50 of each are shown).
- Skins, leaderboards, sending phones to the app.
- Nothing registers the `yorehold://` link yet; that is the game client's part.
- Tests.

## Contributing

Open an issue to talk through ideas first. Never commit secrets: keys go in a local `.env.local`, which is gitignored.

## Licence

Not picked yet. Until it is, the code is all rights reserved.
