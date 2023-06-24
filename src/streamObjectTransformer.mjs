import Stream from "node:stream";
import StreamJSON from "stream-json";

const updatePath = (path) => {
  const lastPathValue = path[path.length - 1];
  if (typeof lastPathValue === "number") {
    return [...path.slice(0, -1), lastPathValue + 1];
  }
  return path;
};

const streamObjectTransformer = () =>
  Stream.compose(
    StreamJSON.parser({
      streamKeys: false,
      streamValues: false,
    }),
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
              path = updatePath(path);
            }
            break;
          case "startObject":
            path = [...path, null];
            break;
          case "endObject":
            path = path.slice(0, -1);
            if (lastPathValue === null) {
              yield { key: path, value: {} };
              path = updatePath(path);
            }
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
            path = updatePath(path);
        }
      }
    }
  );

export default streamObjectTransformer;
