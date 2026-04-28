import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('FATAL ERROR: DATABASE_URL is missing in environment variables.');
    process.exit(1); // Stop the server if DB URL is not provided to prevent localhost fallback
}
const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});
export const query = (text, params = []) => {
    return pool.query(text, params);
};
export const getClient = () => {
    return pool.connect();
};
