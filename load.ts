import { run } from "./index";
import chalk from "chalk";

const filePath = process.argv[2];

if (filePath) {
  const file = Bun.file(filePath);

  // try {
  const ftxt = await file.text();
  const path = filePath.split(/\/|\\{2}/g);

  if (ftxt) {
    const start = process.hrtime();
    const { error } = run(path[path.length - 1], ftxt);
    const stop = process.hrtime(start);
    const executionTime = (stop[0] * 1e9 + stop[1]) / 1e6;

    console.log(chalk.black(`\nExecuted in ${executionTime.toFixed(3)}ms.`));

    if (error) {
      console.log(error.toString());
    }
  }
  // } catch {
  // 	console.log(`No such file or directory '${filePath}'.`);
  // }
} else {
  console.log("You must specify a file path.");
}
