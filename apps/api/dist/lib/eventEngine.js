/**
 * ALYM Event Engine — événements de carrière avec conséquences réelles
 * Types : injury, unhappiness, board, transfer, media, financial, breakthrough, manager
 */
import { prisma } from './prisma.js';
function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
}
function bestPlayer(team) {
    const ranked = [...team.players]
        .filter((p) => !p.onLoan)
        .sort((a, b) => {
        const ra = (a.speed + a.dribble + a.shot + a.pass + a.defense + a.physique) / 6;
        const rb = (b.speed + b.dribble + b.shot + b.pass + b.defense + b.physique) / 6;
        return rb - ra;
    });
    return ranked[0] ?? null;
}
function randomPlayer(team, rng) {
    const pool = team.players.filter((p) => !p.onLoan && !p.isLegend);
    if (!pool.length)
        return team.players[0] ?? null;
    return pick(pool, rng);
}
function youthPlayer(team, rng) {
    const y = team.players.filter((p) => p.isYouth);
    if (y.length)
        return pick(y, rng);
    return null;
}
/** Construit un événement candidat selon le contexte équipe / match */
export function buildCandidateEvents(team, match, rng = Math.random) {
    const played = team.wins + team.draws + team.losses;
    const candidates = [];
    const star = bestPlayer(team);
    const rnd = randomPlayer(team, rng);
    const youth = youthPlayer(team, rng);
    // Après défaite ou forme faible
    if (match?.result === 'L' || (played >= 3 && team.losses >= team.wins + 2)) {
        candidates.push({
            type: 'BOARD_WARNING',
            priority: 'urgent',
            title: 'Avertissement du conseil',
            body: 'Les résultats inquiètent la direction. Une amélioration rapide est exigée, sinon la sécurité d’emploi est menacée.',
            context: { matchResult: match?.result, formHint: `${team.wins}V ${team.draws}N ${team.losses}D` },
            options: [
                { id: 'promise', label: 'Promettre un redressement', effects: ['job_soft_down', 'message_board'] },
                { id: 'attack', label: 'Changer de style (pressing)', effects: ['vision_press', 'job_up_small'] },
                { id: 'defensive', label: 'Verrouiller le jeu', effects: ['vision_bus', 'job_up_small'] },
            ],
        });
        candidates.push({
            type: 'MEDIA_PRESSURE',
            priority: 'action',
            title: 'Pression médiatique',
            body: 'La presse locale titre sur une « crise ». Les réseaux amplifient chaque critique.',
            context: {},
            options: [
                { id: 'presser', label: 'Conférence de presse offensive', effects: ['job_up_small', 'rep_up'] },
                { id: 'silence', label: 'Silence radio', effects: ['job_down'] },
                { id: 'focus', label: 'Recentrer le groupe', effects: ['morale_squad_up'] },
            ],
        });
        candidates.push({
            type: 'FAN_PROTEST',
            priority: 'important',
            title: 'Mécontentement des tribunes',
            body: 'Une frange de supporters exige plus d’intensité et de jeunes issus du club.',
            context: {},
            options: [
                { id: 'youth', label: 'Promettre de lancer un jeune', effects: ['job_up_small'] },
                { id: 'ignore_fans', label: 'Ignorer et tenir le cap', effects: ['job_down'] },
            ],
        });
    }
    // Après victoire
    if (match?.result === 'W') {
        candidates.push({
            type: 'BOARD_PRAISE',
            priority: 'fyi',
            title: 'Félicitations du conseil',
            body: 'La direction salue la performance. Une petite prime de club est envisagée.',
            context: { matchResult: 'W' },
            options: [
                { id: 'take', label: 'Accepter la prime (+£8k)', effects: ['bonus_8k', 'job_up_small'] },
                { id: 'reinvest', label: 'Réinvestir dans le staff médical', effects: ['pay_4k', 'job_up'] },
            ],
        });
        if (star) {
            candidates.push({
                type: 'BREAKTHROUGH_PLAYER',
                priority: 'important',
                title: `${star.name} en grande forme`,
                body: `Les observateurs soulignent le niveau de ${star.name}. Un agent évoque déjà un intérêt extérieur.`,
                context: { playerId: star.id, playerName: star.name },
                options: [
                    { id: 'boost', label: 'Renforcer son rôle de cadre', effects: ['boost_player', 'job_up_small'] },
                    { id: 'listen', label: 'Écouter les offres', effects: ['open_sell_flag'] },
                    { id: 'extend', label: 'Proposer une hausse de salaire (+15%)', effects: ['raise_salary'] },
                ],
            });
        }
    }
    // Blessure (toujours possible)
    if (rnd) {
        candidates.push({
            type: 'PLAYER_INJURED',
            priority: 'urgent',
            title: `Alerte médicale — ${rnd.name}`,
            body: `${rnd.name} (${rnd.position}) ressent une douleur. Le staff médical demande une orientation claire.`,
            context: { playerId: rnd.id, playerName: rnd.name },
            options: [
                { id: 'rest', label: 'Repos forcé (récupération)', effects: ['heal_light', 'job_up_small'] },
                { id: 'force', label: 'Forcer la disponibilité', effects: ['injure_degrade', 'job_down'] },
                { id: 'clinic', label: 'Clinique privée (−£6k)', effects: ['pay_6k', 'heal_full'] },
            ],
        });
    }
    // Joueur mécontent (salaire / forme)
    if (star && star.salary > 8000) {
        candidates.push({
            type: 'PLAYER_UNHAPPY',
            priority: 'action',
            title: `${star.name} réclame plus`,
            body: `L’entourage de ${star.name} estime que le contrat n’est plus à la hauteur des performances.`,
            context: { playerId: star.id, playerName: star.name },
            options: [
                { id: 'raise', label: 'Augmenter le salaire (+20%)', effects: ['raise_salary_big'] },
                { id: 'refuse', label: 'Refuser net', effects: ['degrade_player', 'job_down'] },
                { id: 'sell_threat', label: 'Autoriser un départ', effects: ['open_sell_flag'] },
            ],
        });
    }
    // Finance
    if (team.budget < 40000) {
        candidates.push({
            type: 'FINANCIAL_CRISIS',
            priority: 'urgent',
            title: 'Tension de trésorerie',
            body: 'Le directeur financier alerte : la masse salariale pèse trop lourd au regard du budget restant.',
            context: { budget: team.budget },
            options: [
                { id: 'cut', label: 'Geler les recrutements', effects: ['job_soft_down'] },
                { id: 'loan_out', label: 'Chercher à prêter un joueur', effects: ['message_loan'] },
                { id: 'board_ask', label: 'Demander une avance au board', effects: ['bonus_15k', 'job_down'] },
            ],
        });
    }
    if (team.budget > 250000 && rng() > 0.4) {
        candidates.push({
            type: 'SPONSOR_BOOST',
            priority: 'important',
            title: 'Opportunité sponsor',
            body: 'Un partenaire local propose un contrat image si le club maintient une communication positive.',
            context: {},
            options: [
                { id: 'sign', label: 'Signer (+£20k)', effects: ['bonus_20k', 'rep_up'] },
                { id: 'pass', label: 'Décliner', effects: ['none'] },
            ],
        });
    }
    // Transfert
    if (star) {
        candidates.push({
            type: 'TRANSFER_DRAMA',
            priority: 'action',
            title: 'Rumeur de transfert',
            body: `Un grand club sonderait ${star.name}. Les loges bruissent ; le vestiaire observe ta réaction.`,
            context: { playerId: star.id, playerName: star.name },
            options: [
                { id: 'block', label: 'Bloquer tout contact', effects: ['morale_mixed', 'job_up_small'] },
                { id: 'negotiate', label: 'Ouvrir les négociations', effects: ['open_sell_flag', 'bonus_5k'] },
                { id: 'price', label: 'Fixer un prix dissuasif', effects: ['job_up_small'] },
            ],
        });
    }
    // Vestiaire
    candidates.push({
        type: 'DRESSING_ROOM',
        priority: 'important',
        title: 'Tension dans le vestiaire',
        body: 'Deux cadres ne s’entendent plus sur le leadership. Le groupe demande un arbitrage.',
        context: {},
        options: [
            { id: 'meeting', label: 'Réunion de clarification', effects: ['morale_squad_up', 'job_up_small'] },
            { id: 'captain', label: 'Nommer un nouveau capitaine symbolique', effects: ['job_up_small'] },
            { id: 'ignore_room', label: 'Laisser faire', effects: ['job_down', 'degrade_random'] },
        ],
    });
    // Manager world echo
    candidates.push({
        type: 'MANAGER_CHANGE',
        priority: 'fyi',
        title: 'Secousse Manager Market',
        body: 'Un club rival change de projet tactique après un mouvement d’entraîneur. Cela peut modifier les profils recherchés sur le marché.',
        context: {},
        options: [
            { id: 'scout', label: 'Noter les profils libérés', effects: ['message_scout'] },
            { id: 'hold', label: 'Ne rien changer', effects: ['none'] },
        ],
    });
    // Jeune
    if (youth) {
        candidates.push({
            type: 'YOUTH_BREAKOUT',
            priority: 'important',
            title: `${youth.name} impressionne`,
            body: `Le staff jeunes estime que ${youth.name} est prêt pour davantage de responsabilités.`,
            context: { playerId: youth.id, playerName: youth.name },
            options: [
                { id: 'promote_path', label: 'Accélérer son intégration', effects: ['boost_player', 'job_up_small'] },
                { id: 'patient', label: 'Garder un plan progressif', effects: ['none'] },
            ],
        });
    }
    // Job security critique
    if (team.jobSecurity < 35) {
        candidates.push({
            type: 'BOARD_WARNING',
            priority: 'urgent',
            title: 'Ultimatum du conseil',
            body: `Sécurité d’emploi à ${team.jobSecurity}%. Le prochain cycle de résultats sera déterminant.`,
            context: { jobSecurity: team.jobSecurity },
            options: [
                { id: 'allin', label: 'Tout miser sur l’attaque', effects: ['vision_press'] },
                { id: 'secure', label: 'Priorité solidité', effects: ['vision_bus'] },
                { id: 'buy_time', label: 'Demander du temps (coût politique)', effects: ['job_up', 'pay_5k'] },
            ],
        });
    }
    return candidates;
}
/** Tire 0–2 événements après un match, persistés en pending */
export async function tickCareerEvents(teamId, match, rng = Math.random) {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { players: true },
    });
    if (!team)
        return [];
    // Expirer les pending trop vieux (> 14 jours)
    const expiredBefore = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    await prisma.careerEvent.updateMany({
        where: { teamId, status: 'pending', createdAt: { lt: expiredBefore } },
        data: { status: 'expired', consequenceNote: 'Expiré sans décision.' },
    });
    const pendingCount = await prisma.careerEvent.count({
        where: { teamId, status: 'pending' },
    });
    // Plafonner la file d'attente
    if (pendingCount >= 3) {
        return listEvents(teamId, 'pending');
    }
    const snap = {
        id: team.id,
        budget: team.budget,
        jobSecurity: team.jobSecurity,
        tacticalVision: team.tacticalVision,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        reputation: team.reputation,
        players: team.players,
    };
    const pool = buildCandidateEvents(snap, match, rng);
    // Probabilité globale ~45% d'avoir au moins un event ; jusqu'à 2
    const rolled = [];
    if (rng() < 0.45 && pool.length) {
        rolled.push(pick(pool, rng));
    }
    if (rng() < 0.18 && pool.length > 1) {
        const second = pick(pool.filter((e) => e.type !== rolled[0]?.type), rng);
        if (second)
            rolled.push(second);
    }
    const created = [];
    for (const ev of rolled) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const row = await prisma.careerEvent.create({
            data: {
                teamId,
                type: ev.type,
                priority: ev.priority,
                title: ev.title,
                body: ev.body,
                contextJson: JSON.stringify(ev.context ?? {}),
                optionsJson: JSON.stringify(ev.options),
                status: 'pending',
                expiresAt,
            },
        });
        created.push(rowToPayload(row));
        await prisma.message.create({
            data: {
                teamId,
                sender: 'EVENT ENGINE',
                title: `[${ev.priority.toUpperCase()}] ${ev.title}`,
                content: `${ev.body}\n\nOuvre le Centre d’événements pour décider.`,
            },
        });
    }
    return created;
}
function rowToPayload(row) {
    return {
        id: row.id,
        type: row.type,
        priority: row.priority,
        title: row.title,
        body: row.body,
        context: row.contextJson ? JSON.parse(row.contextJson) : {},
        options: JSON.parse(row.optionsJson),
        status: row.status,
        choiceId: row.choiceId,
        consequenceNote: row.consequenceNote,
        createdAt: row.createdAt.toISOString(),
        expiresAt: row.expiresAt?.toISOString() ?? null,
    };
}
export async function listEvents(teamId, status) {
    const rows = await prisma.careerEvent.findMany({
        where: { teamId, ...(status ? { status } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 40,
    });
    return rows.map(rowToPayload);
}
export async function getPendingEvent(teamId) {
    const row = await prisma.careerEvent.findFirst({
        where: { teamId, status: 'pending' },
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
    // priority lexical: action, fyi, important, urgent — re-sort manually
    const all = await prisma.careerEvent.findMany({
        where: { teamId, status: 'pending' },
        orderBy: { createdAt: 'asc' },
    });
    if (!all.length)
        return null;
    const weight = { urgent: 0, action: 1, important: 2, fyi: 3 };
    all.sort((a, b) => (weight[a.priority] ?? 9) - (weight[b.priority] ?? 9));
    return rowToPayload(all[0]);
}
async function applyEffects(teamId, effects, context) {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { players: true },
    });
    if (!team)
        throw new Error('Équipe introuvable');
    let budget = team.budget;
    let jobSecurity = team.jobSecurity;
    let tacticalVision = team.tacticalVision;
    let reputation = team.reputation;
    const notes = [];
    const effectsApplied = [];
    const playerId = typeof context.playerId === 'number' ? context.playerId : undefined;
    const bumpPlayer = async (id, delta, fields) => {
        const p = team.players.find((x) => x.id === id);
        if (!p)
            return;
        const keys = fields ?? ['speed', 'dribble', 'shot', 'pass', 'defense', 'physique'];
        const data = {};
        for (const k of keys) {
            const cur = p[k];
            if (typeof cur === 'number') {
                data[k] = Math.max(1, Math.min(99, cur + delta));
            }
        }
        if (Object.keys(data).length) {
            await prisma.player.update({ where: { id }, data });
        }
    };
    for (const effect of effects) {
        effectsApplied.push(effect);
        switch (effect) {
            case 'none':
                notes.push('Statu quo.');
                break;
            case 'pay_4k':
                budget -= 4000;
                notes.push('Dépense −£4,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: -4000, reason: 'Événement carrière' },
                });
                break;
            case 'pay_5k':
                budget -= 5000;
                notes.push('Dépense −£5,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: -5000, reason: 'Événement carrière' },
                });
                break;
            case 'pay_6k':
                budget -= 6000;
                notes.push('Clinique −£6,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: -6000, reason: 'Soins médicaux' },
                });
                break;
            case 'bonus_5k':
                budget += 5000;
                notes.push('+£5,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: 5000, reason: 'Événement carrière' },
                });
                break;
            case 'bonus_8k':
                budget += 8000;
                notes.push('Prime conseil +£8,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: 8000, reason: 'Prime conseil' },
                });
                break;
            case 'bonus_15k':
                budget += 15000;
                notes.push('Avance board +£15,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: 15000, reason: 'Avance board' },
                });
                break;
            case 'bonus_20k':
                budget += 20000;
                notes.push('Sponsor +£20,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: 20000, reason: 'Sponsor' },
                });
                break;
            case 'bonus_40k':
                budget += 40000;
                notes.push('Injection +£40,000.');
                await prisma.transaction.create({
                    data: { teamId, type: 'event', amount: 40000, reason: 'Injection board' },
                });
                break;
            case 'job_up':
                jobSecurity = Math.min(99, jobSecurity + 6);
                notes.push('Sécurité d’emploi +6.');
                break;
            case 'job_up_small':
                jobSecurity = Math.min(99, jobSecurity + 3);
                notes.push('Sécurité +3.');
                break;
            case 'job_down':
                jobSecurity = Math.max(5, jobSecurity - 8);
                notes.push('Sécurité −8.');
                break;
            case 'job_soft_down':
                jobSecurity = Math.max(5, jobSecurity - 4);
                notes.push('Sécurité −4.');
                break;
            case 'vision_press':
                tacticalVision = 'high_press';
                notes.push('Vision → High Pressing.');
                break;
            case 'vision_bus':
                tacticalVision = 'park_bus';
                notes.push('Vision → Park the Bus.');
                break;
            case 'vision_counter':
                tacticalVision = 'counter';
                notes.push('Vision → Counter.');
                break;
            case 'rep_up':
                reputation = Math.min(99, reputation + 2);
                notes.push('Réputation club +2.');
                break;
            case 'heal_light':
                if (playerId) {
                    await bumpPlayer(playerId, 1, ['physique']);
                    notes.push('Récupération légère du joueur.');
                }
                break;
            case 'heal_full':
                if (playerId) {
                    await bumpPlayer(playerId, 3, ['physique', 'speed']);
                    notes.push('Récupération complète.');
                }
                break;
            case 'injure_degrade':
                if (playerId) {
                    await bumpPlayer(playerId, -4, ['physique', 'speed']);
                    notes.push('Le joueur force et perd en condition (−4).');
                }
                break;
            case 'boost_player':
                if (playerId) {
                    await bumpPlayer(playerId, 2);
                    notes.push('Progression du joueur ciblé (+2 attrs).');
                }
                break;
            case 'degrade_player':
                if (playerId) {
                    await bumpPlayer(playerId, -2);
                    notes.push('Baisse de régime du joueur (−2).');
                }
                break;
            case 'degrade_random': {
                const p = team.players[Math.floor(Math.random() * Math.max(1, team.players.length))];
                if (p) {
                    await bumpPlayer(p.id, -2, ['pass', 'physique']);
                    notes.push(`${p.name} affecté par le climat (−2).`);
                }
                break;
            }
            case 'raise_salary':
                if (playerId) {
                    const p = team.players.find((x) => x.id === playerId);
                    if (p) {
                        const next = Math.round(p.salary * 1.15);
                        await prisma.player.update({ where: { id: playerId }, data: { salary: next } });
                        notes.push(`Salaire de ${p.name} → £${next}/sem.`);
                    }
                }
                break;
            case 'raise_salary_big':
                if (playerId) {
                    const p = team.players.find((x) => x.id === playerId);
                    if (p) {
                        const next = Math.round(p.salary * 1.2);
                        await prisma.player.update({ where: { id: playerId }, data: { salary: next } });
                        notes.push(`Salaire de ${p.name} → £${next}/sem.`);
                    }
                }
                break;
            case 'morale_squad_up':
                jobSecurity = Math.min(99, jobSecurity + 2);
                notes.push('Climat de groupe amélioré.');
                break;
            case 'morale_mixed':
                notes.push('Réactionsitions mitigées dans le vestiaire.');
                break;
            case 'open_sell_flag':
                notes.push('Le joueur est marqué comme écoutant les offres.');
                break;
            case 'message_board':
                await prisma.message.create({
                    data: {
                        teamId,
                        sender: 'CONSEIL',
                        title: 'Suivi des engagements',
                        content: 'Le board prend note de ta promesse de redressement.',
                    },
                });
                notes.push('Message board envoyé.');
                break;
            case 'message_loan':
                await prisma.message.create({
                    data: {
                        teamId,
                        sender: 'DIRECTION FINANCIÈRE',
                        title: 'Piste de prêt',
                        content: 'Identifie un joueur à prêter depuis l’effectif pour soulager la masse.',
                    },
                });
                notes.push('Piste de prêt ouverte (Effectif).');
                break;
            case 'message_scout':
                await prisma.message.create({
                    data: {
                        teamId,
                        sender: 'SCOUTING',
                        title: 'Profils à surveiller',
                        content: 'Le mouvement d’entraîneurs rivaux peut libérer des profils intéressants sur le mercato.',
                    },
                });
                notes.push('Note scouting créée.');
                break;
            default:
                notes.push(`Effet ${effect} enregistré.`);
        }
    }
    await prisma.team.update({
        where: { id: teamId },
        data: {
            budget: Math.round(budget),
            jobSecurity,
            tacticalVision,
            reputation,
        },
    });
    return {
        note: notes.join(' '),
        budget: Math.round(budget),
        jobSecurity,
        tacticalVision,
        effectsApplied,
    };
}
export async function resolveCareerEvent(teamId, eventId, choiceId) {
    const row = await prisma.careerEvent.findFirst({
        where: { id: eventId, teamId },
    });
    if (!row)
        throw new Error('Événement introuvable');
    if (row.status !== 'pending')
        throw new Error('Événement déjà traité');
    const options = JSON.parse(row.optionsJson);
    const choice = options.find((o) => o.id === choiceId);
    if (!choice)
        throw new Error('Choix invalide');
    const context = row.contextJson ? JSON.parse(row.contextJson) : {};
    const result = await applyEffects(teamId, choice.effects, context);
    const updated = await prisma.careerEvent.update({
        where: { id: eventId },
        data: {
            status: 'resolved',
            choiceId,
            consequenceNote: result.note,
            consequenceJson: JSON.stringify(result.effectsApplied),
            resolvedAt: new Date(),
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'EVENT ENGINE',
            title: `Décision : ${row.title}`,
            content: `Choix « ${choice.label} ». ${result.note}`,
        },
    });
    return { event: rowToPayload(updated), result };
}
/** Compat UI ancienne (shape UnexpectedEvent) */
export function toLegacyUnexpectedShape(ev) {
    if (!ev)
        return null;
    return {
        id: ev.id,
        category: mapTypeToCategory(ev.type),
        title: ev.title,
        body: ev.body,
        choices: ev.options.map((o) => ({
            id: o.id,
            label: o.label,
            effect: o.effects.join('|'),
        })),
        type: ev.type,
        priority: ev.priority,
    };
}
function mapTypeToCategory(type) {
    if (type.startsWith('PLAYER') || type === 'YOUTH_BREAKOUT' || type === 'BREAKTHROUGH_PLAYER')
        return 'player';
    if (type.startsWith('BOARD') || type === 'FINANCIAL_CRISIS' || type === 'SPONSOR_BOOST')
        return 'board';
    if (type === 'MEDIA_PRESSURE' || type === 'FAN_PROTEST')
        return 'media';
    if (type === 'TRANSFER_DRAMA')
        return 'media';
    return 'fans';
}
