const { Transform } = require("node:stream");
const { delay } = require("./util");

exports.DelayStream = class DelayStream extends Transform {
  /**
   *
   * @param {number} waitMs
   * @param {import("node:stream").TransformOptions} [options]
   */
  constructor(waitMs, options) {
    super(options);
    this._waitMs = waitMs;
    this._queue = [];
    this._flushCallback = null;
  }

  _transform(chunk, encoding, callback) {
    const task = {
      done: false,
      value: { chunk: chunk, encoding: encoding },
    };
    this._queue.push(task);
    delay(this._waitMs).then(() => {
      task.done = true;
      this._tick();
    });
    callback();
  }

  _flush(callback) {
    this._flushCallback = callback;
    this._tick();
  }

  _tick() {
    let task = this._queue.at(0);
    while (task != null && task.done) {
      this.push(task.value.chunk, task.value.encoding);
      this._queue.shift();
      task = this._queue.at(0);
    }

    if (this._queue.length === 0 && this._flushCallback !== null) {
      this._flushCallback();
    }
  }
};
