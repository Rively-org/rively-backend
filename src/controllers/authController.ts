import client from "../lib/db"; // Import the MongoDB client
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new user
export async function register(req: Request, res: Response) {
  try {
    const db = client.db(process.env.MONGO_DEFAULT_DB);
    const usersCollection = db.collection('users');

    // CHECK EXISTING USER
    const existingUser = await usersCollection.findOne({ email: req.body.email });
    if (existingUser) {
      return res.send("User already exists");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // INSERT NEW USER
    const result = await usersCollection.insertOne({
      email: req.body.email,
      password: hash,
      created_at: new Date(),
    });

    res.status(200).json(result.insertedId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
}

// Login a user
export async function login(req: Request, res: Response) {
  try {
    console.log("enter")
    const db = client.db(process.env.MONGO_DEFAULT_DB);
    const usersCollection = db.collection('users');

    // CHECK USER
    const user = await usersCollection.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json("User does not exist");
    }

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordCorrect) {
      console.log("wrong password")
      return res.status(400).json("Wrong username or password!");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "jwtkey");
    const { password, ...other } = user;
    console.log(token);

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
}

// Logout a user
export async function logout(req: Request, res: Response) {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
}

// Add user details
export async function userdata(req: Request, res: Response) {
  try {
    const db = client.db(process.env.MONGO_DEFAULT_DB);
    const userDetailsCollection = db.collection('user_details');
    const companyCollection = db.collection('company');

    // INSERT USER DETAILS
    await userDetailsCollection.insertOne({
      uid: req.body.uid,
      name: req.body.name,
      role: req.body.role,
      company: req.body.company,
      site: req.body.site,
    });

    // INSERT COMPANY DETAILS
    await companyCollection.updateOne(
      { company_name: req.body.company },
      { $set: { company_name: req.body.company, company_site: req.body.site } },
      { upsert: true }
    );

    return res.status(200).json("User Details Added");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user details");
  }
}

