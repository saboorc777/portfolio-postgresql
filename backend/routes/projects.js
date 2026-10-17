import { Router } from 'express';
import { query } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
const router = Router();
function serialize(row) { return { ...row, tech: Array.isArray(row.tech) ? row.tech : JSON.parse(row.tech || '[]'), featured: Boolean(row.featured) }; }
router.get('/', async (_req, res, next) => { try { const r = await query('SELECT * FROM projects ORDER BY featured DESC, created_at DESC'); res.json(r.rows.map(serialize)); } catch(e){next(e);} });
router.post('/upload', requireAuth, upload.single('image'), (req,res)=>{ if(!req.file) return res.status(400).json({message:'No image uploaded or invalid file type.'}); res.json({url:`/uploads/${req.file.filename}`}); });
router.post('/', requireAuth, async (req,res,next)=>{
 try {
  const {title,description,category,tech,github,live,image,featured}=req.body;
  if(!title||!description||!category) return res.status(400).json({message:'title, description and category are required.'});
  const r=await query(`INSERT INTO projects (title,description,category,tech,github,live,image,featured) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8) RETURNING *`,[title,description,category,JSON.stringify(tech||[]),github||null,live||null,image||null,Boolean(featured)]);
  res.status(201).json(serialize(r.rows[0]));
 } catch(e){next(e);}
});
router.put('/:id', requireAuth, async (req,res,next)=>{
 try {
  const old=(await query('SELECT * FROM projects WHERE id=$1',[req.params.id])).rows[0];
  if(!old) return res.status(404).json({message:'Project not found.'});
  const {title,description,category,tech,github,live,image,featured}=req.body;
  const r=await query(`UPDATE projects SET title=$1,description=$2,category=$3,tech=$4::jsonb,github=$5,live=$6,image=$7,featured=$8 WHERE id=$9 RETURNING *`,[
   title??old.title,description??old.description,category??old.category,JSON.stringify(tech??old.tech),github??old.github,live??old.live,image??old.image,featured===undefined?old.featured:Boolean(featured),req.params.id]);
  res.json(serialize(r.rows[0]));
 } catch(e){next(e);}
});
router.delete('/:id', requireAuth, async(req,res,next)=>{try{const r=await query('DELETE FROM projects WHERE id=$1',[req.params.id]);if(!r.rowCount)return res.status(404).json({message:'Project not found.'});res.status(204).end();}catch(e){next(e);}});
export default router;
