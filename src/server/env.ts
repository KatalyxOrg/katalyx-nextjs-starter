import { z } from "zod";

const optionalApiKey = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, {
    message: "BETTER_AUTH_SECRET doit contenir au moins 32 caractères (générer avec `openssl rand -base64 32`).",
  }),
  OPENAI_API_KEY: optionalApiKey,
  ANTHROPIC_API_KEY: optionalApiKey,
  DEFAULT_MODEL_ID: optionalApiKey,
});

export const env = envSchema.parse(process.env);
