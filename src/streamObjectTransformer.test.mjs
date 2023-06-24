import Stream from "node:stream";

import streamObjectTransformer from "./streamObjectTransformer";

describe("streamObjectTransformer", () => {
  it.each([
    {
      description: "a simple array",
      input: ["hello", 5, false, true, null, "world"],
      expectedOutput: [
        { key: [0], value: "hello" },
        { key: [1], value: 5 },
        { key: [2], value: false },
        { key: [3], value: true },
        { key: [4], value: null },
        { key: [5], value: "world" },
      ],
    },
    {
      description: "a simple object",
      input: {
        key1: "hello",
        key2: 5,
        key3: false,
        key4: true,
        key5: null,
        key6: "world",
      },
      expectedOutput: [
        { key: ["key1"], value: "hello" },
        { key: ["key2"], value: 5 },
        { key: ["key3"], value: false },
        { key: ["key4"], value: true },
        { key: ["key5"], value: null },
        { key: ["key6"], value: "world" },
      ],
    },
    {
      description: "an array containing an empty array",
      input: [0, [], 1],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1], value: [] },
        { key: [2], value: 1 },
      ],
    },
    {
      description: "an array containing an empty object",
      input: [0, {}, 1],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1], value: {} },
        { key: [2], value: 1 },
      ],
    },
  ])(
    "emits expected elements with $description",
    async ({ input, expectedOutput }) => {
      const stream = Stream.Readable.from(JSON.stringify(input)).pipe(
        streamObjectTransformer()
      );
      const output = [];
      for await (const element of stream) {
        output.push(element);
      }
      expect(output).toEqual(expectedOutput);
    }
  );
});
