import { z } from "zod";
import "dotenv/config"


const envSchema = z.object({
    GOOGLE_SHEET_ID: z.string(),
    ASSETS_BASE_URL: z.string().default("/"),
})


export const env = envSchema.parse(process.env)