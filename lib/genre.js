export const GENRES = [
  { id: "lofi", name: "Lo-Fi Focus", accent: "#C97B4A" },
  { id: "jazz", name: "Late Night Jazz", accent: "#8B4B6B" },
  { id: "electro", name: "Electronic Drift", accent: "#4B7B8B" },
  { id: "folk", name: "Acoustic Mornings", accent: "#A69056" },
  { id: "ambient", name: "Ambient Sleep", accent: "#5B5B7B" },
  { id: "soul", name: "Soul & Groove", accent: "#B0473E" },
];

export function resolveGenre(id) {
  return GENRES.find((g) => g.id === id) || { id: "unknown", name: "Lainnya", accent: "#726A68" };
}

