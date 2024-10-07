import { MongoClient } from "mongodb";
require('dotenv').config();

// MongoDB connection
const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_DB}`;

const client = new MongoClient(url);

// Database name
const dbName = "mydatabase";

// Function to create collections
const createCollections = async () => {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const db = client.db(dbName);
    console.log(`Using database: ${db.databaseName}`);

    // Create users collection with unique index on email
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("Users collection created with unique index on email.");

    // Create user_details collection and insert a dummy document
    await db.collection('user_details').insertOne({ dummy: "data" });
    console.log("User_details collection created.");

    // Create user_interests collection and insert a dummy document
    await db.collection('user_interests').insertOne({ dummy: "data" });
    console.log("User_interests collection created.");

    // Create company collection with unique index on company_name
    const companyCollection = db.collection('company');
    await companyCollection.createIndex({ company_name: 1 }, { unique: true });
    console.log("Company collection created with unique index on company_name.");

    // Create user_competitors collection and insert a dummy document
    await db.collection('user_competitors').insertOne({ dummy: "data" });
    console.log("User_competitors collection created.");

    console.log("All collections created successfully.");
  } catch (error) {
    console.error("Error creating collections:", error);
  } 
};

// Call the function to create the collections
createCollections();

export default client;

