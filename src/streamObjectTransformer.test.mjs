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
    {
      description: "an object containing an empty array",
      input: { key1: 0, key2: [], key3: 1 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2"], value: [] },
        { key: ["key3"], value: 1 },
      ],
    },
    {
      description: "an object containing an empty object",
      input: { key1: 0, key2: {}, key3: 1 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2"], value: {} },
        { key: ["key3"], value: 1 },
      ],
    },
    {
      description: "an array containing an array containing an array",
      input: [0, [1, [2]], 3],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1, 0], value: 1 },
        { key: [1, 1, 0], value: 2 },
        { key: [2], value: 3 },
      ],
    },
    {
      description: "an array containing an array containing an object",
      input: [0, [1, { key: 2 }], 3],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1, 0], value: 1 },
        { key: [1, 1, "key"], value: 2 },
        { key: [2], value: 3 },
      ],
    },
    {
      description: "an array containing an object containing an array",
      input: [0, { key: [1, 2] }, 3],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1, "key", 0], value: 1 },
        { key: [1, "key", 1], value: 2 },
        { key: [2], value: 3 },
      ],
    },
    {
      description: "an array containing an object containing an object",
      input: [0, { key: { key: 1 } }, 3],
      expectedOutput: [
        { key: [0], value: 0 },
        { key: [1, "key", "key"], value: 1 },
        { key: [2], value: 3 },
      ],
    },
    {
      description: "an object containing an array containing an array",
      input: { key1: 0, key2: [1, [2]], key3: 3 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2", 0], value: 1 },
        { key: ["key2", 1, 0], value: 2 },
        { key: ["key3"], value: 3 },
      ],
    },
    {
      description: "an object containing an array containing an object",
      input: { key1: 0, key2: [1, { key: 2 }], key3: 3 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2", 0], value: 1 },
        { key: ["key2", 1, "key"], value: 2 },
        { key: ["key3"], value: 3 },
      ],
    },
    {
      description: "an object containing an object containing an array",
      input: { key1: 0, key2: { key: [1, 2] }, key3: 3 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2", "key", 0], value: 1 },
        { key: ["key2", "key", 1], value: 2 },
        { key: ["key3"], value: 3 },
      ],
    },
    {
      description: "an object containing an object containing an object",
      input: { key1: 0, key2: { key: { key: 1 } }, key3: 3 },
      expectedOutput: [
        { key: ["key1"], value: 0 },
        { key: ["key2", "key", "key"], value: 1 },
        { key: ["key3"], value: 3 },
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
