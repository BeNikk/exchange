import dotenv from 'dotenv';
dotenv.config();

export const emailKey = process.env.RESEND_KEY!;
export const JWT_SECRET = process.env.JWT_SECRET!;
