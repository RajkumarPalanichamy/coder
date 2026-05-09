/**
 * Runs on server module load (import from layout) before next/font and RSC tree.
 * See src/instrumentation.js for rationale.
 */
if (typeof window === 'undefined') {
  const g = globalThis;
  const make = () => {
    const map = new Map();
    return {
      getItem(key) {
        return map.has(String(key)) ? map.get(String(key)) : null;
      },
      setItem(key, value) {
        map.set(String(key), String(value));
      },
      removeItem(key) {
        map.delete(String(key));
      },
      clear() {
        map.clear();
      },
      key(index) {
        const keys = Array.from(map.keys());
        return keys[index] ?? null;
      },
      get length() {
        return map.size;
      },
    };
  };
  for (const name of ['localStorage', 'sessionStorage']) {
    const cur = g[name];
    if (cur == null || typeof cur.getItem !== 'function') {
      g[name] = make();
    }
  }
}
