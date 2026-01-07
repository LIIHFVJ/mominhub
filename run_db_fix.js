import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace(':6543', ':5432');

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = postgres(connectionString);

async function runFix() {
  try {
    const sqlPath = path.resolve('fix_preferences_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL from fix_preferences_schema.sql...');
    
    // Split by semicolon to execute commands if needed, 
    // but postgres-js can handle multi-statement strings if configured, 
    // or we can just send the whole thing.
    await sql.unsafe(sqlContent);
    
    console.log('✅ Successfully applied schema fixes and reloaded PostgREST cache.');
  } catch (error) {
    console.error('❌ Error applying schema fixes:', error);
  } finally {
    await sql.end();
  }
}

runFix();
