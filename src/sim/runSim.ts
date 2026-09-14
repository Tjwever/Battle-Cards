/* eslint-disable no-console -- this is a CLI script; console output is its purpose */
import cardsData from '../app/cardsData'
import { createRng } from '../features/game/rng'
import { runSimulations } from './engine'

/** Parse `--flag value` / `--flag=value` from argv. */
function arg(name: string, fallback: number): number {
    const argv = process.argv.slice(2)
    const eq = argv.find((a) => a.startsWith(`--${name}=`))
    if (eq) return Number(eq.split('=')[1]) || fallback
    const i = argv.indexOf(`--${name}`)
    if (i !== -1 && argv[i + 1]) return Number(argv[i + 1]) || fallback
    return fallback
}

function main() {
    const games = arg('games', 2000)
    const seed = arg('seed', 12345)

    const stats = runSimulations(
        cardsData,
        cardsData,
        games,
        (i) => createRng(seed + i * 2654435761)
    )

    const pct = (n: number) => `${(n * 100).toFixed(1)}%`
    console.log('\n=== Battle-Cards Balance Simulation ===')
    console.log(`games: ${stats.games}   seed: ${seed}   (deck A vs deck B, greedy AI)`)
    console.log(
        `A wins: ${stats.aWins} (${pct(stats.aWinRate)})   ` +
            `B wins: ${stats.bWins} (${pct(stats.bWinRate)})   ` +
            `draws: ${stats.draws} (${pct(stats.drawRate)})`
    )
    console.log(`avg rounds/game: ${stats.avgRounds.toFixed(2)}`)

    const top = Object.entries(stats.cardsPlayed)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
    console.log('\nmost-played cards:')
    for (const [name, count] of top) {
        console.log(`  ${count.toString().padStart(7)}  ${name}`)
    }
    console.log('')
}

main()
