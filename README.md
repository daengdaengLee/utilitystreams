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

### ThrottleStream
