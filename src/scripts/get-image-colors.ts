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

getColors()