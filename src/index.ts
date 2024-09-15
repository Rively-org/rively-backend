import express, { Request, Response } from "express";
import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/userRoute";
import cookieParser from 'cookie-parser';
import cors from "cors";
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/user", userRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(8000, () => {
  console.log("listening on port 8000");
});
