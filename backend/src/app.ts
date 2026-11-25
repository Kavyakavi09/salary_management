import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import departmentRouter from "./routes/departmentRoutes";
import employeeRouter from "./routes/employeeRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(helmet());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is Healthy",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/employees", employeeRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
