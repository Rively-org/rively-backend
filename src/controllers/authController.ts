import pool from "../lib/db";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req: Request, res: Response) {
  //CHECK EXISTING USER

  const r = await pool.query("SELECT * FROM users WHERE email=$1;", [
    req.body.email,
  ]);
  console.log(r.rows);
  if (r.rowCount != 0) {
    return res.send("user exist");
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  await pool.query("INSERT INTO users (email,password) VALUES ($1,$2);", [
    req.body.email,
    hash,
  ]);

  const result = await pool.query("SELECT * FROM users WHERE email = $1;", [
    req.body.email,
  ]);

  res.status(200).json(result.rows[0].uid);
  return;
}

export async function login(req: Request, res: Response) {
  //CHECK USER

  const r = await pool.query("SELECT * FROM users WHERE email = $1", [
    req.body.email,
  ]);

  if (r.rowCount == 0) {
    return res.status(400).json("User does not exist");
  }

  const isPasswordCorrect = bcrypt.compareSync(
    req.body.password,
    r.rows[0].password,
  );

  if (!isPasswordCorrect)
    return res.status(400).json("Wrong username or password!");

  const token = jwt.sign({ id: r.rows[0].uid }, "jwtkey");
  const { password, ...other } = r.rows[0];

  console.log(token);

  res
    .cookie("access_token", token, {
      httpOnly: true,
    })
    .status(200)
    .json(other);
}

export async function logout(req: Request, res: Response) {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
}

export async function userdata(req: Request, res: Response) {
  await pool.query(
    "INSERT INTO user_details (uid , name , role , company , site) VALUES ($1,$2,$3,$4,$5);",
    [
      req.body.uid,
      req.body.name,
      req.body.role,
      req.body.company,
      req.body.site,
    ],
  );

  await pool.query(
    "INSERT INTO company (company_name, company_site) VALUES ($1,$2);",
    [req.body.company, req.body.site],
  );

  return res.status(200).json("User Details Added");
}
