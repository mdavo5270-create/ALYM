/** Classement Super Ligue — simulation rivaux + équipe joueur */
import { prisma } from './prisma.js';
const NPC_NAMES = [
    'FC Nordique',
    'Olympique Rivage',
    'AS Métropole',
    'United Provence',
    'Racing Atlantique',
    'Sporting Loire',
    'Dynamo Est',
    'FC Vallée',
    'Alliance Sud',
    'Corsaires FC',
    'Étoile Alpine',
];
export async function ensureLeagueForTeam(teamId, teamName, season = 1) {
    const leagueKey = 'super_ligue_1';
    const existing = await prisma.leagueStanding.findFirst({
        where: { leagueKey, season, playerTeamId: teamId },
    });
    if (existing)
        return existing;
    // Créer table complète si absente
    const count = await prisma.leagueStanding.count({ where: { leagueKey, season } });
    if (count === 0) {
        for (const name of NPC_NAMES) {
            await prisma.leagueStanding.create({
                data: {
                    leagueKey,
                    season,
                    teamName: name,
                    isPlayer: false,
                    played: 0,
                    points: 0,
                },
            });
        }
    }
    return prisma.leagueStanding.create({
        data: {
            leagueKey,
            season,
            teamName,
            isPlayer: true,
            playerTeamId: teamId,
            played: 0,
            points: 0,
        },
    });
}
function formPush(form, result) {
    const next = `${form}${result}`.slice(-5);
    return next;
}
/** Met à jour le joueur + simule une journée pour les NPC */
export async function applyMatchToLeague(teamId, result, goalsFor, goalsAgainst) {
    const row = await prisma.leagueStanding.findFirst({
        where: { playerTeamId: teamId, leagueKey: 'super_ligue_1' },
    });
    if (!row) {
        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team)
            return null;
        await ensureLeagueForTeam(teamId, team.name);
    }
    const player = await prisma.leagueStanding.findFirst({
        where: { playerTeamId: teamId, leagueKey: 'super_ligue_1' },
    });
    if (!player)
        return null;
    const pts = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    await prisma.leagueStanding.update({
        where: { id: player.id },
        data: {
            played: player.played + 1,
            wins: player.wins + (result === 'W' ? 1 : 0),
            draws: player.draws + (result === 'D' ? 1 : 0),
            losses: player.losses + (result === 'L' ? 1 : 0),
            goalsFor: player.goalsFor + goalsFor,
            goalsAgainst: player.goalsAgainst + goalsAgainst,
            points: player.points + pts,
            form: formPush(player.form, result),
        },
    });
    // Simuler les autres clubs (1 match chacun)
    const npcs = await prisma.leagueStanding.findMany({
        where: { leagueKey: 'super_ligue_1', season: player.season, isPlayer: false },
    });
    for (const npc of npcs) {
        const r = Math.random();
        const res = r < 0.38 ? 'W' : r < 0.62 ? 'D' : 'L';
        const gf = Math.floor(Math.random() * 4);
        const ga = res === 'W'
            ? Math.floor(Math.random() * Math.max(1, gf))
            : res === 'D'
                ? gf
                : gf + 1 + Math.floor(Math.random() * 2);
        const add = res === 'W' ? 3 : res === 'D' ? 1 : 0;
        await prisma.leagueStanding.update({
            where: { id: npc.id },
            data: {
                played: npc.played + 1,
                wins: npc.wins + (res === 'W' ? 1 : 0),
                draws: npc.draws + (res === 'D' ? 1 : 0),
                losses: npc.losses + (res === 'L' ? 1 : 0),
                goalsFor: npc.goalsFor + gf,
                goalsAgainst: npc.goalsAgainst + ga,
                points: npc.points + add,
                form: formPush(npc.form, res),
            },
        });
    }
    return getTable(player.season);
}
export async function getTable(season = 1) {
    const rows = await prisma.leagueStanding.findMany({
        where: { leagueKey: 'super_ligue_1', season },
        orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }],
    });
    return rows.map((r, i) => ({
        rank: i + 1,
        teamName: r.teamName,
        isPlayer: r.isPlayer,
        playerTeamId: r.playerTeamId,
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        gd: r.goalsFor - r.goalsAgainst,
        points: r.points,
        form: r.form,
    }));
}
