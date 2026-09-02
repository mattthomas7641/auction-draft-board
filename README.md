# Build Your Team

A budget auction draft, for any category. Inspired by the "NBA Bidding Draft"
TikTok format: each team starts with a fixed budget (default $20), items are
revealed one at a time, teams bid out loud, and the highest bidder gets the
item deducted from their budget into an open roster slot. Best team wins.

Runs as a single static web app — no build step, no backend. Open
`index.html` and go, or serve the folder with any static file server.

## How it's used

One screen (phone or laptop) acts as the **host board** — great for filming.
Everyone can see the current item and each team's remaining budget while they
call out bids; the host taps the leading team and bumps the bid counter, then
hits **SOLD!** to lock it in.

1. **Setup** — pick a theme (NBA Players, Basement Build, or Custom), set the
   number of teams, starting budget, and roster slots (e.g. `G, G, F, F, C`).
   Team names are editable. The item pool can be edited freely — one item per
   line as `Name | Category | Value(optional)`.
2. **Draft** — the current item is shown with a live bid counter (`+$1`,
   `+$5`, `−$1`, `Reset`). Tap a team once they're the high bidder, then hit
   **SOLD!** to deduct the bid from their budget and slot the item into a
   matching roster slot (falls back to any open slot if no category match).
   **Undo** reverts the last sale/skip.
3. **Results** — once every roster is full or the pool runs out, see every
   team's final roster and spend side by side. If items were given point
   values, an auto-score is shown as a reference; either way you can declare
   the winner by vote/judge with one tap.

## Project structure

```
index.html       Setup / Draft / Results views (all in one page)
css/style.css     Styling (light + dark mode)
js/presets.js     Built-in item pools (NBA Players, Basement Build)
js/app.js         All app logic
```

## Adding your own theme

Add an entry to `PRESETS` in [js/presets.js](js/presets.js), or just pick
**Custom** in the app and paste your own list into the pool editor — no code
changes required for one-off sessions.

## Possible future additions

- Save/resume an in-progress draft (currently a refresh resets it)
- Per-device bidding instead of a single host screen
- Photos per item
