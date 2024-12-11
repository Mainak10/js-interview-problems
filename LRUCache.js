/**
 * @param {number} capacity
 */
var LRUCache = function (capacity) {
  this.cacheSize = capacity;
  this.cache = new Map();
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) return -1;
  const cachedValue = this.cache.get(key);
  this.cache.delete(key);
  this.put(key, cachedValue);
  return cachedValue;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  if (!this.cache.has(key)) {
    if (this.cache.size < this.cacheSize) this.cache.set(key, value);
    else {
      for (const [cacheKey] of this.cache) {
        this.cache.delete(cacheKey);
        break;
      }
      this.cache.set(key, value);
    }
  } else {
    this.cache.delete(key);
    this.cache.set(key, value);
  }
};
const lRUCache = new LRUCache(2);
console.log(lRUCache.put(2, 1));
console.log(lRUCache.put(1, 1));
console.log(lRUCache.put(2, 3));
console.log(lRUCache.put(4, 1));
console.log(lRUCache.get(1));
console.log(lRUCache.get(2));
// console.log(lRUCache.put(3, 3));
// console.log(lRUCache.get(2));
// console.log(lRUCache.put(4, 4));
// console.log(lRUCache.get(1));
// console.log(lRUCache.get(3));
// console.log(lRUCache.get(4));
