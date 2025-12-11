import { keepAlive } from "./src/automation/keepAlive.js";

const result = await keepAlive(1);
console.log("KEEP ALIVE RESULT:", result);
