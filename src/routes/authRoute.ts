import express from "express";
import { register, login, logout, userdata } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.get("/login", login);
router.post("/logout", logout);
router.post("/userdata", userdata);

export default router;
