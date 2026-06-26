import type { Card } from "~~/shared/types/data";

export function formatCards(cards: Card[]): string {
  return cards.map((c) => (c === Card.Yellow ? `🟨` : `🟥`)).join(" ");
}
