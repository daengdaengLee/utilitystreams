export async function* takeStreamFactory<T>(
  options: { n: number },
  stream: Iterable<T> | AsyncIterable<T>,
) {
  let i = 0;
  for await (const value of stream) {
    if (i >= options.n) {
      return;
    }

    i += 1;
    yield value;

    if (i >= options.n) {
      return;
    }
  }
}
