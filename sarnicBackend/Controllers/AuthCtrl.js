import { pool } from "../Config/dbConnect.js";
import bcrypt from "bcrypt";
import fs from "fs";
import cloudinary from "../cloudinary/cloudinary.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { buildTenantCondition } from "../helpers/tenantHelper.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login Request:", email);
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found, please contact admin"
            });
        }
        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(403).json({
                success: false,
                message: "Invalid password"
            });
        }
        const companyId = user.company_id ?? null;
        
        // Generate short-lived access token and long-lived refresh token
        const token = generateAccessToken(user.id, user.role_name, companyId);
        const refreshToken = generateRefreshToken(user.id, user.role_name, companyId);

        // Store refresh token securely in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
        await pool.query(
          "INSERT INTO user_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
          [user.id, refreshToken, expiresAt]
        );

        return res.status(200).json({
            success: true,
            message: `${user.role_name} login successful`,
            token,
            refreshToken,
            role: user.role_name,
            data: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                role_name: user.role_name,
                image: user.image,
                company_id: companyId,
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    // 1. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // 2. Check token in DB
    const [stored] = await pool.query(
      "SELECT * FROM user_refresh_tokens WHERE token = ? AND expires_at > NOW()",
      [refreshToken]
    );

    if (stored.length === 0) {
      // Potential token reuse/theft detection: wipe user refresh tokens to force complete login
      await pool.query("DELETE FROM user_refresh_tokens WHERE user_id = ?", [decoded.id]);
      return res.status(401).json({ success: false, message: "Session compromised or expired. Please login again." });
    }

    // 3. Verify user still exists in DB
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "User does not exist" });
    }
    const user = users[0];

    // 4. Generate rotated new tokens
    const companyId = user.company_id ?? null;
    const newAccessToken = generateAccessToken(user.id, user.role_name, companyId);
    const newRefreshToken = generateRefreshToken(user.id, user.role_name, companyId);

    // 5. Delete old refresh token from DB (Rotation)
    await pool.query("DELETE FROM user_refresh_tokens WHERE id = ?", [stored[0].id]);

    // 6. Save new refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await pool.query(
      "INSERT INTO user_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, newRefreshToken, expiresAt]
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query("DELETE FROM user_refresh_tokens WHERE token = ?", [refreshToken]);
    }
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const validateSession = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const [rows] = await pool.query(
      "SELECT id, role_name, company_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Session invalid: User no longer exists" });
    }

    next();
  } catch (error) {
    console.error("Session Validation Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      password,
      state,
      country,
      role_name,
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const [exist] = await pool.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (exist.length > 0) {
      return res.status(403).json({ message: "User already exists" });
    }

    let image = null;

    if (req.files?.file) {
      const result = await cloudinary.uploader.upload(
        req.files.file.tempFilePath,
        { folder: "user_image" }
      );

      image = result.secure_url;
      fs.unlinkSync(req.files.file.tempFilePath);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const companyId = req.user?.companyId ?? req.body.company_id ?? null;

    const [response] = await pool.query(
      `INSERT INTO users
      (first_name,last_name,email,phone_number,password,state,country,role_name,image,company_id)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        hashPassword,
        state,
        country,
        role_name,
        image,
        companyId,
      ]
    );

    res.status(200).json({
      success: true,
      message: "User created successfully",
      id: response.insertId,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
    try {
        const { sql, params } = buildTenantCondition(req.tenant, [], "users");
        const [rows] = await pool.query(
            `SELECT id,first_name,last_name,email,phone_number,
                    state,country,role_name,image,created_at,updated_at,company_id
             FROM users WHERE ${sql}`
        , params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { sql, params } = buildTenantCondition(req.tenant, [id], "users");

        const [rows] = await pool.query(
            `SELECT * FROM users WHERE id=? AND ${sql}`,
            params
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, data: rows[0] });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { sql, params } = buildTenantCondition(req.tenant, [id], "users");

        const [exist] = await pool.query(
            `SELECT id FROM users WHERE id=? AND ${sql}`,
            params
        );

        if (exist.length === 0) {
            return res.status(403).json({ message: "User not found or access denied" });
        }

        const {
            first_name,
            last_name,
            phone_number,
            state,
            country,
            role_name
        } = req.body;

        let image;
        if (req.files && req.files.file) {
            const upload = await cloudinary.uploader.upload(
                req.files.file.tempFilePath,
                { folder: "user_image" }
            );
            image = upload.secure_url;
            fs.unlinkSync(req.files.file.tempFilePath);
        }

        await pool.query(
            `UPDATE users SET
            first_name=?,
            last_name=?,
            phone_number=?,
            state=?,
            country=?,
            role_name=?,
            image=COALESCE(?,image)
            WHERE id=?`,
            [
                first_name,
                last_name,
                phone_number,
                state,
                country,
                role_name,
                image,
                id
            ]
        );
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { sql, params } = buildTenantCondition(req.tenant, [id], "users");

        const [exist] = await pool.query(
            `SELECT id FROM users WHERE id=? AND ${sql}`,
            params
        );

        if (exist.length === 0) {
            return res.status(403).json({ message: "User not found or access denied" });
        }

        await pool.query("DELETE FROM users WHERE id=?", [id]);

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { sql, params } = buildTenantCondition(req.tenant, [id], "users");

    const [exist] = await pool.query(
        `SELECT id FROM users WHERE id=? AND ${sql}`,
        params
    );

    if (exist.length === 0) {
        return res.status(403).json({ message: "User not found or access denied" });
    }

    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password=? WHERE id=?",
      [hash, id]
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductionUsers = async (req, res) => {
  try {
    const { sql, params } = buildTenantCondition(req.tenant, ["production"], "users");
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number,
              state, country, role_name, image, created_at, updated_at, company_id
       FROM users
       WHERE role_name = ? AND ${sql}`,
      params
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeUsers = async (req, res) => {
  try {
    const { sql, params } = buildTenantCondition(req.tenant, ["employee"], "users");
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number,
              state, country, role_name, image, created_at, updated_at, company_id
       FROM users
       WHERE role_name = ? AND ${sql}`,
      params
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
