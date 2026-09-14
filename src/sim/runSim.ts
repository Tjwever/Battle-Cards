/* eslint-disable no-console -- this is a CLI script; console output is its purpose */
import cardsData from '../app/cardsData'
import { DECK_LIST, getDeck } from '../app/decks'
import { createRng } from '../features/game/rng'
import { runSimulations } from './engine'
import { greedyStrategy, smartStrategy } from '../features/game/ai'

/** Parse `--flag value` / `--flag=value` from argv. */
function arg(name: string, fallback: number): number {
    const argv = process.argv.slice(2)
    const eq = argv.find((a) => a.startsWith(`--${name}=`))
    if (eq) return Number(eq.split('=')[1]) || fallback
    const i = argv.indexOf(`--${name}`)
    if (i !== -1 && argv[i + 1]) return Number(argv[i + 1]) || fallback
    return fallback
}

function has(flag: string): boolean {
    return process.argv.slice(2).includes(`--${flag}`)
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`

function deckMatrix(games: number, seed: number, smart: boolean) {
    const strat = smart ? smartStrategy : greedyStrategy
    console.log(
        `\n=== Deck-vs-Deck Matrix (A = row, ${smart ? 'smart' : 'greedy'} AI) ===`
    )
    console.log(`games per cell: ${games}   seed: ${seed}\n`)
    const header = ['        '].concat(
        DECK_LIST.map((d) => d.name.padStart(10))
    )
    console.log(header.join(''))
    for (const a of DECK_LIST) {
        const row = [a.name.padEnd(8)]
        for (const b of DECK_LIST) {
            const stats = runSimulations(
                getDeck(a.id),
                getDeck(b.id),
                games,
                (i) => createRng(seed + i),
                strat,
                strat
            )
            row.push(
                `${pct(stats.aWinRate)}/${pct(stats.drawRate)}`.padStart(14)
            )
        }
        console.log(row.join(''))
    }
    console.log('')
}

function main() {
    const games = arg('games', 2000)
    const seed = arg('seed', 12345)

    if (has('matrix')) {
        deckMatrix(arg('games', 500), seed, has('smart'))
        return
    }

    const stats = runSimulations(
        cardsData,
        cardsData,
        games,
        (i) => createRng(seed + i * 2654435761)
    )

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
