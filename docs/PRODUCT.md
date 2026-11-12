# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, roughly equal in priority:

- **Casual friend/family groups** running a budget auction draft as a game-night activity — gathered around one phone or laptop, everyone watching the same board while they call out bids out loud.
- **Content creators** filming this exact format as short-form social video (the direct reference is the "CrossOverBros" TikTok "NBA Bidding Draft" bit — two people, $20 budgets, players revealed one at a time, live bidding). For this audience the board itself is part of the shot, not just a tool behind the scenes.

Both use it the same way: one shared screen, a live host-controlled auction, no per-player devices.

## Product Purpose

A host-controlled, budget-limited auction draft for any themed pool of items (currently real NBA/NFL/MLB players, one preset per league). Everyone starts with the same budget; a host reveals items one at a time and runs a live bid counter; the group calls out bids out loud; the highest bidder's budget is deducted and the item fills a matching roster slot. The draft ends when rosters are full, and the "best team" is settled by the group (with an optional auto-score if items carry point values).

Success = the auction itself disappears as friction — budgets, slot-matching, and bookkeeping happen automatically so the people in the room can focus on the bidding, the trash talk, and (for creators) the bit.

## Positioning

The mechanism a spreadsheet or whiteboard can't match: the live auction state (remaining budget per team, which roster slots are still open, what a bid would cost each bidder right now) updates in real time with zero manual math, so the humans never have to stop and calculate anything mid-bid. A generic "random picker" app can reveal items but has no concept of budgets, competing bidders, or roster slots at all.

## Operating Context

- Run live, in person (or on a call), on one shared screen — a phone held up on camera, or a laptop/tablet the group watches together. Not a per-player, each-on-their-own-device experience.
- Sessions are short and single-sitting: set up teams and a theme, run the draft start to finish, look at the results, done. Nothing needs to persist between sessions.
- For the content-creator audience, the screen is filmed directly, so what's on it during an active bid (the item, the bid amount, who's leading) needs to read clearly at a glance and hold up on camera, including in vertical/mobile framing.

## Capabilities and Constraints

- Three built-in themes today (NBA, NFL, MLB), each a preset pool of real, named players with real photos (NBA.com / ESPN CDNs) and a themed set of roster slots (e.g. PG/SG/SF/PF/C for NBA). The pool text is user-editable per session (add/remove/reweight items, or attach a different photo) without touching code.
- 2–6 teams, a shared configurable starting budget, and configurable roster slot labels.
- Two draft modes: Open Auction (any item can go unsold) and Must-Draft (nothing can be skipped; turn order rotates a default winner through teams).
- All-in bidding (commit an entire remaining budget in one tap) and a broke-team safety net (a $0 team automatically receives unclaimed items instead of ending with empty slots).
- Ships today as a static, dependency-free site (plain HTML/CSS/JS, no build step, no backend, no accounts) deployed to GitHub Pages. That is the current implementation, not a promised-forever constraint — but any change that would require a backend, accounts, or a build pipeline is a deliberate scope change, not an incidental one.
- Small personal/hobby project at present, not a licensed product: real player names and official league photo CDNs are used at a scale consistent with a fan-made tool, not a large commercial audience.

## Evidence on Hand

- Reference format: CrossOverBros' "NBA Bidding Draft" TikTok (two bidders, $20 each, live ascending bid per player, roster slots filling as players are won).
- No testimonials, press, case studies, or usage data exist yet — none should be fabricated in design work.

## Product Principles

1. The live bid state is the star — budget, current bid, and who's leading must always be the most legible thing on screen, especially at a glance and on camera.
2. Never let the group get stuck: every flow (broke teams, must-draft mode, undo) is designed so the draft always has a way forward to a finished set of rosters.
3. Zero setup friction — a theme, a budget, and team names are the only things standing between opening the site and starting to bid.
4. One shared board, not per-player screens — every interaction assumes a host and a room watching one surface together.
5. Keep it swappable — the underlying mechanic (budget, items, slots) is theme-agnostic; NBA/NFL/MLB are instances of it, not the whole idea.

## Accessibility & Inclusion

No accessibility standard has been formally committed to yet; this is an open gap the audit step should surface concretely rather than one to assume compliant.
