function nowNs() {
  return process.hrtime.bigint();
}

function nsToMs(ns) {
  return Number(ns) / 1_000_000;
}

export function createPerf() {
  const starts = new Map();
  const durations = Object.create(null);

  return {
    start(name) {
      starts.set(name, nowNs());
    },
    end(name) {
      const start = starts.get(name);
      if (!start) return;
      const elapsed = nowNs() - start;
      durations[name] = (durations[name] ?? 0) + nsToMs(elapsed);
      starts.delete(name);
    },
    async measure(name, fn) {
      this.start(name);
      try {
        return await fn();
      } finally {
        this.end(name);
      }
    },
    getDurations() {
      return { ...durations };
    }
  };
}

