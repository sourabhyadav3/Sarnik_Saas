-- Phase 1 SaaS foundation (run once on sarniksaas database)
-- Backward compatible: does not modify company_information or existing role data

-- Tenant companies (isolated from admin company_information settings)
CREATE TABLE IF NOT EXISTS saas_companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_saas_slug (slug)
);

-- Optional tenant link on users (nullable — existing rows stay valid)
-- If column already exists, skip this statement manually
ALTER TABLE users ADD COLUMN company_id INT NULL DEFAULT NULL;

-- Example superadmin user (change email/password before production)
-- Password: SuperAdmin@123 (bcrypt hash below is for that password)
-- INSERT INTO users (first_name, last_name, email, phone_number, password, state, country, role_name, company_id)
-- VALUES ('Super', 'Admin', 'superadmin@sarnik.com', NULL,
-- '$2b$10$YourBcryptHashHere', NULL, NULL, 'superadmin', NULL);
