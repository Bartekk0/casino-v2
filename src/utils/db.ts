import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	port: parseInt(process.env.DATABASE_PORT ?? '5432'),
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});
