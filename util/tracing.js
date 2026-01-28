import { inspect } from "node:util";

export class Tracing {
  pf = {};
  constructor(level) {
    this.level = level;
  }
  should(level) {
    const t = [
      Level.Debug,
      Level.Perf,
      Level.Info,
      Level.Warn,
      Level.Error,
      Level.Fatal,
    ];
    return t.indexOf(level) >= t.indexOf(this.level);
  }

  print(level, contents) {
    if (!this.should(level)) {
      return;
    }

    const label = this.t;

    console.log(
      `\x1b[30m${new Date().toISOString()}\x1b[0m ${
        label ? label + " " : ""
      }${this.label(level)} ${contents.map((x) => this.str(x)).join(" ")}`
    );

    this.t = undefined;
  }

  str(t) {
    if (typeof t === "string") {
      return t;
    }
    return inspect(t);
  }

  label(level) {
    switch (level) {
      case Level.Debug:
        return "\x1b[34mDEBUG\x1b[0m";
      case Level.Perf:
        return "\x1b[36m PERF\x1b[0m";
      case Level.Info:
        return "\x1b[32m INFO\x1b[0m";
      case Level.Warn:
        return "\x1b[33m WARN\x1b[0m";
      case Level.Error:
        return "\x1b[31mERROR\x1b[0m";
      case Level.Fatal:
        return "\x1b[1;31mFATAL\x1b[0m";
    }
  }

  debug(...contents) {
    this.print(Level.Debug, contents);
  }

  info(...contents) {
    this.print(Level.Info, contents);
  }

  warn(...contents) {
    this.print(Level.Warn, contents);
  }

  error(...contents) {
    this.print(Level.Error, contents);
  }

  fatal(...contents) {
    this.print(Level.Fatal, contents);
    process.exit();
  }

  perf(label) {
    if (label in this.pf) {
      this.print(Level.Perf, [
        `task ${this.tag(label)} finished in \x1b[33m${
          Date.now() - this.pf[label]
        }ms\x1b[0m`,
      ]);
      delete this.pf[label];
    } else {
      this.pf[label] = Date.now();
      this.print(Level.Perf, [`task ${this.tag(label)} started`]);
    }
  }

  tag(s) {
    return `\x1b[35m${this.str(s)}\x1b[0m`;
  }

  t;
  thread(s) {
    // return a copy
    const t = new Tracing(this.level);
    t.t = s;
    return t;
  }

  safe(e) {
    this.error(e);
  }
}
export const Level = {
  Debug: "DEBUG",
  Perf: "PERF",
  Info: "INFO",
  Warn: "WARN",
  Error: "ERROR",
  Fatal: "FATAL",
}

export const tracing = new Tracing(
  Level.Info
);
