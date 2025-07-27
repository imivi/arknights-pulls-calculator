import { z } from "zod";
import "dotenv/config"


const envSchema = z.object({
    GOOGLE_SHEET_ID: z.string(),
    WORKDIR: z.string(),
})


export const env = envSchema.parse(process.env)