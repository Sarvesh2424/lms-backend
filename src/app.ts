import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { errorMiddleware } from "./middlewares/error.middleware";
import routes from "./routes/index";
import cookieparser from "cookie-parser";
export const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "30gb" })); // Enforce max request size
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(cookieparser());
// Health check
app.get("/health", async (_, res) => {
  const mongoState = mongoose.connection.readyState;
  let dbReachable = false;

  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbReachable = true;
    }
  } catch {
    dbReachable = false;
  }

  res.status(mongoState === 1 && dbReachable ? 200 : 500).json({
    status: mongoState === 1 && dbReachable ? "OK" : "ERROR",
    mongoConnection: mongoState, // 1 = connected
    dbReachable,
  });
});

app.use("/api", routes);
app.use(errorMiddleware);
