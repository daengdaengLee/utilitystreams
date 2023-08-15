type Options = { n: number };
type Stream<T> = Iterable<T> | AsyncIterable<T>;
type Result<T> = AsyncGenerator<T>;

export function takeStreamFactory<T>(
  options: Options,
): (stream: Stream<T>) => Result<T>;
export function takeStreamFactory<T>(
  options: Options,
  stream: Stream<T>,
): Result<T>;
export function takeStreamFactory<T>(
  options: Options,
  stream?: Stream<T>,
): ((stream: Stream<T>) => Result<T>) | Result<T> {
  if (stream != null) {
    return _takeStreamFactory(options, stream);
  }

  return (stream: Stream<T>): Result<T> => {
    return _takeStreamFactory(options, stream);
  };
}

async function* _takeStreamFactory<T>(
  options: Options,
  stream: Stream<T>,
): Result<T> {
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
