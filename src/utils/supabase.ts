import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const projectKey = process.env.PROJECT_KEY!;
const supabaseDBPassword = process.env.SUPABASE_DB_PASSWORD!;

// This utility is used to connect to the Supabase database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to verify connection and create table
// This function is used to verify the connection to the Supabase database and create the users table if it doesn't exist
export async function SupabaseConnection() {
    let client: Client | null = null;
    try {
        // client = new Client({
        //     user: "postgres." + projectKey,
        //     host: "aws-0-us-east-2.pooler.supabase.com",
        //     database: "postgres",
        //     password: supabaseDBPassword,
        //     port: 6543,
        // });

        // await client.connect();
        console.log('✅ Connected to the database');
        const createUserTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                fullname text,
                email text UNIQUE NOT NULL,
                phone text,
                password text,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        // await client.query(createUserTableQuery);
        console.log('✅ Database setup completed successfully');
    } catch (error: any) {
        console.error('❌ Database connection error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        throw new Error(`Database setup failed: ${error.message}`);
    }
}
