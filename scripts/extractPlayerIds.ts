import * as fs from "fs";
import * as path from "path";

interface Player {
  id: string;
}

interface PlayerIdOutput {
  players: Array<{ id: string }>;
  substitutes: Array<{ id: string }>;
}

const inputFile = process.argv[2];

try {
  for (const team of ["home", "away"]) {
    const filePath = path.resolve(inputFile);
    console.log(filePath);
    const data: Player[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const playerIds = data[team].players.map((player) => ({ id: player.id }));

    const players = playerIds.slice(0, 11);
    const substitutes = playerIds.slice(11);

    console.log(`--- ${team} players ---`)
    console.log(JSON.stringify(players));
    console.log(`--- ${team} subs ---`)
    console.log(JSON.stringify(substitutes));
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
