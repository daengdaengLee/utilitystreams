type Predicate<T> = (value: T) => boolean | Promise<boolean>;
type Options<T> = { f: Predicate<T> };
type Stream<T> = Iterable<T> | AsyncIterable<T>;
type Result<T> = AsyncGenerator<T>;

export function takeUntilStreamFactory<T>(
  options: Options<T>,
): (stream: Stream<T>) => Result<T>;
export function takeUntilStreamFactory<T>(
  options: Options<T>,
  stream: Stream<T>,
): Result<T>;
export function takeUntilStreamFactory<T>(
  options: Options<T>,
  stream?: Stream<T>,
): ((stream: Stream<T>) => Result<T>) | Result<T> {
  if (stream != null) {
    return _takeUntilStreamFactory(options, stream);
  }

  return (stream: Stream<T>): Result<T> => {
    return _takeUntilStreamFactory(options, stream);
  };
}

async function* _takeUntilStreamFactory<T>(
  options: Options<T>,
  stream: Stream<T>,
): Result<T> {
  for await (const value of stream) {
    const isEnd = await options.f(value);
    yield value;
    if (isEnd) {
      return;
    }
  }
}
