import pg from "pg";
require('dotenv').config();

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
});

// Function to create the tables
const createTables = async () => {
  const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            uid SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  const createUserDetailsTableQuery = `
        CREATE TABLE IF NOT EXISTS user_details (
            uid INTEGER REFERENCES users(uid) ON DELETE CASCADE,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            company TEXT NOT NULL,
            site TEXT NOT NULL
        );
    `;

  const createUserInterestsTableQuery = `
        CREATE TABLE IF NOT EXISTS user_interests (
            uid INTEGER REFERENCES users(uid) ON DELETE CASCADE,
            interest TEXT NOT NULL
        );
    `;

  const createCompanyTableQuery = `
        CREATE TABLE IF NOT EXISTS company (
           company_id SERIAL PRIMARY KEY,
           company_name TEXT NOT NULL,
           company_site TEXT NOT NULL
        );
    `;

  const createUserCompetitorsTableQuery = `
      CREATE TABLE IF NOT EXISTS user_competitors (
           uid INTEGER REFERENCES users(uid) ON DELETE CASCADE,
           company_id INTEGER REFERENCES company(company_id) ON DELETE CASCADE
      );
    `;

  try {
    await pool.query(createCompanyTableQuery);
    await pool.query(createUsersTableQuery);
    await pool.query(createUserDetailsTableQuery);
    await pool.query(createUserInterestsTableQuery);
    await pool.query(createUserCompetitorsTableQuery);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
//.then(() => pool.end()) // Close the pool after the operation
//.catch((error) => {
//  console.error("Error during table creation:", error);
//  pool.end();
//});
export default pool;
