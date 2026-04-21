import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export default env;
