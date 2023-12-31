# utilitystreams

**Convenient Streams, simple and easy to use.**

## Usage

```shell
$ npm install utilitystreams
```

```typescript
// ...
import { DebounceStream } from "utilitystreams";

// ...

app.use("/stream-req", async (req, res) => {
  await pipeline(
    req,
    new DebounceStream({ waitMs: 300 }),
    createWriteStream("/file/path/to/save"),
  );
});
```

## Documentation

All stream have test files. Detailed usage can be found in the test file.

### BufferStream

Collect the input data into an array.

Outputs the array of collected data if

- the length of the array is same with the set size.
- after the set waitMs (only if you set waitMs option)

```typescript
import { BufferStream } from "utilitystreams";

await pipeline(
  process.stdout,
  new BufferStream({ size: 100, waitMs: 1000 }, { objectMode: true }),
  saveToDbStream,
);
```

### ReduceStream

Accumulate the input data into the acc object.

```typescript
import { ReduceStream } from "utilitystreams";

await pipeline(
  arguments,
  new ReduceStream(
    { acc: "", f: (acc, cur) => `${acc} ${cur}` },
    { objectMode: true },
  ),
  process.stdout,
);
```

### ToArrayStream

Collects the input data into an array.

```typescript
import { ToArrayStream } from "utilitystreams";

const csvLines = [];
await pipeline(
  createReadStream("data.csv"),
  csvParser,
  new ToArrayStream({ target: csvLines }),
);
```

### DelayStream

Delays the input data by the set time.

- The output data is in the same order as the input data.
- It **does not** delay the following input data.

```typescript
import { DelayStream } from "utilitystreams";

await pipeline(
  process.stdin,
  new DelayStream({ waitMs: 3000 }),
  process.stdout,
);
```

### DebounceStream

Outputs only the last of the input data for the set time period.

```typescript
import { DebounceStream } from "utilitystreams";

await pipeline(
  process.stdin,
  new DebounceStream({ waitMs: 100 }),
  process.stdout,
);
```

### ThrottleStream

Ignore other input data for the time you set after the data output.

```typescript
import { ThrottleStream } from "utilitystreams";

await pipeline(
  process.stdin,
  new ThrottleStream({ waitMs: 100 }),
  process.stdout,
);
```

### MapStream

Make output data from input data using the mapper function.

- If the input data is a promise, it will be resolved before passed into the mapper function.
- If the output data is a promise, it will be resolved before push (passed to the next stream).
- No concurrency. If you want a concurrent processing, you should change the input data as a collection of data manually.

```typescript
import { MapStream } from "utilitystreams";

await pipeline(
  process.stdout,
  new MapStream(
    {
      f: (message: string) => {
        const logObj = {
          timestamp: new Date().toISOString(),
          message: message,
        };
        return JSON.stringify(logObj);
      },
    },
    { objectMode: true },
  ),
  createWriteStream("/path/to/file.log"),
);
```

### FilterStream

Filter input data only passed by the predicate function.

- If the input data is a promise, it will be resolved before passed into the predicate function.
- If the predicate result is a promise, it will be resolved before push the data (passed to the next stream).
- No concurrency. If you want a concurrent processing, you should change the input data as a collection of data manually.

```typescript
import { FilterStream } from "utilitystreams";

await pipeline(
  naturalNumbers,
  new FilterStream(
    {
      f: (num: number): boolean => {
        return num % 2 === 0;
      },
    },
    { objectMode: true },
  ),
  createWriteStream("/even-nums"),
);
```

### takeStreamFactory

Create a wrapped stream that yields at most n data from the source stream.

- support curry style
  - `takeStreamFactory({ n: 10 }, sourceStream)` -> `takeStreamFactory({ n: 10 })(sourceStream)`
- source stream will be closed automatically when wrapped stream is closed.
- it returns async generator that is compatible with readable stream. If you want an exact stream, wrap it with `Readable.from`.

```typescript
import { takeStreamFactory } from "utilitystreams";

await pipeline(
  takeStreamFactory({ n: 10 }, readableStream),
  // ... other streams
  process.stdout,
);
```

### TakeStream

Yield at most n data from the input data.

- **If the source readable stream is large or infinite, you should prepare some end logic or use `takeStreamFactory`.**
  - It's very hard to "end" the stream "pipeline" in the middle.
  - So, I prepare a callback function to do end the source readable stream.
  - You have to prepare some error handling from destroy call or call some custom end logic.

```typescript
import { TakeStream } from "utilitystreams";

await pipeline(
  readableStream,
  // ... other streams
  new TakeStream({ n: 10 }),
  process.stdout,
);
```

### takeWhileStreamFactory

Create a wrapped stream that yields data from the source stream while the predicate function returns true.

- support curry style
  - `takeWhileStreamFactory({ f: predicate }, sourceStream)` -> `takeWhileStreamFactory({ f: predicate })(sourceStream)`
- source stream will be closed automatically when wrapped stream is closed.
- it returns async generator that is compatible with readable stream. If you want an exact stream, wrap it with `Readable.from`.

```typescript
import { takeWhileStreamFactory } from "utilitystreams";

await pipeline(
  takeWhileStreamFactory({ f: predicate }, readableStream),
  // ... other streams
  process.stdout,
);
```

### TakeWhileStream

Yield data while the predicate function returns true.

- **If the source readable stream is large or infinite, you should prepare some end logic or use `takeWhileStreamFactory`. **
  - It's very hard to "end" the stream "pipeline" in the middle.
  - So, I prepare a callback function to do end the source readable stream.
  - You have to prepare some error handling from destroy call or call some custom end logic.

```typescript
import { TakeWhileStream } from "utilitystreams";

await pipeline(
  readableStream,
  // ... other streams
  new TakeWhileStream({ f: predicate }),
  process.stdout,
);
```

### takeUntilStreamFactory

Create a wrapped stream that yields data from the source stream until the predicate function returns true.

- support curry style
  - `takeUntilStreamFactory({ f: predicate }, sourceStream)` -> `takeUntilStreamFactory({ f: predicate })(sourceStream)`
- source stream will be closed automatically when wrapped stream is closed.
- it returns async generator that is compatible with readable stream. If you want an exact stream, wrap it with `Readable.from`.

```typescript
import { takeUntilStreamFactory } from "utilitystreams";

await pipeline(
  takeUntilStreamFactory({ f: predicate }, readableStream),
  // ... other streams
  process.stdout,
);
```

### TakeUntilStream

Yield data until the predicate function returns true.

- **If the source readable stream is large or infinite, you should prepare some end logic or use `takeUntilStreamFactory`. **
  - It's very hard to "end" the stream "pipeline" in the middle.
  - So, I prepare a callback function to do end the source readable stream.
  - You have to prepare some error handling from destroy call or call some custom end logic.

```typescript
import { TakeUntilStream } from "utilitystreams";

await pipeline(
  readableStream,
  // ... other streams
  new TakeUntilStream({ f: predicate }),
  process.stdout,
);
```

### TapStream

Execute the consumer function with input data.

- If the input data is a promise, it will be resolved before passed into the consumer function.
- If the output data is a promise, it will be resolved before push the original data (passed to the next stream).
- No concurrency. If you want a concurrent processing, you should change the input data as a collection of data
  manually.

```typescript
import { TapStream } from "utilitystreams";

await pipeline(
  messages,
  new TapStream(
    {
      f: (message: string) => {
        log.info(message);
      },
    },
    { objectMode: true },
  ),
);
```
