import { execSync } from "child_process";

const commands = [
  "npm run db:create",
  "npm run db:gen",
  "npm run db:migrate",
  "npm run db:seeds",
];

async function runCommands() {
  for (const command of commands) {
    console.log(`Running: ${command}`);
    try {
      execSync(command, { stdio: "inherit" });
      console.log(`Completed: ${command}`);
    } catch (error) {
      console.error(`Error executing ${command}:`, error);
      process.exit(1);
    }
  }
  console.log("All database initialization steps completed successfully.");
}

runCommands();
