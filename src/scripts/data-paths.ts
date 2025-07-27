import { env } from "../env"

export const dataPaths = {
    rawGoogleSheet: env.WORKDIR + "src/data/raw_google_sheet.json",
    dailyResources: env.WORKDIR + "src/data/daily_resources.json",
    eventImages: env.WORKDIR + "public/events",
    imageColors: env.WORKDIR + "src/data/image-colors.json",
}

console.info("Using data paths:", dataPaths)