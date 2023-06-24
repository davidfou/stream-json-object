import Stream from "node:stream";
import StreamJSON from "stream-json";

const streamObjectTransformer = () =>
  Stream.compose(
    StreamJSON.parser({
      streamKeys: false,
      streamValues: false,
    }),
    async function* (source) {
      let path = [];
      for await (const chunk of source) {
        switch (chunk.name) {
          case "startArray":
            path = [...path, 0];
            break;
          case "startObject":
            path = [...path, null];
            break;
          case "endArray":
          case "endObject":
            path = path.slice(0, -1);
            break;
          case "endArray":
            path = path.slice(0, -1);
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
            const lastPathValue = path[path.length - 1];
            if (typeof lastPathValue === "number") {
              path = [...path.slice(0, -1), lastPathValue + 1];
            }
        }
      }
    }
  );

export default streamObjectTransformer;
