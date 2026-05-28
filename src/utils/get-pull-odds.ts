// The pull odds json lists the chances for each pull.
// The chances are stored as an array of length 301:
// first item = 0 pulls, last item = 300th pull
import pullOdds from "./pull_odds.json"

type PullOdds = Record<string, number>

export function getPullOdds(pulls: number, bannerType: "debut" | "limited" | "collab"): PullOdds {

    // Collab banner (one rate-up, 50%, 120 pulls hard pity)
    if (bannerType === "collab") {
        return {
            "Pull odds:": pulls >= 120 ? 100 : pullOdds.debut[pulls],
        }
    }

    // Standard debut banner (one rate-up, 50%)
    if (bannerType === "debut") {
        return {
            "Pull odds:": pullOdds.debut[pulls],
        }
    }

    // Limited banner (two rate-ups, 35% each)
    return {
        "Any rate-up:": pullOdds.limited_any[pulls],
        "Specific rate-up:": pullOdds.limited_specific[pulls],
        "Both rate-ups:": pullOdds.limited_both[pulls],
    }
}
