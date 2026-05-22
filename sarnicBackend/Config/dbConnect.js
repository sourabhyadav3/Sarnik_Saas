import dotenv from "dotenv";
import { JSONCookie } from "cookie-parser";
import { query } from "express";
import mysql from "mysql2/promise";

dotenv.config();

// Ensure environment variable sanity
checkRequiredEnv();

export const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  port: Number(process.env.MYSQLPORT) || 3306,
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "sarniksaas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

// Check connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Successfully connected to MySQL database (${process.env.MYSQLDATABASE || "sarniksaas"})`);
    connection.release();

    // Run self-healing multi-tenant & security migration
    await initTenantDbSchema();
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
})();

function checkRequiredEnv() {
  const critical = ["JWT_SECRET", "MYSQLDATABASE"];
  const missing = [];
  for (const envVar of critical) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  if (missing.length > 0) {
    console.warn(`⚠️  WARNING: Missing critical environment variables: ${missing.join(", ")}`);
    if (missing.includes("JWT_SECRET")) {
      console.warn("🛡️  Falling back to a safe development JWT secret key.");
      process.env.JWT_SECRET = "default_fallback_super_secret_key_123456789";
    }
  }
}

async function initTenantDbSchema() {
  const tables = [
    "users",
    "projects",
    "jobs",
    "assign_jobs",
    "time_work_logs",
    "brand_names",
    "sub_brands",
    "flavours",
    "pack_types",
    "pack_codes",
    "clients_suppliers",
    "estimates",
    "invoices",
    "purchase_orders"
  ];

  const dbName = process.env.MYSQLDATABASE || "sarniksaas";
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("⏳ Starting self-healing Phase 2 Multi-Tenant Database Migration...");
    
    // 1. Add company_id columns if missing
    for (const table of tables) {
      const [cols] = await connection.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'company_id'`,
        [dbName, table]
      );

      if (cols.length === 0) {
        console.log(`🔧 Adding company_id to table: ${table}...`);
        await connection.query(
          `ALTER TABLE \`${table}\` ADD COLUMN company_id INT NULL DEFAULT NULL`
        );
        console.log(`✅ Successfully added company_id to table: ${table}`);
      }
    }
    console.log("✅ Phase 2 Multi-Tenant Database Migration Completed successfully.");

    // 2. Initialize security-related tables
    console.log("⏳ Initializing security tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(token)
      )
    `);
    console.log("✅ user_refresh_tokens table verified.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_email VARCHAR(100) NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        company_id INT NULL,
        details TEXT NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ audit_logs table verified.");

  } catch (err) {
    console.error("❌ Self-healing Database Migration failed:", err.message);
  } finally {
    if (connection) connection.release();
  }
}
