import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/database.js';
const router = Router();
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) { next(err); }
});
export default router;
