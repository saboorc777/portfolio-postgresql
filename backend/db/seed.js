import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { initializeDatabase, query, closeDatabase } from './database.js';
const username=process.env.ADMIN_USERNAME||'admin';
const password=process.env.ADMIN_PASSWORD;
if(!password){throw new Error('Set ADMIN_PASSWORD before running npm run seed.');}
try {
 await initializeDatabase();
 const exists=await query('SELECT id FROM admins WHERE username=$1',[username]);
 if(!exists.rowCount){const hash=await bcrypt.hash(password,10);await query('INSERT INTO admins(username,password_hash) VALUES($1,$2)',[username,hash]);console.log(`Admin user "${username}" created.`);}else console.log(`Admin user "${username}" already exists — skipping.`);
 const pc=Number((await query('SELECT COUNT(*) AS count FROM projects')).rows[0].count);
 if(pc===0){const rows=[
 ['General Store Management System','Desktop-based inventory management system for retail stores, built with C#, SQL Server and the .NET Framework.','Desktop Application',['C#','SQL Server','.NET'],'https://github.com/saboorc777/General-Store-Management',null,null,true],
 ['Car Showroom Management','A luxury, fully responsive car showroom website built with HTML, CSS and JavaScript.','Frontend',['HTML','CSS','JavaScript'],'https://github.com/saboorc777/Web-Development-Projects',null,null,true],
 ['AI Resume Analyzer','Extracts resume content, identifies strengths and weaknesses, and generates personalized recommendations.','AI Application',['Python','CSS','PDF Parsing'],'https://github.com/saboorc777/Ai-Projects',null,null,true]];
 for(const r of rows) await query('INSERT INTO projects(title,description,category,tech,github,live,image,featured) VALUES($1,$2,$3,$4::jsonb,$5,$6,$7,$8)',[r[0],r[1],r[2],JSON.stringify(r[3]),r[4],r[5],r[6],r[7]]);
 console.log('Seeded example projects.');}
 const cc=Number((await query('SELECT COUNT(*) AS count FROM certificates')).rows[0].count);
 if(cc===0){for(const [title,issuer] of [['Frontend Development Internship','Core Tech Innovation'],['Web Development Competition','QUEST Nawabshah'],['CSET 2025','Department of Computer Science, QUEST Nawabshah']]) await query('INSERT INTO certificates(title,issuer) VALUES($1,$2)',[title,issuer]);console.log('Seeded example certificates.');}
 console.log('Seeding complete.');
} finally { await closeDatabase(); }
