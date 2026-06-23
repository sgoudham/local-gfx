import type { FormationKey } from "~~/shared/types/state";

export function getFormationPosition(
  formation: FormationKey,
  playerIndex: number,
): { left: string; top: string } {
  const lines = [1, ...formation.split("-").map(Number)];
  const numRows = lines.length;

  let cumulativeIndex = 0;
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    const playersInRow = lines[rowIndex]!;
    const endIndex = cumulativeIndex + playersInRow;

    if (playerIndex < endIndex) {
      const positionInRow = playerIndex - cumulativeIndex;
      const x = ((positionInRow + 1) / (playersInRow + 1)) * 120;
      const y = ((rowIndex + 1) / (numRows + 1)) * 120;
      return { left: `${x - 10}%`, top: `${y - 10}%` };
    }
    cumulativeIndex = endIndex;
  }

  return { left: "50%", top: "50%" };
}
