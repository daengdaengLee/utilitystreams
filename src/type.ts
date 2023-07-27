export type Task = {
  done: boolean;
  value: {
    chunk: unknown;
    encoding: BufferEncoding;
  };
};
