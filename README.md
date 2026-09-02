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

0. **Home / Back** — a nav bar sits above every screen. **🏠 Home** jumps back
   to Setup (confirms first if a draft is in progress, so you don't lose it by
   accident); **← Back** appears on the Results screen to jump back into the
   draft in progress, in case you hit Finish early. Setup/Draft/Results are
   also real browser history entries, so the actual browser/OS **Back**
   button works too — it'll step from Results → Draft → Setup just like
   any other page.
1. **Setup** — pick a theme (NBA, NFL, MLB, or Custom), set the number of
   teams, starting budget, and roster slots (e.g. `G, G, F, F, C` for NBA,
   `QB, RB, WR, WR, TE` for NFL, `P, C, IF, OF, DH` for MLB). Team names are
   editable. The item pool can be edited freely — one item per line as
   `Name | Category | Value(optional) | Photo URL(optional)`. NBA/NFL/MLB ship
   with real player headshots (NBA.com and ESPN CDNs).
   Pick a **draft mode**:
   - *Open Auction* — anyone can pass on an item; nothing is forced.
   - *Must-Draft (alternating)* — nothing can be skipped. Turn order rotates
     through teams; whoever's turn it is gets the current item for $0 by
     default, unless another team outbids them.
2. **Draft** — the current item is shown with a photo (falls back to an
   initials avatar if there's no image or it fails to load) and a live bid
   counter (`+$1`, `+$5`, `−$1`, `Reset`). Tap a team once they're the high
   bidder, then hit **SOLD!** to deduct the bid from their budget and slot the
   item into a matching roster slot (falls back to any open slot if no
   category match). **Undo** reverts the last action.
   - **ALL IN** — a team can commit their *entire* remaining budget to the
     current item in one tap. Other teams can still steal it by outbidding if
     they can afford to; if nobody does, the all-in team wins it and drops to
     $0.
   - **Broke-team safety net** — once a team's budget hits $0, they can no
     longer win a contested bid, so in Open Auction mode any item nobody else
     wants is automatically handed to a $0 team with room instead of being
     discarded — everyone still ends up with a full roster. A small activity
     log at the bottom of the draft view records every sale, auto-draft, and
     skip.
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
