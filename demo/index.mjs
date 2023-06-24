import fs from "node:fs";
import Stream from "node:stream/promises";
import streamObjectTransformer from "../src/streamObjectTransformer.mjs";
import path from "node:path";
import _ from "lodash";

await Stream.pipeline(
  fs.createReadStream(path.join(process.cwd(), "demo/solar_system.json")),
  async function* (source) {
    for await (const chunk of source) {
      yield chunk.toString();
    }
  },
  streamObjectTransformer(),
  // events sent by a backend and reconsctruction of the object on the frontend
  async function* (source) {
    let out = null;
    let i = 0;
    for await (const chunk of source) {
      if (out === null) {
        out = typeof chunk.key[0] === "number" ? [] : {};
      }
      out = _.set(out, chunk.key, chunk.value);
      i += 1;
      console.log("step %i", i);
      console.log(out);
    }

    console.log("object recreated in %i steps", i);
  }
);
