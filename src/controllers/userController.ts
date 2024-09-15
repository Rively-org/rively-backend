import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "../lib/db";

// Use environment variable for secret key
const secretKey = process.env.JWT_SECRET_KEY || "jwtkey";

export async function home(req: Request, res: Response) {
  // Ensure req.cookies is available and contains access_token
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, secretKey, (err: any, decoded: JwtPayload | undefined) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }

    if (decoded) {
      // Assuming `decoded` contains an `id` property
      const userId = (decoded as any).id; // Cast `decoded` to `any` to access `id`

      console.log(userId); // Logs the user ID from the token
      res.send("JWT verified");
    } else {
      return res.status(403).json("Token is not valid!");
    }
  });
}

