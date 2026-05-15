import fs from "fs"
import { Vibrant } from "node-vibrant/node"
import path from "path"
import { dataPaths } from "../data-paths"


export type Colors = {
    light: Color
    dark: Color
}

type Color = {
    hex: string
    hsl: [number, number, number]
}

async function getImageColor(imagePath: string): Promise<Colors> {
    let vibrant = new Vibrant(imagePath, {})
    const palette = await vibrant.getPalette()

    if (!palette.LightVibrant?.hex || !palette.DarkVibrant?.hex)
        throw new Error("Could not extract colors from image: " + imagePath)

    return {
        dark: {
            hex: palette.DarkVibrant.hex,
            hsl: formatHsl(palette.DarkVibrant.hsl),
        },
        light: {
            hex: palette.LightVibrant.hex,
            hsl: formatHsl(palette.LightVibrant.hsl),
        },
    }
}

function formatHsl(values: [number, number, number]): [number, number, number] {
    const [hue, sat, light] = values
    return [Math.floor(hue * 360), Math.floor(sat * 100), Math.floor(light * 100)]
}

function getImagePaths() {
    const paths = fs
        .readdirSync(dataPaths.eventImages)
        .filter(filename => filename.endsWith(".jpg"))
        .map(filename => path.join("public", "events", filename))
    return paths
}


async function getColors() {
    const colors: Record<string, Colors> = {}

    for (const imagePath of getImagePaths()) {
        const name = path.basename(imagePath).split(".")[0]
        colors[name] = await getImageColor(imagePath)
    }

    fs.writeFileSync(dataPaths.imageColors, JSON.stringify(colors, null, 4), { encoding: "utf-8" })
}


type ImageColors = {
    color_dark_hex: string
    color_dark_hue: number
    color_dark_sat: number
    color_dark_light: number
    color_light_hex: string
    color_light_hue: number
    color_light_sat: number
    color_light_light: number
}

/** Extract colors (dark & light) from an image */
export async function getEventImageColors(event_id: string): Promise<ImageColors> {
    const imagePath = path.join(dataPaths.eventImages, event_id + ".jpg")
    const colors = await getImageColor(imagePath)
    return {
        color_dark_hex: colors.dark.hex,
        color_dark_hue: colors.dark.hsl[0],
        color_dark_sat: colors.dark.hsl[1],
        color_dark_light: colors.dark.hsl[2],
        color_light_hex: colors.light.hex,
        color_light_hue: colors.light.hsl[0],
        color_light_sat: colors.light.hsl[1],
        color_light_light: colors.light.hsl[2],
    }
}

getColors()