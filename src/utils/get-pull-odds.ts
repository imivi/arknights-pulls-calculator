// The pull odds json lists the chances for each pull.
// The chances are stored as an array of length 301:
// first item = 0 pulls, last item = 300th pull
import pullOdds from "./pull_odds.json"

type PullOdds = Record<string, number>

export function getPullOdds(pulls: number, bannerType: "debut" | "limited"): PullOdds {

    // Standard debut banner (one rate-up, 50%)
    if (bannerType === "debut") {
        return {
            "Pull odds:": pullOdds.debut[pulls],
        }
    }

    // Limited banner (two rate-ups, 35% each)
    else {
        return {
            "Any rate-up:": pullOdds.limited_any[pulls],
            "Specific rate-up:": pullOdds.limited_specific[pulls],
            "Both rate-ups:": pullOdds.limited_both[pulls],
        }
    }
}
