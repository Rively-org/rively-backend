import express from "express";
import { home } from "../controllers/userController";

const router = express.Router();

router.get("/home", home);

export default router;
