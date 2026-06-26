import * as fs from "fs";
import * as path from "path";

const inputFile = process.argv[2];

try {
  for (const team of ["home", "away"]) {
    const filePath = path.resolve(inputFile);
    console.log(filePath);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const playerIds = data[team].players.map((player) => ({
      id: player.id,
      cards: [],
    }));

    const players = playerIds.slice(0, 11);
    const substitutes = playerIds.slice(11);

    const output = {
      players,
      substitutes,
    };

    console.log(`--- ${team} ---`);
    console.log(JSON.stringify(output));
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
