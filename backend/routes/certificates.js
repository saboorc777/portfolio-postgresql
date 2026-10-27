import express from "express";
import pool from "../db/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinaryHelper.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM certificates ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching certificates." });
  }
});

router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { title, issuer, issue_date, credential_url } = req.body;
    let image_url = req.body.image_url || "";
    let cloudinary_id = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, "portfolio/certificates");
      image_url = uploaded.url;
      cloudinary_id = uploaded.public_id;
    }

    const { rows } = await pool.query(
      "INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url, cloudinary_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, issuer, issue_date, credential_url, image_url, cloudinary_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error creating certificate." });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM certificates WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Certificate not found." });

    if (rows[0].cloudinary_id) {
      await deleteFromCloudinary(rows[0].cloudinary_id);
    }

    await pool.query("DELETE FROM certificates WHERE id = $1", [id]);
    res.json({ message: "Certificate deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting certificate." });
  }
});

export default router;
