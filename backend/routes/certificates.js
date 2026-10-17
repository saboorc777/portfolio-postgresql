import { Router } from 'express';
import { query } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
const router=Router();
function serialize(row){const {file_url,...rest}=row;return {...rest,fileUrl:file_url};}
router.get('/',async(_req,res,next)=>{try{const r=await query('SELECT * FROM certificates ORDER BY created_at DESC');res.json(r.rows.map(serialize));}catch(e){next(e);}});
router.post('/upload',requireAuth,upload.single('image'),(req,res)=>{if(!req.file)return res.status(400).json({message:'No image uploaded or invalid file type.'});res.json({url:`/uploads/${req.file.filename}`});});
router.post('/',requireAuth,async(req,res,next)=>{try{const {title,issuer,image,fileUrl}=req.body;if(!title||!issuer)return res.status(400).json({message:'title and issuer are required.'});const r=await query('INSERT INTO certificates (title,issuer,image,file_url) VALUES ($1,$2,$3,$4) RETURNING *',[title,issuer,image||null,fileUrl||null]);res.status(201).json(serialize(r.rows[0]));}catch(e){next(e);}});
router.put('/:id',requireAuth,async(req,res,next)=>{try{const old=(await query('SELECT * FROM certificates WHERE id=$1',[req.params.id])).rows[0];if(!old)return res.status(404).json({message:'Certificate not found.'});const {title,issuer,image,fileUrl}=req.body;const r=await query('UPDATE certificates SET title=$1,issuer=$2,image=$3,file_url=$4 WHERE id=$5 RETURNING *',[title??old.title,issuer??old.issuer,image??old.image,fileUrl??old.file_url,req.params.id]);res.json(serialize(r.rows[0]));}catch(e){next(e);}});
router.delete('/:id',requireAuth,async(req,res,next)=>{try{const r=await query('DELETE FROM certificates WHERE id=$1',[req.params.id]);if(!r.rowCount)return res.status(404).json({message:'Certificate not found.'});res.status(204).end();}catch(e){next(e);}});
export default router;
