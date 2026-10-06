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

A working skeleton: [Next.js](https://nextjs.org/) (App Router, TypeScript), plain CSS. Two inks (charcoal and off-white) with one butter accent, large tight type, round buttons and tabs, and pictures behind the page headings; ranked rows and profile headers like a score site, dense filterable tables with a book-page entry beside them like a rules reference. Colours, type and motion are named in `app/theme.css`; the banner pictures in `public/art` are temporary (see its `CREDITS.txt`). It talks only to the [Nakama backend](https://github.com/JoshWright22/yorehold-server), through its RPCs.

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
| `YOREHOLD_SAMPLE` | `1` shows made-up library content (`lib/sample.ts`) whenever the server cannot be reached; for local work only |
| `YOREHOLD_DOWNLOAD_URL` | Where the game download lives (optional; defaults to the game's releases page) |

The keys are only read by server code and never reach the browser.

## Pages

| Address | What is there |
|---|---|
| `/` | The top adventure by score on a picture, with the news, Download and Play beside it; the next four popular adventures as a row of pictures; two graphs, content published per week and players per day, with the point under the pointer read out (from a `stats` RPC the server does not have yet, so they only show with `YOREHOLD_SAMPLE=1` for now); a row of counts of what is in the compendium; then the newest 50 pieces of content as a ranked table (25 shown, filter chips by kind, columns that sort, click a row to open it) with the top writers beside it. With an empty library the picture shows the game's headline instead |
| `/adventures` | The second tab: a search box over rows of filters (show adventures, packs or favourites; level band; tag; sort), then cards two to a line with the picture, writer, levels, tags, score and Favourite and Download buttons. Favourites are kept in the browser (`lib/favourites.ts`) until the server stores them. Driven by `?q=&show=&level=&tag=&sort=&cursor=` |
| `/c/<id>/download` | Sends the browser to the content's file, or to `yorehold://content/<id>` when it has none; in sample mode it hands over a small stand-in file |
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
| `/status` | Whether the game server answers, and how fast |
| `/site-rules`, `/terms`, `/privacy` | Placeholders: the text is not written yet |

The top bar has Home, Adventures and four headings, split by who is reading: Rules, Players, Designers and Community. They all stay in the bar down to a half-width window (the search box and then the name give way first); only on a phone do they fold into a menu. Pointing at one opens the list of everything under it; the lists are in `components/TopBar.tsx`. The footer is one line of links (`components/SiteFooter.tsx`).

## Layout

```
app/                 the pages, one folder per address
app/api/session/     GET who is signed in, POST sign in or sign up (sets the cookie)
app/c/[id]/actions.ts  the vote and report server actions
app/theme.css        the theme variables (colour, spacing, radii, type, motion)
components/ui.tsx    card, tab bar, filter bar, stat tile, stat block, button, chip, split view, section, news list, rank list
components/Browser.tsx  the list and detail browser: filter, sort, pick an entry
components/RankedTable.tsx  the ranked table: filter chips, sorting, a row opens its page
components/          also the top bar, footer, profile header, tabs, content and completion lists, the offline notice
lib/server.ts        the one typed client for the server's RPCs; every call fails soft
lib/session.ts       reads the session cookie
lib/docs.ts          reads and renders the format docs
lib/compendium.ts    reads the game's files into rows for the compendium
lib/sheet.ts, rows.ts  the row and stat block data the browser and the ranked table show
lib/news.ts          the news on the home page; add an entry at the top to post one
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
