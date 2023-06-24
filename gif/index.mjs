import Stream from "node:stream";
import timers from "node:timers/promises";
import util from "node:util";
import StreamJSON from "stream-json";
import fetch from "node-fetch";
import _ from "lodash";

const updatePath = (path) => {
  const lastPathValue = path[path.length - 1];
  if (typeof lastPathValue === "number") {
    return [...path.slice(0, -1), lastPathValue + 1];
  }
  return path;
};

await Stream.promises.pipeline(
  async function* () {
    const response = await fetch(
      "https://raw.githubusercontent.com/davidfou/stream-json-object/main/demo/solar_system.json"
    );
    if (!response.ok) {
      throw new Error("Oups");
    }
    yield* response.body;
  },
  StreamJSON.parser({
    streamKeys: false,
    streamValues: false,
  }),
  // Simulate some latency
  async function* (source) {
    for await (const chunk of source) {
      await timers.setTimeout(50);
      yield chunk;
    }
  },
  async function* (source) {
    let path = [];
    for await (const chunk of source) {
      const lastPathValue = path[path.length - 1];
      switch (chunk.name) {
        case "startArray":
          path = [...path, 0];
          break;
        case "endArray":
          path = path.slice(0, -1);
          if (lastPathValue === 0) {
            yield { key: path, value: [] };
          }
          path = updatePath(path);
          break;
        case "startObject":
          path = [...path, null];
          break;
        case "endObject":
          path = path.slice(0, -1);
          if (lastPathValue === null) {
            yield { key: path, value: {} };
          }
          path = updatePath(path);
          break;
        case "keyValue":
          path = [...path.slice(0, -1), chunk.value];
          break;
        default:
          yield {
            key: path,
            value:
              chunk.name === "numberValue"
                ? parseFloat(chunk.value)
                : chunk.value,
          };
          path = updatePath(path);
      }
    }
  },
  // events sent by a backend and reconstruction of the object on the frontend
  async function* (source) {
    let out = null;
    let i = 0;
    for await (const chunk of source) {
      if (out === null) {
        out = typeof chunk.key[0] === "number" ? [] : {};
      }
      out = _.set(out, chunk.key, chunk.value);
      i += 1;
      console.clear();
      console.log(
        util.inspect(out, { depth: null, colors: true, breakLength: 171 })
      );
    }

    console.log("object recreated in %i steps", i);
  }
);
