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

### TakeStream

Take only n data from the input data.

- **If the source readable stream is large or infinite, you should prepare some end logic.**
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
