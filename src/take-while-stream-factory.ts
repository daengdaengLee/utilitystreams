type Predicate<T> = (value: T) => boolean | Promise<boolean>;
type Options<T> = { f: Predicate<T> };
type Stream<T> = Iterable<T> | AsyncIterable<T>;
type Result<T> = AsyncGenerator<T>;

export function takeWhileStreamFactory<T>(
  options: Options<T>,
): (stream: Stream<T>) => Result<T>;
export function takeWhileStreamFactory<T>(
  options: Options<T>,
  stream: Stream<T>,
): Result<T>;
export function takeWhileStreamFactory<T>(
  options: Options<T>,
  stream?: Stream<T>,
): ((stream: Stream<T>) => Result<T>) | Result<T> {
  if (stream != null) {
    return _takeWhileStreamFactory(options, stream);
  }

  return (stream: Stream<T>): Result<T> => {
    return _takeWhileStreamFactory(options, stream);
  };
}

async function* _takeWhileStreamFactory<T>(
  options: Options<T>,
  stream: Stream<T>,
): Result<T> {
  for await (const value of stream) {
    const isEnd = !(await options.f(value));
    if (isEnd) {
      return;
    }
    yield value;
  }
}
