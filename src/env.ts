import { z } from "zod";
import "dotenv/config"


const envSchema = z.object({
    GOOGLE_SHEET_ID: z.string(),
    VITE_UMAMI_WEBSITE_ID: z.string(),
    VITE_UMAMI_SCRIPT: z.string(),
})


export const env = envSchema.parse(process.env)