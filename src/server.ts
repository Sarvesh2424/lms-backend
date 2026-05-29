import { app } from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/env";

async function startServer() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}
startServer();
// startCleanupScheduler();
