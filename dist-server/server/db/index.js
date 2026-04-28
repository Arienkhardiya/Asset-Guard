import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('WARNING: DATABASE_URL is missing in environment variables. Database operations will fail.');
}
const pool = new Pool({
    connectionString: dbUrl || 'postgresql://postgres:postgres@invalid.local/postgres', // Use dummy string if missing so it doesn't crash on init
    ssl: { rejectUnauthorized: false }
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
});
export async function connectDB() {
    try {
        if (!dbUrl)
            throw new Error("DATABASE_URL is not defined");
        const client = await pool.connect();
        console.log("DB connected successfully");
        client.release();
    }
    catch (err) {
        console.error("DB connection failed:", err.message);
    }
}
// Initialize connection test but do not crash if it fails
connectDB();
export const query = (text, params = []) => {
    return pool.query(text, params);
};
export const getClient = () => {
    return pool.connect();
};
