import { Router } from 'express';
import { query } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
const router=Router();const PHOTO_KEY='profile_photo';
router.get('/',async(_req,res,next)=>{try{const r=await query('SELECT value FROM settings WHERE key=$1',[PHOTO_KEY]);res.json({photoUrl:r.rows[0]?.value??null});}catch(e){next(e);}});
router.post('/photo',requireAuth,upload.single('photo'),async(req,res,next)=>{try{if(!req.file)return res.status(400).json({message:'No image uploaded or invalid file type.'});const url=`/uploads/${req.file.filename}`;await query('INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',[PHOTO_KEY,url]);res.json({photoUrl:url});}catch(e){next(e);}});
export default router;
