// The pull odds json lists the chances for each pull.
// The chances are stored as an array of length 301:
// first item = 0 pulls, last item = 300th pull
import pullOdds from "./pull_odds.json"

type PullOdds = Record<string, number>

/** Returns the pull probability as 0-1 */
export function getPullOdds(pulls: number, bannerType: "debut" | "limited" | "collab"): PullOdds {

    pulls = Math.min(299, pulls) // cap at 300 pulls (no data beyond 300)

    // Collab banner (one rate-up, 50%, 120 pulls hard pity)
    if (bannerType === "collab") {
        return {
            "Pull odds:": pulls >= 120 ? 1 : (pullOdds.debut[pulls] || 0) / 100,
        }
    }

    // Standard debut banner (one rate-up, 50%)
    if (bannerType === "debut") {
        return {
            "Pull odds:": (pullOdds.debut[pulls] || 0) / 100,
        }
    }

    // Limited banner (two rate-ups, 35% each)
    return {
        "Any rate-up:": pulls >= 300 ? 1 : pullOdds.limited_any[pulls] / 100,
        "Specific rate-up:": pulls >= 300 ? 1 : pullOdds.limited_specific[pulls] / 100,
        "Both rate-ups:": pullOdds.limited_both[pulls] / 100,
    }
}
