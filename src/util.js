/**
 *
 * @param {number} waitMs
 * @returns {Promise<void>}
 */
exports.delay = function delay(waitMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitMs);
  });
};
