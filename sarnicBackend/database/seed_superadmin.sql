-- Seed superadmin user (password: SuperAdmin@123)
-- Run after phase1_saas_migration.sql

INSERT INTO users (first_name, last_name, email, phone_number, password, state, country, role_name, company_id)
SELECT 'Super', 'Admin', 'superadmin@sarnik.com', NULL,
  '$2b$10$SUwS8xBmG/DB0SsPDaGCZ.0aoJcoeCrfYmEzgaZ5xMCHv.cm.Llui',
  NULL, NULL, 'superadmin', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'superadmin@sarnik.com'
);
