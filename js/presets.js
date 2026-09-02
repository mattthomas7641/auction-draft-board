// Preset item pools + default settings for each theme.
// Each item: { name, category, value, photo }
//   category -> matched against a team's slot labels when a sale is confirmed
//   value    -> optional 1-10 rating, used only for the optional auto-scored winner
//   photo    -> optional image URL; falls back to an initials avatar if missing or broken

function nbaHeadshot(personId) {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${personId}.png`;
}

const PRESETS = {
  nba: {
    label: "NBA Players",
    defaultSlots: "G, G, F, F, C",
    defaultBudget: 20,
    items: [
      { name: "Luka Doncic", category: "G", value: 10, photo: nbaHeadshot(1629029) },
      { name: "Shai Gilgeous-Alexander", category: "G", value: 10, photo: nbaHeadshot(1628983) },
      { name: "Stephen Curry", category: "G", value: 9, photo: nbaHeadshot(201939) },
      { name: "Anthony Edwards", category: "G", value: 9, photo: nbaHeadshot(1630162) },
      { name: "Damian Lillard", category: "G", value: 8, photo: nbaHeadshot(203081) },
      { name: "Devin Booker", category: "G", value: 8, photo: nbaHeadshot(1626164) },
      { name: "Ja Morant", category: "G", value: 8, photo: nbaHeadshot(1629630) },
      { name: "Tyrese Haliburton", category: "G", value: 7, photo: nbaHeadshot(1630169) },
      { name: "Jalen Brunson", category: "G", value: 7, photo: nbaHeadshot(1628973) },
      { name: "Donovan Mitchell", category: "G", value: 7, photo: nbaHeadshot(1628378) },
      { name: "De'Aaron Fox", category: "G", value: 7, photo: nbaHeadshot(1628368) },
      { name: "Trae Young", category: "G", value: 6, photo: nbaHeadshot(1629027) },
      { name: "Desmond Bane", category: "G", value: 6, photo: nbaHeadshot(1630217) },
      { name: "Giannis Antetokounmpo", category: "F", value: 10, photo: nbaHeadshot(203507) },
      { name: "Jayson Tatum", category: "F", value: 9, photo: nbaHeadshot(1628369) },
      { name: "Kevin Durant", category: "F", value: 9, photo: nbaHeadshot(201142) },
      { name: "LeBron James", category: "F", value: 8, photo: nbaHeadshot(2544) },
      { name: "Jaylen Brown", category: "F", value: 8, photo: nbaHeadshot(1627759) },
      { name: "Kawhi Leonard", category: "F", value: 7, photo: nbaHeadshot(202695) },
      { name: "Paolo Banchero", category: "F", value: 7, photo: nbaHeadshot(1631094) },
      { name: "Jimmy Butler", category: "F", value: 7, photo: nbaHeadshot(202710) },
      { name: "Scottie Barnes", category: "F", value: 6, photo: nbaHeadshot(1630567) },
      { name: "Franz Wagner", category: "F", value: 6, photo: nbaHeadshot(1630532) },
      { name: "Nikola Jokic", category: "C", value: 10, photo: nbaHeadshot(203999) },
      { name: "Joel Embiid", category: "C", value: 8, photo: nbaHeadshot(203954) },
      { name: "Victor Wembanyama", category: "C", value: 9, photo: nbaHeadshot(1641705) },
      { name: "Anthony Davis", category: "C", value: 8, photo: nbaHeadshot(203076) },
      { name: "Domantas Sabonis", category: "C", value: 7, photo: nbaHeadshot(1627734) },
      { name: "Bam Adebayo", category: "C", value: 6, photo: nbaHeadshot(1628389) },
      { name: "Karl-Anthony Towns", category: "C", value: 7, photo: nbaHeadshot(1626157) },
      { name: "Alperen Sengun", category: "C", value: 6, photo: nbaHeadshot(1630578) },
    ],
  },

  basement: {
    label: "Basement Build",
    defaultSlots: "Seating, Entertainment, Bar, Games, Decor",
    defaultBudget: 20,
    items: [
      { name: "Sectional Couch", category: "Seating", value: 8 },
      { name: "Recliner Chair", category: "Seating", value: 5 },
      { name: "Beanbag Chairs", category: "Seating", value: 2 },
      { name: "75\" TV", category: "Entertainment", value: 9 },
      { name: "Surround Sound System", category: "Entertainment", value: 6 },
      { name: "Projector + Screen", category: "Entertainment", value: 7 },
      { name: "Popcorn Machine", category: "Entertainment", value: 3 },
      { name: "Karaoke Machine", category: "Entertainment", value: 5 },
      { name: "Mini Fridge", category: "Bar", value: 5 },
      { name: "Bar Cart", category: "Bar", value: 4 },
      { name: "Coffee & Snack Bar", category: "Bar", value: 4 },
      { name: "Pool Table", category: "Games", value: 8 },
      { name: "Foosball Table", category: "Games", value: 5 },
      { name: "Dartboard", category: "Games", value: 3 },
      { name: "Poker Table", category: "Games", value: 6 },
      { name: "Arcade Machine", category: "Games", value: 8 },
      { name: "Mini Basketball Hoop", category: "Games", value: 3 },
      { name: "Neon Sign", category: "Decor", value: 3 },
      { name: "String Lights", category: "Decor", value: 2 },
      { name: "Area Rug", category: "Decor", value: 3 },
    ],
  },

  custom: {
    label: "Custom",
    defaultSlots: "Item, Item, Item, Item, Item",
    defaultBudget: 20,
    items: [],
  },
};
