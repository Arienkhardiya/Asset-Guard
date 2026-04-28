// Database connection placeholder
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// Note: In a real environment, provide PG_URI or POSTGRES_URL in .env
// We mock connection behavior if env vars are missing to allow preview to run without crashing.
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/assetguard';
const pool = new Pool({
    connectionString: dbUrl,
    // Add SSL if needed for production
});
pool.on('error', (err) => {
    console.log('Postgres connection warning (safe to ignore in preview without db container):', err.message);
});
export const query = async (text, params = []) => {
    try {
        return await pool.query(text, params);
    }
    catch (error) {
        console.error('Database query failed. Simulating response for preview environment.', error);
        return { rows: [] }; // Return mock data if DB is down
    }
};
