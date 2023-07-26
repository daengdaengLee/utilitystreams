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
    this.waitMs = waitMs;
    this.lastTransform = Promise.resolve();
  }

  _transform(chunk, encoding, callback) {
    this.lastTransform = Promise.all([delay(this.waitMs), this.lastTransform])
      .then(() => {
        callback(null, chunk);
      })
      .catch((error) => {
        callback(error);
      });
  }

  _flush(callback) {
    this.lastTransform.then(() => {
      callback();
    });
  }
};
