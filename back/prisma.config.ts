import 'dotenv/config'; 
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // This is where the magic happens! It pulls from your .env file
    url: env('DATABASE_URL'),
  },
});