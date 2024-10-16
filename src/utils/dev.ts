import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Determine if we're in development mode based on NODE_ENV
 * Be careful when using this, it can create bugs that only exist in one environment or the other
 */
export const isDev = process.env['NODE_ENV'] !== 'production';
