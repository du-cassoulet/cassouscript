import chalk from "chalk";
import Value from "./Value";

export default class Dictionary extends Value {
  public entries: { [key: string]: Value };

  constructor(entries: { [key: string]: Value }) {
    super();
    this.entries = entries;
  }

  public isTrue() {
    return Object.keys(this.entries).length > 0;
  }

  public copy() {
    const copy = new Dictionary({ ...this.entries });
    copy.setPos(this.posStart, this.posEnd);
    copy.setContext(this.context);

    return copy;
  }

  public toString() {
    if (Object.keys(this.entries).length === 0) return chalk.black("{}");

    return (
      chalk.black("{ ") +
      Object.entries(this.entries)
        .map(
          ([key, value]) =>
            chalk.green("'" + key + "'") + ": " + value.toString()
        )
        .join(chalk.black(", ")) +
      chalk.black(" }")
    );
  }
}
