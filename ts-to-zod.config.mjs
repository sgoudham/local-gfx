/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
export default [
  {
    name: "data",
    input: "./shared/types/data.ts",
    output: "./server/schema/data.ts",
  },
  {
    name: "state",
    input: "./shared/types/state.ts",
    output: "./server/schema/state.ts",
  },
];
