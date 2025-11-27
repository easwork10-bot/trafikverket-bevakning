import app from "./app.js";
import { startWatcher } from "./services/watcher.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

startWatcher();
