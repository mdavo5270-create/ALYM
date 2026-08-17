var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma, prisma;
var init_prisma = __esm({
  "src/lib/prisma.ts"() {
    "use strict";
    globalForPrisma = globalThis;
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }
});

// src/lib/chronicle.ts
var chronicle_exports = {};
__export(chronicle_exports, {
  listChronicle: () => listChronicle,
  matchChronicleText: () => matchChronicleText,
  seasonReview: () => seasonReview,
  writeChronicle: () => writeChronicle
});
async function weekForTeam(teamId) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { wins: true, draws: true, losses: true }
  });
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
  return { season: 1, week: Math.max(1, played) };
}
async function writeChronicle(teamId, data) {
  const { season, week } = data.season != null && data.week != null ? { season: data.season, week: data.week } : await weekForTeam(teamId);
  const row = await prisma.chronicleEntry.create({
    data: {
      teamId,
      season,
      week,
      type: data.type,
      tone: data.tone ?? "neutral",
      headline: data.headline.slice(0, 160),
      body: data.body.slice(0, 800),
      metaJson: data.meta ? JSON.stringify(data.meta) : null
    }
  });
  return {
    id: row.id,
    season: row.season,
    week: row.week,
    type: row.type,
    tone: row.tone,
    headline: row.headline,
    body: row.body,
    meta: row.metaJson ? JSON.parse(row.metaJson) : null,
    createdAt: row.createdAt.toISOString()
  };
}
async function listChronicle(teamId, opts) {
  const rows = await prisma.chronicleEntry.findMany({
    where: {
      teamId,
      ...opts?.season != null ? { season: opts.season } : {}
    },
    orderBy: [{ season: "desc" }, { week: "desc" }, { createdAt: "desc" }],
    take: opts?.limit ?? 40
  });
  return rows.map((row) => ({
    id: row.id,
    season: row.season,
    week: row.week,
    type: row.type,
    tone: row.tone,
    headline: row.headline,
    body: row.body,
    meta: row.metaJson ? JSON.parse(row.metaJson) : null,
    createdAt: row.createdAt.toISOString()
  }));
}
async function seasonReview(teamId, season = 1) {
  const entries = await listChronicle(teamId, { season, limit: 100 });
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;
  const scored = entries.map((e) => {
    let score = 1;
    if (e.tone === "triumph" || e.tone === "turning") score += 3;
    if (e.tone === "setback" || e.tone === "tension") score += 2;
    if (e.type === "match" && e.tone === "triumph") score += 1;
    if (e.type === "event") score += 1;
    return { ...e, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const highlights = scored.slice(0, 12);
  const played = team.wins + team.draws + team.losses;
  const narrative = team.wins >= team.losses + 2 ? `Saison ${season} : ${team.name} a impos\xE9 son rythme (${team.wins}V-${team.draws}N-${team.losses}D). Le conseil retient une ligne claire.` : team.losses > team.wins ? `Saison ${season} : le chemin a \xE9t\xE9 rude pour ${team.name}. ${team.losses} d\xE9faites ont pes\xE9 \u2014 mais le r\xE9cit n\u2019est pas fini.` : `Saison ${season} : \xE9quilibre fragile pour ${team.name}. ${played} matchs, autant de d\xE9cisions qui restent dans la m\xE9moire du club.`;
  return {
    season,
    teamName: team.name,
    record: { wins: team.wins, draws: team.draws, losses: team.losses, played },
    jobSecurity: team.jobSecurity,
    tacticalVision: team.tacticalVision,
    narrative,
    highlights,
    totalEntries: entries.length
  };
}
function matchChronicleText(teamName, opponent, homeScore, awayScore, result) {
  if (result === "W") {
    return {
      tone: "triumph",
      headline: `Victoire ${homeScore}\u2013${awayScore} face \xE0 ${opponent}`,
      body: `${teamName} s\u2019impose. Le vestiaire respire ; le conseil note les trois points. La semaine s\u2019\xE9crit en vert.`
    };
  }
  if (result === "D") {
    return {
      tone: "neutral",
      headline: `Nul ${homeScore}\u2013${awayScore} contre ${opponent}`,
      body: `Partage des points. Ni sacre ni crise \u2014 mais le fil de la saison s\u2019allonge sans soulager la pression.`
    };
  }
  return {
    tone: "setback",
    headline: `D\xE9faite ${homeScore}\u2013${awayScore} contre ${opponent}`,
    body: `${teamName} plie. Les questions remontent plus vite que les jambes. Le prochain match ne sera pas seulement sportif.`
  };
}
var init_chronicle = __esm({
  "src/lib/chronicle.ts"() {
    "use strict";
    init_prisma();
  }
});

// src/lib/eventEngine.ts
var eventEngine_exports = {};
__export(eventEngine_exports, {
  buildCandidateEvents: () => buildCandidateEvents,
  getPendingEvent: () => getPendingEvent,
  listEvents: () => listEvents,
  resolveCareerEvent: () => resolveCareerEvent,
  tickCareerEvents: () => tickCareerEvents,
  toLegacyUnexpectedShape: () => toLegacyUnexpectedShape
});
function pick2(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}
function bestPlayer(team) {
  const ranked = [...team.players].filter((p) => !p.onLoan).sort((a, b) => {
    const ra = (a.speed + a.dribble + a.shot + a.pass + a.defense + a.physique) / 6;
    const rb = (b.speed + b.dribble + b.shot + b.pass + b.defense + b.physique) / 6;
    return rb - ra;
  });
  return ranked[0] ?? null;
}
function randomPlayer(team, rng) {
  const pool = team.players.filter((p) => !p.onLoan && !p.isLegend);
  if (!pool.length) return team.players[0] ?? null;
  return pick2(pool, rng);
}
function youthPlayer(team, rng) {
  const y = team.players.filter((p) => p.isYouth);
  if (y.length) return pick2(y, rng);
  return null;
}
function buildCandidateEvents(team, match, rng = Math.random) {
  const played = team.wins + team.draws + team.losses;
  const candidates = [];
  const star = bestPlayer(team);
  const rnd = randomPlayer(team, rng);
  const youth = youthPlayer(team, rng);
  if (match?.result === "L" || played >= 3 && team.losses >= team.wins + 2) {
    candidates.push({
      type: "BOARD_WARNING",
      priority: "urgent",
      title: "Avertissement du conseil",
      body: "Les r\xE9sultats inqui\xE8tent la direction. Une am\xE9lioration rapide est exig\xE9e, sinon la s\xE9curit\xE9 d\u2019emploi est menac\xE9e.",
      context: { matchResult: match?.result, formHint: `${team.wins}V ${team.draws}N ${team.losses}D` },
      options: [
        { id: "promise", label: "Promettre un redressement", effects: ["job_soft_down", "message_board"] },
        { id: "attack", label: "Changer de style (pressing)", effects: ["vision_press", "job_up_small"] },
        { id: "defensive", label: "Verrouiller le jeu", effects: ["vision_bus", "job_up_small"] }
      ]
    });
    candidates.push({
      type: "MEDIA_PRESSURE",
      priority: "action",
      title: "Pression m\xE9diatique",
      body: "La presse locale titre sur une \xAB crise \xBB. Les r\xE9seaux amplifient chaque critique.",
      context: {},
      options: [
        { id: "presser", label: "Conf\xE9rence de presse offensive", effects: ["job_up_small", "rep_up"] },
        { id: "silence", label: "Silence radio", effects: ["job_down"] },
        { id: "focus", label: "Recentrer le groupe", effects: ["morale_squad_up"] }
      ]
    });
    candidates.push({
      type: "FAN_PROTEST",
      priority: "important",
      title: "M\xE9contentement des tribunes",
      body: "Une frange de supporters exige plus d\u2019intensit\xE9 et de jeunes issus du club.",
      context: {},
      options: [
        { id: "youth", label: "Promettre de lancer un jeune", effects: ["job_up_small"] },
        { id: "ignore_fans", label: "Ignorer et tenir le cap", effects: ["job_down"] }
      ]
    });
  }
  if (match?.result === "W") {
    candidates.push({
      type: "BOARD_PRAISE",
      priority: "fyi",
      title: "F\xE9licitations du conseil",
      body: "La direction salue la performance. Une petite prime de club est envisag\xE9e.",
      context: { matchResult: "W" },
      options: [
        { id: "take", label: "Accepter la prime (+\xA38k)", effects: ["bonus_8k", "job_up_small"] },
        { id: "reinvest", label: "R\xE9investir dans le staff m\xE9dical", effects: ["pay_4k", "job_up"] }
      ]
    });
    if (star) {
      candidates.push({
        type: "BREAKTHROUGH_PLAYER",
        priority: "important",
        title: `${star.name} en grande forme`,
        body: `Les observateurs soulignent le niveau de ${star.name}. Un agent \xE9voque d\xE9j\xE0 un int\xE9r\xEAt ext\xE9rieur.`,
        context: { playerId: star.id, playerName: star.name },
        options: [
          { id: "boost", label: "Renforcer son r\xF4le de cadre", effects: ["boost_player", "job_up_small"] },
          { id: "listen", label: "\xC9couter les offres", effects: ["open_sell_flag"] },
          { id: "extend", label: "Proposer une hausse de salaire (+15%)", effects: ["raise_salary"] }
        ]
      });
    }
  }
  if (rnd) {
    candidates.push({
      type: "PLAYER_INJURED",
      priority: "urgent",
      title: `Alerte m\xE9dicale \u2014 ${rnd.name}`,
      body: `${rnd.name} (${rnd.position}) ressent une douleur. Le staff m\xE9dical demande une orientation claire.`,
      context: { playerId: rnd.id, playerName: rnd.name },
      options: [
        { id: "rest", label: "Repos forc\xE9 (r\xE9cup\xE9ration)", effects: ["heal_light", "job_up_small"] },
        { id: "force", label: "Forcer la disponibilit\xE9", effects: ["injure_degrade", "job_down"] },
        { id: "clinic", label: "Clinique priv\xE9e (\u2212\xA36k)", effects: ["pay_6k", "heal_full"] }
      ]
    });
  }
  if (star && star.salary > 8e3) {
    candidates.push({
      type: "PLAYER_UNHAPPY",
      priority: "action",
      title: `${star.name} r\xE9clame plus`,
      body: `L\u2019entourage de ${star.name} estime que le contrat n\u2019est plus \xE0 la hauteur des performances.`,
      context: { playerId: star.id, playerName: star.name },
      options: [
        { id: "raise", label: "Augmenter le salaire (+20%)", effects: ["raise_salary_big"] },
        { id: "refuse", label: "Refuser net", effects: ["degrade_player", "job_down"] },
        { id: "sell_threat", label: "Autoriser un d\xE9part", effects: ["open_sell_flag"] }
      ]
    });
  }
  if (team.budget < 4e4) {
    candidates.push({
      type: "FINANCIAL_CRISIS",
      priority: "urgent",
      title: "Tension de tr\xE9sorerie",
      body: "Le directeur financier alerte : la masse salariale p\xE8se trop lourd au regard du budget restant.",
      context: { budget: team.budget },
      options: [
        { id: "cut", label: "Geler les recrutements", effects: ["job_soft_down"] },
        { id: "loan_out", label: "Chercher \xE0 pr\xEAter un joueur", effects: ["message_loan"] },
        { id: "board_ask", label: "Demander une avance au board", effects: ["bonus_15k", "job_down"] }
      ]
    });
  }
  if (team.budget > 25e4 && rng() > 0.4) {
    candidates.push({
      type: "SPONSOR_BOOST",
      priority: "important",
      title: "Opportunit\xE9 sponsor",
      body: "Un partenaire local propose un contrat image si le club maintient une communication positive.",
      context: {},
      options: [
        { id: "sign", label: "Signer (+\xA320k)", effects: ["bonus_20k", "rep_up"] },
        { id: "pass", label: "D\xE9cliner", effects: ["none"] }
      ]
    });
  }
  if (star) {
    candidates.push({
      type: "TRANSFER_DRAMA",
      priority: "action",
      title: "Rumeur de transfert",
      body: `Un grand club sonderait ${star.name}. Les loges bruissent ; le vestiaire observe ta r\xE9action.`,
      context: { playerId: star.id, playerName: star.name },
      options: [
        { id: "block", label: "Bloquer tout contact", effects: ["morale_mixed", "job_up_small"] },
        { id: "negotiate", label: "Ouvrir les n\xE9gociations", effects: ["open_sell_flag", "bonus_5k"] },
        { id: "price", label: "Fixer un prix dissuasif", effects: ["job_up_small"] }
      ]
    });
  }
  candidates.push({
    type: "DRESSING_ROOM",
    priority: "important",
    title: "Tension dans le vestiaire",
    body: "Deux cadres ne s\u2019entendent plus sur le leadership. Le groupe demande un arbitrage.",
    context: {},
    options: [
      { id: "meeting", label: "R\xE9union de clarification", effects: ["morale_squad_up", "job_up_small"] },
      { id: "captain", label: "Nommer un nouveau capitaine symbolique", effects: ["job_up_small"] },
      { id: "ignore_room", label: "Laisser faire", effects: ["job_down", "degrade_random"] }
    ]
  });
  candidates.push({
    type: "MANAGER_CHANGE",
    priority: "fyi",
    title: "Secousse Manager Market",
    body: "Un club rival change de projet tactique apr\xE8s un mouvement d\u2019entra\xEEneur. Cela peut modifier les profils recherch\xE9s sur le march\xE9.",
    context: {},
    options: [
      { id: "scout", label: "Noter les profils lib\xE9r\xE9s", effects: ["message_scout"] },
      { id: "hold", label: "Ne rien changer", effects: ["none"] }
    ]
  });
  if (youth) {
    candidates.push({
      type: "YOUTH_BREAKOUT",
      priority: "important",
      title: `${youth.name} impressionne`,
      body: `Le staff jeunes estime que ${youth.name} est pr\xEAt pour davantage de responsabilit\xE9s.`,
      context: { playerId: youth.id, playerName: youth.name },
      options: [
        { id: "promote_path", label: "Acc\xE9l\xE9rer son int\xE9gration", effects: ["boost_player", "job_up_small"] },
        { id: "patient", label: "Garder un plan progressif", effects: ["none"] }
      ]
    });
  }
  if (team.jobSecurity < 35) {
    candidates.push({
      type: "BOARD_WARNING",
      priority: "urgent",
      title: "Ultimatum du conseil",
      body: `S\xE9curit\xE9 d\u2019emploi \xE0 ${team.jobSecurity}%. Le prochain cycle de r\xE9sultats sera d\xE9terminant.`,
      context: { jobSecurity: team.jobSecurity },
      options: [
        { id: "allin", label: "Tout miser sur l\u2019attaque", effects: ["vision_press"] },
        { id: "secure", label: "Priorit\xE9 solidit\xE9", effects: ["vision_bus"] },
        { id: "buy_time", label: "Demander du temps (co\xFBt politique)", effects: ["job_up", "pay_5k"] }
      ]
    });
  }
  return candidates;
}
async function tickCareerEvents(teamId, match, rng = Math.random) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { players: true }
  });
  if (!team) return [];
  const expiredBefore = new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3);
  await prisma.careerEvent.updateMany({
    where: { teamId, status: "pending", createdAt: { lt: expiredBefore } },
    data: { status: "expired", consequenceNote: "Expir\xE9 sans d\xE9cision." }
  });
  const pendingCount = await prisma.careerEvent.count({
    where: { teamId, status: "pending" }
  });
  if (pendingCount >= 3) {
    return listEvents(teamId, "pending");
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
    players: team.players
  };
  const pool = buildCandidateEvents(snap, match, rng);
  const rolled = [];
  if (rng() < 0.45 && pool.length) {
    rolled.push(pick2(pool, rng));
  }
  if (rng() < 0.18 && pool.length > 1) {
    const second = pick2(
      pool.filter((e) => e.type !== rolled[0]?.type),
      rng
    );
    if (second) rolled.push(second);
  }
  const created = [];
  for (const ev of rolled) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    const row = await prisma.careerEvent.create({
      data: {
        teamId,
        type: ev.type,
        priority: ev.priority,
        title: ev.title,
        body: ev.body,
        contextJson: JSON.stringify(ev.context ?? {}),
        optionsJson: JSON.stringify(ev.options),
        status: "pending",
        expiresAt
      }
    });
    created.push(rowToPayload(row));
    await prisma.message.create({
      data: {
        teamId,
        sender: "EVENT ENGINE",
        title: `[${ev.priority.toUpperCase()}] ${ev.title}`,
        content: `${ev.body}

Ouvre le Centre d\u2019\xE9v\xE9nements pour d\xE9cider.`
      }
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
    expiresAt: row.expiresAt?.toISOString() ?? null
  };
}
async function listEvents(teamId, status) {
  const rows = await prisma.careerEvent.findMany({
    where: { teamId, ...status ? { status } : {} },
    orderBy: { createdAt: "desc" },
    take: 40
  });
  return rows.map(rowToPayload);
}
async function getPendingEvent(teamId) {
  const row = await prisma.careerEvent.findFirst({
    where: { teamId, status: "pending" },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  });
  const all = await prisma.careerEvent.findMany({
    where: { teamId, status: "pending" },
    orderBy: { createdAt: "asc" }
  });
  if (!all.length) return null;
  const weight = { urgent: 0, action: 1, important: 2, fyi: 3 };
  all.sort(
    (a, b) => (weight[a.priority] ?? 9) - (weight[b.priority] ?? 9)
  );
  return rowToPayload(all[0]);
}
async function applyEffects(teamId, effects, context) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { players: true }
  });
  if (!team) throw new Error("\xC9quipe introuvable");
  let budget = team.budget;
  let jobSecurity = team.jobSecurity;
  let tacticalVision = team.tacticalVision;
  let reputation = team.reputation;
  const notes = [];
  const effectsApplied = [];
  const playerId = typeof context.playerId === "number" ? context.playerId : void 0;
  const bumpPlayer = async (id, delta, fields) => {
    const p = team.players.find((x) => x.id === id);
    if (!p) return;
    const keys = fields ?? ["speed", "dribble", "shot", "pass", "defense", "physique"];
    const data = {};
    for (const k of keys) {
      const cur = p[k];
      if (typeof cur === "number") {
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
      case "none":
        notes.push("Statu quo.");
        break;
      case "pay_4k":
        budget -= 4e3;
        notes.push("D\xE9pense \u2212\xA34,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: -4e3, reason: "\xC9v\xE9nement carri\xE8re" }
        });
        break;
      case "pay_5k":
        budget -= 5e3;
        notes.push("D\xE9pense \u2212\xA35,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: -5e3, reason: "\xC9v\xE9nement carri\xE8re" }
        });
        break;
      case "pay_6k":
        budget -= 6e3;
        notes.push("Clinique \u2212\xA36,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: -6e3, reason: "Soins m\xE9dicaux" }
        });
        break;
      case "bonus_5k":
        budget += 5e3;
        notes.push("+\xA35,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: 5e3, reason: "\xC9v\xE9nement carri\xE8re" }
        });
        break;
      case "bonus_8k":
        budget += 8e3;
        notes.push("Prime conseil +\xA38,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: 8e3, reason: "Prime conseil" }
        });
        break;
      case "bonus_15k":
        budget += 15e3;
        notes.push("Avance board +\xA315,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: 15e3, reason: "Avance board" }
        });
        break;
      case "bonus_20k":
        budget += 2e4;
        notes.push("Sponsor +\xA320,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: 2e4, reason: "Sponsor" }
        });
        break;
      case "bonus_40k":
        budget += 4e4;
        notes.push("Injection +\xA340,000.");
        await prisma.transaction.create({
          data: { teamId, type: "event", amount: 4e4, reason: "Injection board" }
        });
        break;
      case "job_up":
        jobSecurity = Math.min(99, jobSecurity + 6);
        notes.push("S\xE9curit\xE9 d\u2019emploi +6.");
        break;
      case "job_up_small":
        jobSecurity = Math.min(99, jobSecurity + 3);
        notes.push("S\xE9curit\xE9 +3.");
        break;
      case "job_down":
        jobSecurity = Math.max(5, jobSecurity - 8);
        notes.push("S\xE9curit\xE9 \u22128.");
        break;
      case "job_soft_down":
        jobSecurity = Math.max(5, jobSecurity - 4);
        notes.push("S\xE9curit\xE9 \u22124.");
        break;
      case "vision_press":
        tacticalVision = "high_press";
        notes.push("Vision \u2192 High Pressing.");
        break;
      case "vision_bus":
        tacticalVision = "park_bus";
        notes.push("Vision \u2192 Park the Bus.");
        break;
      case "vision_counter":
        tacticalVision = "counter";
        notes.push("Vision \u2192 Counter.");
        break;
      case "rep_up":
        reputation = Math.min(99, reputation + 2);
        notes.push("R\xE9putation club +2.");
        break;
      case "heal_light":
        if (playerId) {
          await bumpPlayer(playerId, 1, ["physique"]);
          notes.push("R\xE9cup\xE9ration l\xE9g\xE8re du joueur.");
        }
        break;
      case "heal_full":
        if (playerId) {
          await bumpPlayer(playerId, 3, ["physique", "speed"]);
          notes.push("R\xE9cup\xE9ration compl\xE8te.");
        }
        break;
      case "injure_degrade":
        if (playerId) {
          await bumpPlayer(playerId, -4, ["physique", "speed"]);
          notes.push("Le joueur force et perd en condition (\u22124).");
        }
        break;
      case "boost_player":
        if (playerId) {
          await bumpPlayer(playerId, 2);
          notes.push("Progression du joueur cibl\xE9 (+2 attrs).");
        }
        break;
      case "degrade_player":
        if (playerId) {
          await bumpPlayer(playerId, -2);
          notes.push("Baisse de r\xE9gime du joueur (\u22122).");
        }
        break;
      case "degrade_random": {
        const p = team.players[Math.floor(Math.random() * Math.max(1, team.players.length))];
        if (p) {
          await bumpPlayer(p.id, -2, ["pass", "physique"]);
          notes.push(`${p.name} affect\xE9 par le climat (\u22122).`);
        }
        break;
      }
      case "raise_salary":
        if (playerId) {
          const p = team.players.find((x) => x.id === playerId);
          if (p) {
            const next = Math.round(p.salary * 1.15);
            await prisma.player.update({ where: { id: playerId }, data: { salary: next } });
            notes.push(`Salaire de ${p.name} \u2192 \xA3${next}/sem.`);
          }
        }
        break;
      case "raise_salary_big":
        if (playerId) {
          const p = team.players.find((x) => x.id === playerId);
          if (p) {
            const next = Math.round(p.salary * 1.2);
            await prisma.player.update({ where: { id: playerId }, data: { salary: next } });
            notes.push(`Salaire de ${p.name} \u2192 \xA3${next}/sem.`);
          }
        }
        break;
      case "morale_squad_up":
        jobSecurity = Math.min(99, jobSecurity + 2);
        notes.push("Climat de groupe am\xE9lior\xE9.");
        break;
      case "morale_mixed":
        notes.push("R\xE9actionsitions mitig\xE9es dans le vestiaire.");
        break;
      case "open_sell_flag":
        notes.push("Le joueur est marqu\xE9 comme \xE9coutant les offres.");
        break;
      case "message_board":
        await prisma.message.create({
          data: {
            teamId,
            sender: "CONSEIL",
            title: "Suivi des engagements",
            content: "Le board prend note de ta promesse de redressement."
          }
        });
        notes.push("Message board envoy\xE9.");
        break;
      case "message_loan":
        await prisma.message.create({
          data: {
            teamId,
            sender: "DIRECTION FINANCI\xC8RE",
            title: "Piste de pr\xEAt",
            content: "Identifie un joueur \xE0 pr\xEAter depuis l\u2019effectif pour soulager la masse."
          }
        });
        notes.push("Piste de pr\xEAt ouverte (Effectif).");
        break;
      case "message_scout":
        await prisma.message.create({
          data: {
            teamId,
            sender: "SCOUTING",
            title: "Profils \xE0 surveiller",
            content: "Le mouvement d\u2019entra\xEEneurs rivaux peut lib\xE9rer des profils int\xE9ressants sur le mercato."
          }
        });
        notes.push("Note scouting cr\xE9\xE9e.");
        break;
      default:
        notes.push(`Effet ${effect} enregistr\xE9.`);
    }
  }
  await prisma.team.update({
    where: { id: teamId },
    data: {
      budget: Math.round(budget),
      jobSecurity,
      tacticalVision,
      reputation
    }
  });
  return {
    note: notes.join(" "),
    budget: Math.round(budget),
    jobSecurity,
    tacticalVision,
    effectsApplied
  };
}
async function resolveCareerEvent(teamId, eventId, choiceId) {
  const row = await prisma.careerEvent.findFirst({
    where: { id: eventId, teamId }
  });
  if (!row) throw new Error("\xC9v\xE9nement introuvable");
  if (row.status !== "pending") throw new Error("\xC9v\xE9nement d\xE9j\xE0 trait\xE9");
  const options = JSON.parse(row.optionsJson);
  const choice = options.find((o) => o.id === choiceId);
  if (!choice) throw new Error("Choix invalide");
  const context = row.contextJson ? JSON.parse(row.contextJson) : {};
  const result = await applyEffects(teamId, choice.effects, context);
  const updated = await prisma.careerEvent.update({
    where: { id: eventId },
    data: {
      status: "resolved",
      choiceId,
      consequenceNote: result.note,
      consequenceJson: JSON.stringify(result.effectsApplied),
      resolvedAt: /* @__PURE__ */ new Date()
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "EVENT ENGINE",
      title: `D\xE9cision : ${row.title}`,
      content: `Choix \xAB ${choice.label} \xBB. ${result.note}`
    }
  });
  try {
    const { writeChronicle: writeChronicle2 } = await Promise.resolve().then(() => (init_chronicle(), chronicle_exports));
    const tone = row.priority === "urgent" ? "tension" : choice.effects.some((e) => e.includes("boost") || e.includes("praise") || e.includes("sponsor")) ? "hope" : "turning";
    await writeChronicle2(teamId, {
      type: "event",
      tone,
      headline: `D\xE9cision \u2014 ${row.title}`,
      body: `Tu as choisi \xAB ${choice.label} \xBB. ${result.note}`,
      meta: { eventId: row.id, choiceId, type: row.type }
    });
  } catch (e) {
    console.error("chronicle event failed", e);
  }
  return { event: rowToPayload(updated), result };
}
function toLegacyUnexpectedShape(ev) {
  if (!ev) return null;
  return {
    id: ev.id,
    category: mapTypeToCategory(ev.type),
    title: ev.title,
    body: ev.body,
    choices: ev.options.map((o) => ({
      id: o.id,
      label: o.label,
      effect: o.effects.join("|")
    })),
    type: ev.type,
    priority: ev.priority
  };
}
function mapTypeToCategory(type) {
  if (type.startsWith("PLAYER") || type === "YOUTH_BREAKOUT" || type === "BREAKTHROUGH_PLAYER") return "player";
  if (type.startsWith("BOARD") || type === "FINANCIAL_CRISIS" || type === "SPONSOR_BOOST") return "board";
  if (type === "MEDIA_PRESSURE" || type === "FAN_PROTEST") return "media";
  if (type === "TRANSFER_DRAMA") return "media";
  return "fans";
}
var init_eventEngine = __esm({
  "src/lib/eventEngine.ts"() {
    "use strict";
    init_prisma();
  }
});

// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// src/routes/auth.ts
init_prisma();
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var secret = () => process.env.JWT_SECRET || "dev-secret-change-me";
function signToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || (process.env.NODE_ENV === "production" ? "24h" : "7d");
  return jwt.sign(payload, secret(), { expiresIn });
}
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// src/routes/auth.ts
var router = Router();
var AUTH_FAIL = "Email ou mot de passe incorrect";
var registerSchema = z.object({
  email: z.string().email().max(254).transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8, "Mot de passe : 8 caract\xE8res minimum").max(128).refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), {
    message: "Mot de passe : au moins une lettre et un chiffre"
  }),
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_\-]+$/, "Identifiant invalide").optional()
});
var loginSchema = z.object({
  email: z.string().email().max(254).transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1).max(128)
});
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || "Donn\xE9es invalides";
    return res.status(400).json({ error: msg });
  }
  const { email, password, username } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await sleep(200 + Math.floor(Math.random() * 200));
    return res.status(409).json({ error: "Impossible de cr\xE9er ce compte" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username: username ?? email.split("@")[0].slice(0, 30)
    }
  });
  if (process.env.EMAIL_VERIFY === "1") {
    return res.status(201).json({
      ok: true,
      message: "Compte cr\xE9\xE9. V\xE9rifie ton email avant de te connecter.",
      userId: user.id
    });
  }
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, username: user.username }
  });
});
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: AUTH_FAIL });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const hash = user?.passwordHash ?? "$2a$12$invalidhashinvalidhashinvalidho";
  const ok = await bcrypt.compare(password, hash);
  if (!user?.passwordHash || !ok) {
    await sleep(100 + Math.floor(Math.random() * 150));
    return res.status(401).json({ error: AUTH_FAIL });
  }
  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username }
  });
});
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      username: true,
      teams: { select: { id: true, name: true } }
    }
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json({ user });
});
var auth_default = router;

// src/routes/teams.ts
init_prisma();
import { Router as Router2 } from "express";
import { z as z2 } from "zod";

// src/lib/seedPlayers.ts
init_prisma();
var FIRST = ["Lucas", "Hugo", "Nathan", "Enzo", "Louis", "Rapha\xEBl", "Arthur", "Jules", "Adam", "Leo", "Paul", "Tom", "Noah", "Maxime", "Alex"];
var LAST = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David"];
var POSITIONS = ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW", "FW", "DF", "MF"];
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
async function seedStarterPlayers(teamId, nation = "France") {
  const used = /* @__PURE__ */ new Set();
  const data = POSITIONS.map((position) => {
    let name = "";
    do {
      name = `${pick(FIRST)} ${pick(LAST)}`;
    } while (used.has(name));
    used.add(name);
    const base = position === "GK" ? 55 : 60;
    return {
      teamId,
      name,
      position,
      nation,
      salary: rand(800, 4200),
      // vs budget £200k
      speed: rand(base, base + 25),
      dribble: rand(base - 5, base + 25),
      shot: rand(base - 10, base + 20),
      pass: rand(base, base + 25),
      defense: position === "DF" || position === "GK" ? rand(base + 5, base + 30) : rand(base - 15, base + 10),
      physique: rand(base, base + 25)
    };
  });
  await prisma.player.createMany({ data });
  return data.length;
}

// src/lib/league.ts
init_prisma();
var NPC_NAMES = [
  "FC Nordique",
  "Olympique Rivage",
  "AS M\xE9tropole",
  "United Provence",
  "Racing Atlantique",
  "Sporting Loire",
  "Dynamo Est",
  "FC Vall\xE9e",
  "Alliance Sud",
  "Corsaires FC",
  "\xC9toile Alpine"
];
async function ensureLeagueForTeam(teamId, teamName, season = 1) {
  const leagueKey = "super_ligue_1";
  const existing = await prisma.leagueStanding.findFirst({
    where: { leagueKey, season, playerTeamId: teamId }
  });
  if (existing) return existing;
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
          points: 0
        }
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
      points: 0
    }
  });
}
function formPush(form, result) {
  const next = `${form}${result}`.slice(-5);
  return next;
}
async function applyMatchToLeague(teamId, result, goalsFor, goalsAgainst) {
  const row = await prisma.leagueStanding.findFirst({
    where: { playerTeamId: teamId, leagueKey: "super_ligue_1" }
  });
  if (!row) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return null;
    await ensureLeagueForTeam(teamId, team.name);
  }
  const player = await prisma.leagueStanding.findFirst({
    where: { playerTeamId: teamId, leagueKey: "super_ligue_1" }
  });
  if (!player) return null;
  const pts = result === "W" ? 3 : result === "D" ? 1 : 0;
  await prisma.leagueStanding.update({
    where: { id: player.id },
    data: {
      played: player.played + 1,
      wins: player.wins + (result === "W" ? 1 : 0),
      draws: player.draws + (result === "D" ? 1 : 0),
      losses: player.losses + (result === "L" ? 1 : 0),
      goalsFor: player.goalsFor + goalsFor,
      goalsAgainst: player.goalsAgainst + goalsAgainst,
      points: player.points + pts,
      form: formPush(player.form, result)
    }
  });
  const npcs = await prisma.leagueStanding.findMany({
    where: { leagueKey: "super_ligue_1", season: player.season, isPlayer: false }
  });
  for (const npc of npcs) {
    const r = Math.random();
    const res = r < 0.38 ? "W" : r < 0.62 ? "D" : "L";
    const gf = Math.floor(Math.random() * 4);
    const ga = res === "W" ? Math.floor(Math.random() * Math.max(1, gf)) : res === "D" ? gf : gf + 1 + Math.floor(Math.random() * 2);
    const add = res === "W" ? 3 : res === "D" ? 1 : 0;
    await prisma.leagueStanding.update({
      where: { id: npc.id },
      data: {
        played: npc.played + 1,
        wins: npc.wins + (res === "W" ? 1 : 0),
        draws: npc.draws + (res === "D" ? 1 : 0),
        losses: npc.losses + (res === "L" ? 1 : 0),
        goalsFor: npc.goalsFor + gf,
        goalsAgainst: npc.goalsAgainst + ga,
        points: npc.points + add,
        form: formPush(npc.form, res)
      }
    });
  }
  return getTable(player.season);
}
async function getTable(season = 1) {
  const rows = await prisma.leagueStanding.findMany({
    where: { leagueKey: "super_ligue_1", season },
    orderBy: [{ points: "desc" }, { goalsFor: "desc" }]
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
    form: r.form
  }));
}

// src/routes/teams.ts
var router2 = Router2();
var createSchema = z2.object({
  name: z2.string().min(2, "Nom d\u2019\xE9quipe : 2 caract\xE8res minimum").max(40),
  nation: z2.string().min(2).max(40).optional(),
  stadiumName: z2.string().min(2).max(60).optional(),
  badgeDesign: z2.number().int().min(0).max(20).optional()
});
function firstZodError(error) {
  const field = error.flatten().fieldErrors;
  const first = Object.values(field).flat()[0];
  return first || "Donn\xE9es invalides";
}
router2.use(requireAuth);
router2.get("/", async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { userId: req.user.userId },
    include: {
      _count: { select: { players: true, messages: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ teams });
});
router2.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: firstZodError(parsed.error) });
  }
  const existing = await prisma.team.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ error: "Ce nom d\u2019\xE9quipe existe d\xE9j\xE0" });
  }
  const nation = parsed.data.nation ?? "France";
  const team = await prisma.team.create({
    data: {
      userId: req.user.userId,
      name: parsed.data.name,
      nation,
      stadiumName: parsed.data.stadiumName ?? `Stade ${parsed.data.name}`,
      badgeDesign: parsed.data.badgeDesign ?? 0,
      budget: 2e5,
      goldBalance: 500
    }
  });
  await seedStarterPlayers(team.id, nation);
  await ensureLeagueForTeam(team.id, team.name);
  try {
    const { writeChronicle: writeChronicle2 } = await Promise.resolve().then(() => (init_chronicle(), chronicle_exports));
    await writeChronicle2(team.id, {
      type: "kickoff",
      tone: "hope",
      season: 1,
      week: 1,
      headline: `Chapitre 1 \u2014 ${team.name}`,
      body: `La direction confie les cl\xE9s. Budget serr\xE9, effectif \xE0 forger, Super Ligue en ligne de mire. Tout ce qui suivra s\u2019\xE9crira ici.`,
      meta: { nation }
    });
  } catch (e) {
    console.error("chronicle kickoff failed", e);
  }
  await prisma.message.create({
    data: {
      teamId: team.id,
      sender: "DIRECTION DU CLUB",
      title: "Bienvenue",
      content: `Bienvenue \xE0 ${team.name} ! Budget \xA3200,000. Un effectif de 14 joueurs vous attend.`
    }
  });
  await prisma.message.create({
    data: {
      teamId: team.id,
      sender: "SERVICE DES FINANCES",
      title: "Budget de saison",
      content: "Votre budget de saison a \xE9t\xE9 cr\xE9dit\xE9. Bonne gestion."
    }
  });
  const full = await prisma.team.findUnique({
    where: { id: team.id },
    include: { _count: { select: { players: true, messages: true } } }
  });
  res.status(201).json({ team: full });
});
router2.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findFirst({
    where: { id, userId: req.user.userId },
    include: {
      players: true,
      messages: { orderBy: { messageDate: "desc" }, take: 20 },
      _count: { select: { players: true, messages: true } }
    }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  res.json({ team });
});
var teams_default = router2;

// src/routes/messages.ts
init_prisma();
import { Router as Router3 } from "express";
var router3 = Router3({ mergeParams: true });
router3.use(requireAuth);
async function assertTeam(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId } });
}
router3.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await assertTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const filter = req.query.filter;
  const where = { teamId };
  if (filter === "unread") where.read = false;
  if (filter === "read") where.read = true;
  const messages = await prisma.message.findMany({
    where,
    orderBy: { messageDate: "desc" }
  });
  res.json({ messages });
});
router3.patch("/:messageId/read", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const messageId = Number(req.params.messageId);
  const team = await assertTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const message = await prisma.message.updateMany({
    where: { id: messageId, teamId },
    data: { read: true }
  });
  if (message.count === 0) return res.status(404).json({ error: "Message introuvable" });
  res.json({ ok: true });
});
var messages_default = router3;

// src/routes/players.ts
init_prisma();
import { Router as Router4 } from "express";
var router4 = Router4({ mergeParams: true });
router4.use(requireAuth);
router4.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const players = await prisma.player.findMany({
    where: { teamId },
    orderBy: [{ position: "asc" }, { name: "asc" }]
  });
  const withRating = players.map((p) => {
    const rating = Math.round(
      (p.speed + p.dribble + p.shot + p.pass + p.defense + p.physique) / 6 * 10
    ) / 10;
    return { ...p, rating };
  });
  res.json({ players: withRating });
});
var players_default = router4;

// src/routes/matches.ts
init_prisma();
import { Router as Router6 } from "express";

// src/lib/matchEngine.ts
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}
function strengthFromPlayers(players) {
  if (players.length === 0) return { attack: 50, midfield: 50, defense: 50, gk: 50 };
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 50;
  const gk = players.filter((p) => p.position === "GK");
  const df = players.filter((p) => p.position === "DF");
  const mf = players.filter((p) => p.position === "MF");
  const fw = players.filter((p) => p.position === "FW");
  return {
    gk: avg(gk.map((p) => (p.defense + p.physique + p.speed) / 3)),
    defense: avg(df.map((p) => (p.defense + p.physique + p.pass) / 3)),
    midfield: avg(mf.map((p) => (p.pass + p.dribble + p.speed) / 3)),
    attack: avg(fw.map((p) => (p.shot + p.dribble + p.speed) / 3))
  };
}
function buildTimeline(homeScore, awayScore, homeName, awayName) {
  const events = [];
  for (let i = 0; i < homeScore; i++) {
    events.push({
      minute: 8 + Math.floor(Math.random() * 80),
      type: "goal",
      side: "home",
      label: `But \u2014 ${homeName}`
    });
  }
  for (let i = 0; i < awayScore; i++) {
    events.push({
      minute: 8 + Math.floor(Math.random() * 80),
      type: "goal",
      side: "away",
      label: `But \u2014 ${awayName}`
    });
  }
  const extras = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < extras; i++) {
    const types = ["yellow", "sub", "chance"];
    const type = types[Math.floor(Math.random() * types.length)];
    const side = Math.random() > 0.5 ? "home" : "away";
    const labels = {
      yellow: "Carton jaune",
      sub: "Remplacement",
      chance: "Occasion nette",
      goal: "But"
    };
    events.push({
      minute: 10 + Math.floor(Math.random() * 75),
      type,
      side,
      label: labels[type] ?? type
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}
function simulateMatch(home, away, homeBonus = 1.08) {
  const homeAtt = (home.attack + home.midfield) / 2 * homeBonus;
  const awayAtt = (away.attack + away.midfield) / 2;
  const homeDef = (home.defense + home.gk) / 2;
  const awayDef = (away.defense + away.gk) / 2;
  const homeLambda = clamp(homeAtt / Math.max(awayDef, 30) * 1.35, 0.3, 4.2);
  const awayLambda = clamp(awayAtt / Math.max(homeDef, 30) * 1.15, 0.2, 3.8);
  const homeScore = poisson(homeLambda);
  const awayScore = poisson(awayLambda);
  let result = "D";
  if (homeScore > awayScore) result = "W";
  if (homeScore < awayScore) result = "L";
  const prize = result === "W" ? 25e3 : result === "D" ? 1e4 : 4e3;
  const possessionHome = clamp(
    Math.round(48 + (home.midfield - away.midfield) * 0.6 + (Math.random() * 8 - 4)),
    35,
    68
  );
  return {
    homeScore,
    awayScore,
    result,
    prize,
    homeLambda,
    awayLambda,
    stats: {
      possessionHome,
      possessionAway: 100 - possessionHome,
      shotsHome: homeScore + 2 + Math.floor(Math.random() * 6),
      shotsAway: awayScore + 1 + Math.floor(Math.random() * 5),
      shotsOnHome: homeScore + Math.floor(Math.random() * 3),
      shotsOnAway: awayScore + Math.floor(Math.random() * 2)
    }
  };
}
function withTimeline(sim, homeName, awayName) {
  return {
    ...sim,
    timeline: buildTimeline(sim.homeScore, sim.awayScore, homeName, awayName)
  };
}
function randomOpponentName() {
  const names = [
    "Rosenborg",
    "Bod\xF8/Glimt",
    "Molde FK",
    "Brann",
    "Viking FK",
    "Str\xF8msgodset",
    "Odd BK",
    "Troms\xF8 IL",
    "Haugesund",
    "Sandefjord",
    "FC Victoria",
    "Olympique Nord"
  ];
  return names[Math.floor(Math.random() * names.length)];
}
function randomOpponentStrength() {
  const base = 55 + Math.random() * 20;
  return {
    attack: base + Math.random() * 10,
    midfield: base + Math.random() * 10,
    defense: base + Math.random() * 10,
    gk: base + Math.random() * 8
  };
}

// src/routes/matches.ts
init_eventEngine();

// src/lib/challenges.ts
var CHALLENGES = [
  {
    id: "opening_blitz",
    title: "Opening Blitz",
    description: "Gagne 3 matchs en maximum 5 rencontres.",
    difficulty: "easy",
    goalType: "wins",
    goalTarget: 3,
    matchesLimit: 5,
    rewardGold: 50,
    rewardBudget: 25e3,
    parameters: { focus: "R\xE9sultats imm\xE9diats", transfers: "Libres" }
  },
  {
    id: "iron_defense",
    title: "Iron Defense",
    description: "Encha\xEEne 4 matchs sans d\xE9faite (max 6 jou\xE9s).",
    difficulty: "medium",
    goalType: "no_loss_streak",
    goalTarget: 4,
    matchesLimit: 6,
    rewardGold: 80,
    rewardBudget: 35e3,
    parameters: { tactics: "Bloc solide recommand\xE9", focus: "Solidit\xE9" }
  },
  {
    id: "academy_first",
    title: "Academy First",
    description: "Promouvoir 2 jeunes pendant le d\xE9fi (8 matchs max).",
    difficulty: "medium",
    goalType: "youth",
    goalTarget: 2,
    matchesLimit: 8,
    rewardGold: 100,
    rewardBudget: 2e4,
    restriction: "Focus acad\xE9mie",
    parameters: { youth: "Obligatoire", transfers: "Secondaire", focus: "Formation" }
  },
  {
    id: "cash_flow",
    title: "Cash Flow",
    description: "Atteindre \xA3350,000 de budget en 7 matchs.",
    difficulty: "hard",
    goalType: "budget",
    goalTarget: 35e4,
    matchesLimit: 7,
    rewardGold: 120,
    rewardBudget: 5e4,
    parameters: { transfers: "Ma\xEEtrise salariale", focus: "Finance" }
  },
  {
    id: "title_push",
    title: "Title Push",
    description: "Remporter 6 victoires en 10 matchs.",
    difficulty: "hard",
    goalType: "wins",
    goalTarget: 6,
    matchesLimit: 10,
    rewardGold: 150,
    rewardBudget: 6e4,
    parameters: { focus: "Course au titre", tactics: "Haut rythme" }
  }
];
function getChallenge(id) {
  return CHALLENGES.find((c) => c.id === id) ?? null;
}

// src/routes/live.ts
init_prisma();
import { Router as Router5 } from "express";
import { z as z3 } from "zod";
var router5 = Router5({ mergeParams: true });
router5.use(requireAuth);
var PLANS = [
  { id: "balanced", name: "\xC9quilibr\xE9", focus: "all" },
  { id: "attacking", name: "Offensif", focus: "shot" },
  { id: "defensive", name: "D\xE9fensif", focus: "defense" },
  { id: "technical", name: "Technique", focus: "dribble" },
  { id: "physical", name: "Physique", focus: "physique" }
];
async function owned(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId }, include: { players: true } });
}
router5.get("/challenges", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const active = team.challengeId ? getChallenge(team.challengeId) : null;
  res.json({
    catalog: CHALLENGES,
    active: active ? {
      ...active,
      progress: {
        wins: team.challengeWins,
        matches: team.challengeMatches,
        streak: team.challengeStreak,
        youth: team.challengeYouth
      }
    } : null
  });
});
router5.post("/challenges/start", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z3.object({ challengeId: z3.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "challengeId requis" });
  const def = getChallenge(parsed.data.challengeId);
  if (!def) return res.status(404).json({ error: "D\xE9fi introuvable" });
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.challengeId) return res.status(400).json({ error: "Un d\xE9fi est d\xE9j\xE0 actif" });
  await prisma.team.update({
    where: { id: teamId },
    data: {
      challengeId: def.id,
      challengeWins: 0,
      challengeMatches: 0,
      challengeStreak: 0,
      challengeYouth: 0
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MANAGER LIVE",
      title: `D\xE9fi : ${def.title}`,
      content: `${def.description} R\xE9compense : ${def.rewardGold} Or + \xA3${def.rewardBudget.toLocaleString()}.`
    }
  });
  res.json({ ok: true, challenge: def });
});
router5.post("/challenges/abandon", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await prisma.team.update({
    where: { id: teamId },
    data: {
      challengeId: null,
      challengeWins: 0,
      challengeMatches: 0,
      challengeStreak: 0,
      challengeYouth: 0
    }
  });
  res.json({ ok: true });
});
router5.get("/training", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  res.json({
    plans: PLANS,
    players: team.players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      trainingPlan: p.trainingPlan,
      onLoan: p.onLoan,
      isYouth: p.isYouth
    }))
  });
});
router5.post("/training/:playerId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const playerId = Number(req.params.playerId);
  const parsed = z3.object({ plan: z3.enum(["balanced", "attacking", "defensive", "technical", "physical"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Plan invalide" });
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
  if (!player) return res.status(404).json({ error: "Joueur introuvable" });
  await prisma.player.update({
    where: { id: playerId },
    data: { trainingPlan: parsed.data.plan }
  });
  res.json({ ok: true, plan: parsed.data.plan });
});
async function applyTrainingGains(teamId) {
  const players = await prisma.player.findMany({ where: { teamId, onLoan: false } });
  for (const p of players) {
    const bump = {};
    if (p.trainingPlan === "attacking") bump.shot = Math.min(99, p.shot + 1);
    else if (p.trainingPlan === "defensive") bump.defense = Math.min(99, p.defense + 1);
    else if (p.trainingPlan === "technical") bump.dribble = Math.min(99, p.dribble + 1);
    else if (p.trainingPlan === "physical") bump.physique = Math.min(99, p.physique + 1);
    else {
      const keys = ["speed", "pass"];
      const k = keys[Math.floor(Math.random() * keys.length)];
      bump[k] = Math.min(99, p[k] + 1);
    }
    if (Object.keys(bump).length) {
      await prisma.player.update({ where: { id: p.id }, data: bump });
    }
  }
}
router5.post("/loan/:playerId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const playerId = Number(req.params.playerId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
  if (!player) return res.status(404).json({ error: "Joueur introuvable" });
  if (player.onLoan) return res.status(400).json({ error: "D\xE9j\xE0 en pr\xEAt" });
  const active = team.players.filter((p) => !p.onLoan && !p.isYouth);
  if (active.length <= 11) {
    return res.status(400).json({ error: "Garde au moins 11 joueurs disponibles" });
  }
  await prisma.player.update({ where: { id: playerId }, data: { onLoan: true } });
  const fee = Math.round(player.salary * 4);
  await prisma.team.update({ where: { id: teamId }, data: { budget: team.budget + fee } });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "loan_out",
      amount: fee,
      reason: `Pr\xEAt ${player.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: "Joueur pr\xEAt\xE9",
      content: `${player.name} part en pr\xEAt. Indemnit\xE9 \xA3${fee.toLocaleString()}.`
    }
  });
  res.json({ ok: true, fee });
});
router5.post("/loan/:playerId/recall", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const playerId = Number(req.params.playerId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId, onLoan: true } });
  if (!player) return res.status(404).json({ error: "Pr\xEAt introuvable" });
  await prisma.player.update({ where: { id: playerId }, data: { onLoan: false } });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: "Fin de pr\xEAt",
      content: `${player.name} revient au club.`
    }
  });
  res.json({ ok: true });
});
var live_default = router5;

// src/lib/managerMarket.ts
init_prisma();
var CLUB_SEED = [
  { name: "Rosenborg BK", nation: "Norway", reputation: 62, leagueTier: 1, vision: "possession" },
  { name: "Bod\xF8/Glimt", nation: "Norway", reputation: 68, leagueTier: 1, vision: "high_press" },
  { name: "Molde FK", nation: "Norway", reputation: 60, leagueTier: 1, vision: "counter" },
  { name: "FC London", nation: "England", reputation: 55, leagueTier: 2, vision: "wing_play" },
  { name: "Olympique Nord", nation: "France", reputation: 58, leagueTier: 2, vision: "standard" },
  { name: "Racing Atl\xE9tico", nation: "Spain", reputation: 64, leagueTier: 1, vision: "possession" },
  { name: "SV Rhein", nation: "Germany", reputation: 57, leagueTier: 2, vision: "high_press" },
  { name: "AS Porta", nation: "Italy", reputation: 61, leagueTier: 1, vision: "park_bus" },
  { name: "Celtic Youth", nation: "Scotland", reputation: 52, leagueTier: 2, vision: "wing_play" },
  { name: "Lisboa United", nation: "Portugal", reputation: 59, leagueTier: 2, vision: "counter" },
  { name: "Bruges Academy", nation: "Belgium", reputation: 54, leagueTier: 2, vision: "standard" },
  { name: "Dynamo Est", nation: "Poland", reputation: 48, leagueTier: 3, vision: "park_bus" }
];
var MANAGER_SEED = [
  { name: "Kjetil Askild", nation: "Norway", reputation: 65, preferredVision: "high_press" },
  { name: "Marco Vialli", nation: "Italy", reputation: 70, preferredVision: "possession" },
  { name: "Hans Berger", nation: "Germany", reputation: 58, preferredVision: "counter" },
  { name: "Pierre Moreau", nation: "France", reputation: 55, preferredVision: "standard" },
  { name: "Luis Ortega", nation: "Spain", reputation: 72, preferredVision: "possession" },
  { name: "Tom Bradley", nation: "England", reputation: 50, preferredVision: "wing_play" },
  { name: "Erik Nilsen", nation: "Norway", reputation: 60, preferredVision: "high_press" },
  { name: "Giulia Rossi", nation: "Italy", reputation: 48, preferredVision: "park_bus" },
  { name: "Jan Kowalski", nation: "Poland", reputation: 42, preferredVision: "standard" },
  { name: "Sofia Mendes", nation: "Portugal", reputation: 53, preferredVision: "counter" },
  { name: "Owen Clarke", nation: "Scotland", reputation: 47, preferredVision: "wing_play" },
  { name: "Amine Benali", nation: "France", reputation: 44, preferredVision: "high_press" },
  { name: "Interim Coach A", nation: "International", reputation: 30, preferredVision: "standard" },
  { name: "Interim Coach B", nation: "International", reputation: 28, preferredVision: "park_bus" },
  { name: "Free Agent X", nation: "Brazil", reputation: 56, preferredVision: "wing_play" }
];
var VISION_COMPAT = {
  possession: ["possession", "standard", "wing_play"],
  high_press: ["high_press", "wing_play", "standard"],
  counter: ["counter", "park_bus", "standard"],
  park_bus: ["park_bus", "counter"],
  wing_play: ["wing_play", "possession", "high_press"],
  standard: ["standard", "possession", "counter", "wing_play"]
};
var CRISIS_VISIONS = /* @__PURE__ */ new Set(["park_bus", "counter", "standard"]);
function clamp2(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function roll() {
  return Math.random();
}
function visionFitScore(clubVision, managerVision) {
  if (clubVision === managerVision) return 100;
  const compat = VISION_COMPAT[clubVision] || [];
  if (compat.includes(managerVision)) return 65;
  return 20;
}
function recruitmentScore(club, manager) {
  const repFit = 100 - Math.abs(manager.reputation - club.reputation);
  const visionFit = visionFitScore(club.tacticalVision, manager.preferredVision);
  let formNeed = 50;
  if (club.jobSecurity < 40) {
    formNeed = CRISIS_VISIONS.has(manager.preferredVision) ? 90 : 35;
    if (manager.reputation >= 55) formNeed += 8;
  } else if (club.jobSecurity > 75) {
    formNeed = manager.preferredVision === "high_press" || manager.preferredVision === "possession" ? 80 : 55;
  }
  const tierTarget = club.leagueTier === 1 ? 62 : club.leagueTier === 2 ? 50 : 40;
  const tierFit = 100 - Math.min(40, Math.abs(manager.reputation - tierTarget));
  const availability = manager.status === "free" ? 100 : manager.status === "interim" ? 70 : 40;
  const nationFit = manager.nation && club.nation && manager.nation === club.nation ? 90 : manager.nation === "International" ? 55 : 45;
  const stability = clamp2(manager.seasonsAtClub * 12, 0, 60) + 40;
  const overqualified = Math.max(0, manager.reputation - club.reputation - 8);
  const costPenalty = clamp2(overqualified * 3, 0, 80);
  const S = 0.28 * repFit + 0.22 * visionFit + 0.15 * formNeed + 0.12 * tierFit + 0.1 * availability + 0.08 * nationFit + 0.05 * stability - 0.1 * costPenalty;
  return S;
}
function softMaxPick(items, temperature = 0.35) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const maxS = Math.max(...items.map((i) => i.score));
  const weights = items.map((i) => Math.exp((i.score - maxS) / (12 * temperature)));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = roll() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
function matchClubsToManagers(clubs, managers, minScore = 38) {
  const pairs = [];
  for (const c of clubs) {
    for (const m of managers) {
      const score = recruitmentScore(c, m);
      if (score >= minScore) {
        pairs.push({
          clubId: c.id,
          managerId: m.id,
          score,
          clubName: c.name,
          mgrName: m.name
        });
      }
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  const usedClubs = /* @__PURE__ */ new Set();
  const usedMgrs = /* @__PURE__ */ new Set();
  const assignments = [];
  const clubOrder = [...new Set(pairs.map((p) => p.clubId))];
  for (const clubId of clubOrder) {
    if (usedClubs.has(clubId)) continue;
    const candidates = pairs.filter((p) => p.clubId === clubId && !usedMgrs.has(p.managerId)).slice(0, 5);
    if (candidates.length === 0) continue;
    const pick3 = softMaxPick(candidates, 0.35);
    if (!pick3) continue;
    usedClubs.add(pick3.clubId);
    usedMgrs.add(pick3.managerId);
    assignments.push({
      clubId: pick3.clubId,
      managerId: pick3.managerId,
      score: pick3.score
    });
  }
  return assignments;
}
async function ensureManagerMarketSeed() {
  const count = await prisma.aiClub.count();
  if (count > 0) return;
  const managers = [];
  for (const m of MANAGER_SEED) {
    managers.push(
      await prisma.aiManager.create({
        data: {
          name: m.name,
          nation: m.nation,
          reputation: m.reputation,
          preferredVision: m.preferredVision,
          status: "free"
        }
      })
    );
  }
  for (let i = 0; i < CLUB_SEED.length; i++) {
    const c = CLUB_SEED[i];
    const mgr = managers[i] ?? null;
    await prisma.aiClub.create({
      data: {
        name: c.name,
        nation: c.nation,
        reputation: c.reputation,
        leagueTier: c.leagueTier,
        tacticalVision: c.vision,
        jobSecurity: 55 + Math.floor(Math.random() * 30),
        managerId: mgr?.id
      }
    });
    if (mgr) {
      await prisma.aiManager.update({
        where: { id: mgr.id },
        data: { status: "employed", seasonsAtClub: 1 + Math.floor(Math.random() * 3) }
      });
    }
  }
}
async function logEvent(type, clubName, managerName, detail) {
  await prisma.managerMarketEvent.create({
    data: { type, clubName, managerName, detail }
  });
}
async function tickManagerMarket(playerTeamId) {
  await ensureManagerMarketSeed();
  const clubs = await prisma.aiClub.findMany({ include: { manager: true } });
  const headlines = [];
  for (const club of clubs) {
    const r = roll();
    let result = "D";
    if (r < 0.38) result = "W";
    else if (r > 0.68) result = "L";
    let js = club.jobSecurity;
    let wins = club.wins;
    let draws = club.draws;
    let losses = club.losses;
    if (result === "W") {
      wins += 1;
      js += club.leagueTier === 1 ? 3 : 4;
    } else if (result === "D") {
      draws += 1;
      js += 1;
    } else {
      losses += 1;
      js -= club.leagueTier === 1 ? 7 : 5;
    }
    js = clamp2(js, 5, 99);
    await prisma.aiClub.update({
      where: { id: club.id },
      data: { jobSecurity: js, wins, draws, losses }
    });
  }
  const clubs2 = await prisma.aiClub.findMany({ include: { manager: true } });
  for (const club of clubs2) {
    if (!club.manager) continue;
    if (club.jobSecurity < 38 && club.manager.seasonsAtClub >= 1 && roll() < 0.42) {
      const mgrName = club.manager.name;
      await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: null, jobSecurity: 40 } });
      await prisma.aiManager.update({
        where: { id: club.manager.id },
        data: { status: "free", seasonsAtClub: 0 }
      });
      await logEvent("fired", club.name, mgrName, `${mgrName} licenci\xE9 (s\xE9cuit\xE9 critique).`);
      headlines.push(`${mgrName} vir\xE9 de ${club.name}`);
    }
  }
  const clubs3 = await prisma.aiClub.findMany({ include: { manager: true } });
  for (const club of clubs3) {
    if (!club.manager) continue;
    const m = club.manager;
    if (m.seasonsAtClub >= 4 && m.reputation > club.reputation + 12 && roll() < 0.25) {
      await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: null } });
      await prisma.aiManager.update({
        where: { id: m.id },
        data: { status: "free", seasonsAtClub: 0 }
      });
      await logEvent("left", club.name, m.name, `${m.name} quitte ${club.name} volontairement.`);
      headlines.push(`${m.name} quitte ${club.name}`);
    }
  }
  const vacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  for (const club of vacant) {
    if (roll() > 0.45) continue;
    const interim = await prisma.aiManager.findFirst({
      where: { status: "free", reputation: { lte: 35 } },
      orderBy: { reputation: "asc" }
    });
    if (!interim) continue;
    await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: interim.id } });
    await prisma.aiManager.update({
      where: { id: interim.id },
      data: { status: "interim", seasonsAtClub: 0 }
    });
    await logEvent("interim", club.name, interim.name, `${interim.name} en int\xE9rim \xE0 ${club.name}.`);
    headlines.push(`Int\xE9rim : ${interim.name} \u2192 ${club.name}`);
  }
  const stillVacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ["free", "interim"] }, reputation: { gte: 40 } }
  });
  const assignments = matchClubsToManagers(
    stillVacant.map((c) => ({
      id: c.id,
      name: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      leagueTier: c.leagueTier,
      jobSecurity: c.jobSecurity
    })),
    freeAgents.map((m) => ({
      id: m.id,
      name: m.name,
      nation: m.nation,
      reputation: m.reputation,
      preferredVision: m.preferredVision,
      status: m.status,
      seasonsAtClub: m.seasonsAtClub
    })),
    38
  );
  for (const a of assignments) {
    const club = stillVacant.find((c) => c.id === a.clubId);
    const mgr = freeAgents.find((m) => m.id === a.managerId);
    await prisma.aiClub.update({
      where: { id: club.id },
      data: {
        managerId: mgr.id,
        tacticalVision: mgr.preferredVision,
        jobSecurity: 65
      }
    });
    await prisma.aiManager.update({
      where: { id: mgr.id },
      data: { status: "employed", seasonsAtClub: 1 }
    });
    await logEvent(
      "hired",
      club.name,
      mgr.name,
      `${mgr.name} nomm\xE9 \xE0 ${club.name} (score ${a.score.toFixed(1)}, ${mgr.preferredVision}).`
    );
    headlines.push(`${mgr.name} signe \xE0 ${club.name}`);
  }
  if (roll() < 0.12) {
    const employed = await prisma.aiManager.findMany({ where: { status: "employed" } });
    for (const m of employed) {
      await prisma.aiManager.update({
        where: { id: m.id },
        data: { seasonsAtClub: m.seasonsAtClub + 1 }
      });
    }
  }
  if (playerTeamId && headlines.length > 0) {
    const pick3 = headlines.slice(0, 2).join(" \xB7 ");
    await prisma.message.create({
      data: {
        teamId: playerTeamId,
        sender: "MANAGER MARKET",
        title: "Mouvements d\u2019entra\xEEneurs",
        content: pick3
      }
    });
  }
  if (headlines.length === 0 && clubs.length) {
    const c = clubs[Math.floor(Math.random() * clubs.length)];
    const form = `${c.wins}V-${c.draws}N-${c.losses}D`;
    headlines.push(`${c.name} (${form}) \xB7 vision ${c.tacticalVision}`);
  }
  return { headlines, assignments: assignments.length };
}

// src/routes/matches.ts
var router6 = Router6({ mergeParams: true });
router6.use(requireAuth);
router6.get("/preview", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    include: { players: true }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const available = team.players.filter((p) => !p.onLoan);
  const opponent = randomOpponentName();
  const home = strengthFromPlayers(available);
  res.json({
    homeName: team.name,
    opponent,
    competition: "Championnat",
    venue: "Domicile",
    kickoffLabel: "Prochaine journ\xE9e",
    availablePlayers: available.length,
    formHint: `${team.wins}V \xB7 ${team.draws}N \xB7 ${team.losses}D`,
    tacticalVision: team.tacticalVision,
    strength: {
      attack: Math.round(home.attack),
      midfield: Math.round(home.midfield),
      defense: Math.round(home.defense),
      gk: Math.round(home.gk)
    }
  });
});
router6.post("/play", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    include: { players: true }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const available = team.players.filter((p) => !p.onLoan);
  if (available.length < 11) {
    return res.status(400).json({ error: "Il faut au moins 11 joueurs disponibles (hors pr\xEAt)" });
  }
  const home = strengthFromPlayers(available);
  const awayName = randomOpponentName();
  const away = randomOpponentStrength();
  const raw = simulateMatch(home, away);
  const sim = withTimeline(raw, team.name, awayName);
  const wins = team.wins + (sim.result === "W" ? 1 : 0);
  const draws = team.draws + (sim.result === "D" ? 1 : 0);
  const losses = team.losses + (sim.result === "L" ? 1 : 0);
  let newBudget = team.budget + sim.prize;
  let goldBalance = team.goldBalance;
  let challengeId = team.challengeId;
  let challengeWins = team.challengeWins;
  let challengeMatches = team.challengeMatches;
  let challengeStreak = team.challengeStreak;
  let challengeYouth = team.challengeYouth;
  let challengeResult = null;
  if (challengeId) {
    const def = getChallenge(challengeId);
    challengeMatches += 1;
    if (sim.result === "W") {
      challengeWins += 1;
      challengeStreak += 1;
    } else if (sim.result === "L") {
      challengeStreak = 0;
    } else {
      challengeStreak += 1;
    }
    if (def) {
      let completed = false;
      let failed = false;
      if (def.goalType === "wins" && challengeWins >= def.goalTarget) completed = true;
      if (def.goalType === "no_loss_streak" && challengeStreak >= def.goalTarget) completed = true;
      if (def.goalType === "youth" && challengeYouth >= def.goalTarget) completed = true;
      if (def.goalType === "budget" && newBudget >= def.goalTarget) completed = true;
      if (challengeMatches >= def.matchesLimit && !completed) failed = true;
      if (completed) {
        newBudget += def.rewardBudget;
        goldBalance += def.rewardGold;
        challengeResult = {
          status: "won",
          title: def.title,
          note: `D\xE9fi r\xE9ussi ! +${def.rewardGold} Or + \xA3${def.rewardBudget.toLocaleString()}`
        };
        await prisma.message.create({
          data: {
            teamId,
            sender: "MANAGER LIVE",
            title: `D\xE9fi r\xE9ussi : ${def.title}`,
            content: challengeResult.note
          }
        });
        await prisma.transaction.create({
          data: {
            teamId,
            type: "challenge_reward",
            amount: def.rewardBudget,
            reason: `R\xE9compense ${def.title}`
          }
        });
        const hasCW = await prisma.achievement.findFirst({
          where: { teamId, achievementCode: "challenge_won" }
        });
        if (!hasCW) {
          await prisma.achievement.create({
            data: { teamId, achievementCode: "challenge_won" }
          });
        }
        challengeId = null;
        challengeWins = 0;
        challengeMatches = 0;
        challengeStreak = 0;
        challengeYouth = 0;
      } else if (failed) {
        challengeResult = {
          status: "failed",
          title: def.title,
          note: "D\xE9fi \xE9chou\xE9 \u2014 limite de matchs atteinte."
        };
        await prisma.message.create({
          data: {
            teamId,
            sender: "MANAGER LIVE",
            title: `D\xE9fi \xE9chou\xE9 : ${def.title}`,
            content: challengeResult.note
          }
        });
        challengeId = null;
        challengeWins = 0;
        challengeMatches = 0;
        challengeStreak = 0;
        challengeYouth = 0;
      } else {
        const progressLabel = def.goalType === "wins" ? `${challengeWins}/${def.goalTarget} victoires \xB7 ${challengeMatches}/${def.matchesLimit} matchs` : def.goalType === "no_loss_streak" ? `S\xE9rie ${challengeStreak}/${def.goalTarget} \xB7 ${challengeMatches}/${def.matchesLimit} matchs` : `Progression ${challengeMatches}/${def.matchesLimit}`;
        challengeResult = {
          status: "ongoing",
          title: def.title,
          note: progressLabel
        };
      }
    }
  }
  await prisma.team.update({
    where: { id: teamId },
    data: {
      wins,
      draws,
      losses,
      budget: newBudget,
      goldBalance,
      challengeId,
      challengeWins,
      challengeMatches,
      challengeStreak,
      challengeYouth
    }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "match_prize",
      amount: sim.prize,
      reason: `Match vs ${awayName} (${sim.homeScore}-${sim.awayScore})`
    }
  });
  const resultLabel = sim.result === "W" ? "Victoire" : sim.result === "D" ? "Match nul" : "D\xE9faite";
  await prisma.message.create({
    data: {
      teamId,
      sender: "REPORTING MATCH",
      title: `${resultLabel} ${sim.homeScore}-${sim.awayScore} vs ${awayName}`,
      content: `Prime : \xA3${sim.prize.toLocaleString()}.`
    }
  });
  if (sim.result === "W") {
    const hasFirst = await prisma.achievement.findFirst({
      where: { teamId, achievementCode: "first_win" }
    });
    if (!hasFirst) {
      await prisma.achievement.create({ data: { teamId, achievementCode: "first_win" } });
      await prisma.message.create({
        data: {
          teamId,
          sender: "SUCC\xC8S",
          title: "First Blood",
          content: "Succ\xE8s d\xE9bloqu\xE9 : premi\xE8re victoire !"
        }
      });
    }
    if (wins >= 5) {
      const hasRoll = await prisma.achievement.findFirst({
        where: { teamId, achievementCode: "five_wins" }
      });
      if (!hasRoll) {
        await prisma.achievement.create({ data: { teamId, achievementCode: "five_wins" } });
      }
    }
  }
  await applyTrainingGains(teamId);
  let leagueTable = null;
  try {
    leagueTable = await applyMatchToLeague(teamId, sim.result, sim.homeScore, sim.awayScore);
  } catch (e) {
    console.error("league update failed", e);
  }
  try {
    const { matchChronicleText: matchChronicleText2, writeChronicle: writeChronicle2 } = await Promise.resolve().then(() => (init_chronicle(), chronicle_exports));
    const ch = matchChronicleText2(team.name, awayName, sim.homeScore, sim.awayScore, sim.result);
    await writeChronicle2(teamId, {
      type: "match",
      tone: ch.tone,
      headline: ch.headline,
      body: ch.body,
      meta: { result: sim.result, homeScore: sim.homeScore, awayScore: sim.awayScore, opponent: awayName }
    });
  } catch (e) {
    console.error("chronicle match failed", e);
  }
  let marketHeadlines = [];
  try {
    const market = await tickManagerMarket(teamId);
    marketHeadlines = market.headlines;
    if (marketHeadlines.length) {
      const { writeChronicle: writeChronicle2 } = await Promise.resolve().then(() => (init_chronicle(), chronicle_exports));
      await writeChronicle2(teamId, {
        type: "market",
        tone: "tension",
        headline: marketHeadlines[0].slice(0, 120),
        body: marketHeadlines.slice(0, 3).join(" \xB7 "),
        meta: { headlines: marketHeadlines }
      });
    }
  } catch (e) {
    console.error("manager market tick failed", e);
  }
  let event = null;
  let eventsCreated = [];
  try {
    eventsCreated = await tickCareerEvents(teamId, { result: sim.result });
    event = toLegacyUnexpectedShape(await getPendingEvent(teamId));
  } catch (e) {
    console.error("event engine tick failed", e);
  }
  res.json({
    match: {
      opponent: awayName,
      homeName: team.name,
      homeScore: sim.homeScore,
      awayScore: sim.awayScore,
      result: sim.result,
      prize: sim.prize,
      stats: sim.stats,
      timeline: sim.timeline,
      venue: "Domicile",
      competition: "Championnat"
    },
    preview: {
      opponent: awayName,
      competition: "Championnat",
      venue: "Domicile",
      importance: sim.result === "W" ? "\xE9lev\xE9e" : "normale"
    },
    team: { wins, draws, losses, budget: newBudget, goldBalance },
    event,
    eventsCreated,
    challenge: challengeResult,
    marketHeadlines,
    leagueTable: leagueTable?.slice(0, 12) ?? null
  });
});
var matches_default = router6;

// src/routes/shop.ts
init_prisma();
import { Router as Router7 } from "express";
import { z as z4 } from "zod";
var router7 = Router7({ mergeParams: true });
router7.use(requireAuth);
var CATALOG = [
  { id: "stadium_2", name: "Stade niv. 2", price: 200, effect: "budget_bonus", value: 15e3 },
  { id: "training_ai", name: "Formation IA", price: 120, effect: "gold", value: 40 },
  { id: "coach", name: "Coach Expert", price: 150, effect: "job_boost", value: 3 },
  { id: "medical", name: "Staff M\xE9dical", price: 100, effect: "job_boost", value: 2 },
  { id: "badge_skin", name: "Skin \xE9cusson", price: 40, effect: "cosmetic", value: 0 },
  { id: "kit_custom", name: "Maillot custom", price: 60, effect: "cosmetic", value: 0 },
  { id: "gold_pack", name: "Pack Or +80", price: 50, effect: "gold", value: 80 }
];
router7.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  res.json({
    gold: team.goldBalance,
    items: CATALOG.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      effect: i.effect
    }))
  });
});
router7.post("/buy", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z4.object({ itemId: z4.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "itemId requis" });
  const item = CATALOG.find((i) => i.id === parsed.data.itemId);
  if (!item) return res.status(404).json({ error: "Article introuvable" });
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.goldBalance < item.price) {
    return res.status(400).json({ error: "Or insuffisant" });
  }
  let budget = team.budget;
  let gold = team.goldBalance - item.price;
  let jobSecurity = team.jobSecurity;
  if (item.effect === "budget_bonus") budget += item.value;
  if (item.effect === "gold") gold += item.value;
  if (item.effect === "job_boost") jobSecurity = Math.min(99, jobSecurity + item.value);
  await prisma.team.update({
    where: { id: teamId },
    data: { goldBalance: gold, budget, jobSecurity }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "shop",
      amount: -item.price,
      reason: `Achat boutique: ${item.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "BOUTIQUE",
      title: "Achat confirm\xE9",
      content: `Vous avez achet\xE9 ${item.name} pour ${item.price} Or.`
    }
  });
  res.json({ ok: true, gold, budget });
});
var shop_default = router7;

// src/routes/achievements.ts
init_prisma();
import { Router as Router8 } from "express";
var DEFINITIONS = [
  { code: "first_win", name: "First Blood", description: "Premi\xE8re victoire" },
  { code: "five_wins", name: "On a Roll", description: "5 victoires au total" },
  { code: "wealthy", name: "Wealthy", description: "Budget > \xA3500,000" }
];
var router8 = Router8({ mergeParams: true });
router8.use(requireAuth);
router8.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.budget >= 5e5) {
    const has = await prisma.achievement.findFirst({
      where: { teamId, achievementCode: "wealthy" }
    });
    if (!has) {
      await prisma.achievement.create({
        data: { teamId, achievementCode: "wealthy" }
      });
    }
  }
  const unlocked = await prisma.achievement.findMany({ where: { teamId } });
  const codes = new Set(unlocked.map((a) => a.achievementCode));
  res.json({
    achievements: DEFINITIONS.map((d) => ({
      ...d,
      unlocked: codes.has(d.code),
      unlockedAt: unlocked.find((u) => u.achievementCode === d.code)?.unlockedAt ?? null
    }))
  });
});
var achievements_default = router8;

// src/routes/budget.ts
init_prisma();
import { Router as Router9 } from "express";
var router9 = Router9({ mergeParams: true });
router9.use(requireAuth);
router9.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    include: { players: true }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const transactions = await prisma.transaction.findMany({
    where: { teamId },
    orderBy: { transactionDate: "desc" },
    take: 30
  });
  const weeklySalaries = team.players.reduce((s, p) => s + p.salary, 0);
  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  res.json({
    budget: team.budget,
    gold: team.goldBalance,
    weeklySalaries,
    income,
    expenses,
    transactions
  });
});
var budget_default = router9;

// src/routes/career.ts
init_prisma();
import { Router as Router10 } from "express";
import { z as z5 } from "zod";

// src/lib/gameSystems.ts
var TACTICAL_VISIONS = [
  { id: "standard", name: "Standard", desc: "\xC9quilibre construction / solidit\xE9" },
  { id: "possession", name: "Possession", desc: "Close support, contr\xF4le du tempo" },
  { id: "high_press", name: "High Pressing", desc: "Pressing haut, r\xE9cup\xE9ration rapide" },
  { id: "counter", name: "Counter Attack", desc: "Bloc bas, transitions verticales" },
  { id: "wing_play", name: "Wing Play", desc: "Largeur et centres" },
  { id: "park_bus", name: "Park The Bus", desc: "D\xE9fense profonde, minimalisme" }
];
function defaultBoardObjectives(wins = 0, budget = 2e5) {
  return [
    { code: "wins", label: "Remporter 10 matchs", target: 10, current: wins, weight: 40 },
    { code: "budget", label: "Rester solvable (> \xA350k)", target: 5e4, current: budget, weight: 25 },
    { code: "squad", label: "Maintenir 14 joueurs min.", target: 14, current: 14, weight: 15 },
    { code: "youth", label: "Promouvoir 1 jeune", target: 1, current: 0, weight: 20 }
  ];
}
function computeJobSecurity(objectives, form) {
  let score = 55;
  for (const o of objectives) {
    const ratio = o.target === 0 ? 1 : Math.min(1, o.current / o.target);
    score += (ratio - 0.5) * o.weight * 0.4;
  }
  const played = form.w + form.d + form.l;
  if (played > 0) {
    const winRate = form.w / played;
    score += (winRate - 0.4) * 30;
  }
  return Math.max(5, Math.min(99, Math.round(score)));
}
var FIRST2 = ["Yanis", "Hugo", "Amine", "L\xE9o", "Noa", "Ilyes", "Sacha", "Eden", "Rayan", "Ma\xEBl"];
var LAST2 = ["Moreau", "Petit", "Garcia", "Bernard", "Roux", "Faure", "Garnier", "Chevalier"];
function generateYouthProspect(nation = "France") {
  const name = `${FIRST2[Math.floor(Math.random() * FIRST2.length)]} ${LAST2[Math.floor(Math.random() * LAST2.length)]}`;
  const positions = ["GK", "DF", "MF", "FW"];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const pot = 65 + Math.floor(Math.random() * 25);
  const base = 45 + Math.floor(Math.random() * 15);
  return {
    name,
    position,
    nation,
    salary: 1500 + Math.floor(Math.random() * 2500),
    speed: base + Math.floor(Math.random() * 15),
    dribble: base + Math.floor(Math.random() * 15),
    shot: base + Math.floor(Math.random() * 12),
    pass: base + Math.floor(Math.random() * 15),
    defense: base + Math.floor(Math.random() * 15),
    physique: base + Math.floor(Math.random() * 12),
    potential: pot
  };
}

// src/routes/career.ts
var router10 = Router10({ mergeParams: true });
router10.use(requireAuth);
async function getOwnedTeam(userId, teamId) {
  return prisma.team.findFirst({
    where: { id: teamId, userId },
    include: { players: true, _count: { select: { players: true } } }
  });
}
router10.get("/board", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const objectives = defaultBoardObjectives(team.wins, team.budget).map((o) => {
    if (o.code === "squad") return { ...o, current: team.players.length };
    if (o.code === "youth") return { ...o, current: team.youthPromoted };
    if (o.code === "wins") return { ...o, current: team.wins };
    if (o.code === "budget") return { ...o, current: team.budget };
    return o;
  });
  const jobSecurity = computeJobSecurity(objectives, {
    w: team.wins,
    d: team.draws,
    l: team.losses
  });
  if (jobSecurity !== team.jobSecurity) {
    await prisma.team.update({ where: { id: teamId }, data: { jobSecurity } });
  }
  res.json({
    jobSecurity,
    tacticalVision: team.tacticalVision,
    objectives,
    visions: TACTICAL_VISIONS
  });
});
router10.post("/tactics", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z5.object({ vision: z5.enum(["standard", "possession", "high_press", "counter", "wing_play", "park_bus"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Vision tactique invalide" });
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await prisma.team.update({
    where: { id: teamId },
    data: { tacticalVision: parsed.data.vision }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "STAFF TECHNIQUE",
      title: "Nouvelle Tactical Vision",
      content: `Le club adopte la vision : ${parsed.data.vision}. Les entra\xEEnements s\u2019adaptent.`
    }
  });
  res.json({ ok: true, tacticalVision: parsed.data.vision });
});
router10.post("/event/resolve", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z5.object({
    eventId: z5.string(),
    choiceId: z5.string(),
    effect: z5.string().optional()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Choix invalide" });
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  try {
    const { resolveCareerEvent: resolveCareerEvent2 } = await Promise.resolve().then(() => (init_eventEngine(), eventEngine_exports));
    const exists = await prisma.careerEvent.findFirst({
      where: { id: parsed.data.eventId, teamId }
    });
    if (exists) {
      const { event, result } = await resolveCareerEvent2(teamId, parsed.data.eventId, parsed.data.choiceId);
      return res.json({
        ok: true,
        budget: result.budget,
        jobSecurity: result.jobSecurity,
        tacticalVision: result.tacticalVision,
        note: result.note,
        event
      });
    }
  } catch (e) {
    if (e instanceof Error && e.message !== "\xC9v\xE9nement introuvable") {
      return res.status(400).json({ error: e.message });
    }
  }
  let budget = team.budget;
  let jobSecurity = team.jobSecurity;
  let tacticalVision = team.tacticalVision;
  let note = "D\xE9cision enregistr\xE9e.";
  const effect = parsed.data.effect ?? "";
  switch (effect) {
    case "pay_5k":
      budget -= 5e3;
      note = "Soins m\xE9dicaux : -\xA35,000.";
      break;
    case "bonus_40k":
      budget += 4e4;
      note = "Injection board : +\xA340,000. Objectifs durcis.";
      break;
    case "vision_press":
      tacticalVision = "high_press";
      note = "Passage en High Pressing.";
      break;
    case "job_down":
      jobSecurity = Math.max(5, jobSecurity - 8);
      note = "Le board note ton inflexibilit\xE9 (-8 s\xE9curit\xE9).";
      break;
    case "morale_up":
      jobSecurity = Math.min(99, jobSecurity + 3);
      note = "Communication positive (+3 s\xE9curit\xE9).";
      break;
    default:
      note = "Statu quo.";
  }
  await prisma.team.update({
    where: { id: teamId },
    data: { budget, jobSecurity, tacticalVision }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "UNEXPECTED EVENT",
      title: `D\xE9cision : ${parsed.data.eventId}`,
      content: note
    }
  });
  if (effect === "pay_5k" || effect === "bonus_40k") {
    await prisma.transaction.create({
      data: {
        teamId,
        type: "event",
        amount: effect === "bonus_40k" ? 4e4 : -5e3,
        reason: note
      }
    });
  }
  res.json({ ok: true, budget, jobSecurity, tacticalVision, note });
});
router10.get("/youth", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const youth = team.players.filter((p) => p.isYouth);
  res.json({ youth, count: youth.length });
});
router10.post("/youth/scout", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.budget < 8e3) return res.status(400).json({ error: "Budget insuffisant (\xA38,000 requis)" });
  if (team.players.length >= 16) return res.status(400).json({ error: "Effectif plein (16 max)" });
  const prospect = generateYouthProspect(team.nation ?? "France");
  const player = await prisma.player.create({
    data: {
      teamId,
      name: prospect.name,
      position: prospect.position,
      nation: prospect.nation,
      salary: prospect.salary,
      speed: prospect.speed,
      dribble: prospect.dribble,
      shot: prospect.shot,
      pass: prospect.pass,
      defense: prospect.defense,
      physique: prospect.physique,
      potential: prospect.potential,
      isYouth: true,
      contractUntil: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1e3)
    }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - 8e3 }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "youth_scout",
      amount: -8e3,
      reason: `Scout acad\xE9mie : ${player.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "YOUTH ACADEMY",
      title: "Nouveau prospect",
      content: `${player.name} (${player.position}) rejoint l\u2019acad\xE9mie. Potentiel estim\xE9 : ${prospect.potential}.`
    }
  });
  res.status(201).json({ player, potential: prospect.potential });
});
router10.post("/youth/promote/:playerId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const playerId = Number(req.params.playerId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const player = await prisma.player.findFirst({
    where: { id: playerId, teamId, isYouth: true }
  });
  if (!player) return res.status(404).json({ error: "Prospect introuvable" });
  await prisma.player.update({
    where: { id: playerId },
    data: { isYouth: false }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { youthPromoted: team.youthPromoted + 1 }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "YOUTH ACADEMY",
      title: "Promotion",
      content: `${player.name} int\xE8gre l\u2019\xE9quipe premi\xE8re.`
    }
  });
  res.json({ ok: true });
});
router10.get("/market", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const listings = Array.from({ length: 8 }).map(() => {
    const p = generateYouthProspect();
    const rating = Math.round(
      (p.speed + p.dribble + p.shot + p.pass + p.defense + p.physique) / 6 * 10
    ) / 10;
    const price = Math.round(15e3 + rating * 8e3 + p.potential * 200);
    return {
      tempId: `${p.name}-${p.position}-${price}`,
      ...p,
      rating,
      price
    };
  });
  res.json({ listings, budget: team.budget });
});
router10.post("/market/buy", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const schema = z5.object({
    name: z5.string(),
    position: z5.string(),
    nation: z5.string().optional(),
    salary: z5.number(),
    speed: z5.number(),
    dribble: z5.number(),
    shot: z5.number(),
    pass: z5.number(),
    defense: z5.number(),
    physique: z5.number(),
    potential: z5.number().optional(),
    price: z5.number().positive()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Joueur invalide" });
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.players.length >= 16) return res.status(400).json({ error: "Effectif plein" });
  if (team.budget < parsed.data.price) return res.status(400).json({ error: "Budget insuffisant" });
  const p = parsed.data;
  const player = await prisma.player.create({
    data: {
      teamId,
      name: p.name,
      position: p.position,
      nation: p.nation ?? "International",
      salary: p.salary,
      speed: p.speed,
      dribble: p.dribble,
      shot: p.shot,
      pass: p.pass,
      defense: p.defense,
      physique: p.physique,
      potential: p.potential ?? 75,
      isYouth: false,
      contractUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1e3)
    }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - p.price }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "transfer_in",
      amount: -p.price,
      reason: `Achat ${p.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: "Transfert valid\xE9",
      content: `${p.name} signe pour \xA3${p.price.toLocaleString()}. Contrat 2 ans.`
    }
  });
  res.status(201).json({ player });
});
router10.post("/market/sell/:playerId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const playerId = Number(req.params.playerId);
  const team = await getOwnedTeam(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
  if (!player) return res.status(404).json({ error: "Joueur introuvable" });
  if (team.players.length <= 11) {
    return res.status(400).json({ error: "Il faut garder au moins 11 joueurs" });
  }
  const rating = (player.speed + player.dribble + player.shot + player.pass + player.defense + player.physique) / 6;
  const fee = Math.round(rating * 2200 + player.salary * 4);
  await prisma.player.delete({ where: { id: playerId } });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget + fee }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "transfer_out",
      amount: fee,
      reason: `Vente ${player.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: "Joueur vendu",
      content: `${player.name} part pour \xA3${fee.toLocaleString()}.`
    }
  });
  res.json({ ok: true, fee });
});
var career_default = router10;

// src/routes/legends.ts
init_prisma();
import { Router as Router11 } from "express";

// src/lib/legends.ts
var LEGENDS = [
  {
    code: "legend_zinedine",
    name: "Z. Legend",
    position: "MF",
    nation: "France",
    stats: { speed: 82, dribble: 92, shot: 88, pass: 95, defense: 55, physique: 78 },
    salary: 45e3,
    unlock: "five_wins"
  },
  {
    code: "legend_striker",
    name: "R. Hero",
    position: "FW",
    nation: "Brazil",
    stats: { speed: 90, dribble: 91, shot: 94, pass: 80, defense: 40, physique: 75 },
    salary: 5e4,
    unlock: "challenge_won"
  },
  {
    code: "legend_wall",
    name: "C. Wall",
    position: "DF",
    nation: "Italy",
    stats: { speed: 72, dribble: 65, shot: 50, pass: 78, defense: 94, physique: 90 },
    salary: 38e3,
    unlock: "first_win"
  }
];

// src/routes/legends.ts
var router11 = Router11({ mergeParams: true });
router11.use(requireAuth);
router11.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    include: { achievements: true, players: true }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const codes = new Set(team.achievements.map((a) => a.achievementCode));
  const hasChallengeWin = codes.has("challenge_won") || team.wins >= 3;
  const list = LEGENDS.map((l) => {
    const unlocked = l.unlock === "challenge_won" ? hasChallengeWin : codes.has(l.unlock) || l.unlock === "first_win" && team.wins >= 1;
    const owned4 = team.players.some((p) => p.isLegend && p.name === l.name);
    return { ...l, unlocked, owned: owned4 };
  });
  res.json({ legends: list });
});
router11.post("/recruit/:code", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const code = req.params.code;
  const legend = LEGENDS.find((l) => l.code === code);
  if (!legend) return res.status(404).json({ error: "L\xE9gende introuvable" });
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    include: { achievements: true, players: true }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.players.length >= 16) return res.status(400).json({ error: "Effectif plein" });
  if (team.players.some((p) => p.isLegend && p.name === legend.name)) {
    return res.status(400).json({ error: "D\xE9j\xE0 dans l\u2019effectif" });
  }
  const codes = new Set(team.achievements.map((a) => a.achievementCode));
  const unlocked = legend.unlock === "challenge_won" ? team.wins >= 3 || codes.has("challenge_won") : codes.has(legend.unlock) || legend.unlock === "first_win" && team.wins >= 1;
  if (!unlocked) return res.status(403).json({ error: "L\xE9gende non d\xE9bloqu\xE9e" });
  const cost = 8e4;
  if (team.budget < cost) return res.status(400).json({ error: "Budget insuffisant (\xA380,000)" });
  const s = legend.stats;
  const player = await prisma.player.create({
    data: {
      teamId,
      name: legend.name,
      position: legend.position,
      nation: legend.nation,
      salary: legend.salary,
      speed: s.speed,
      dribble: s.dribble,
      shot: s.shot,
      pass: s.pass,
      defense: s.defense,
      physique: s.physique,
      potential: 95,
      isLegend: true,
      isYouth: false,
      contractUntil: new Date(Date.now() + 365 * 24 * 3600 * 1e3)
    }
  });
  await prisma.team.update({ where: { id: teamId }, data: { budget: team.budget - cost } });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "legend_in",
      amount: -cost,
      reason: `Recrutement l\xE9gende ${legend.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "ICONS & HEROES",
      title: "L\xE9gende engag\xE9e",
      content: `${legend.name} rejoint le club pour \xA3${cost.toLocaleString()}.`
    }
  });
  res.status(201).json({ player });
});
var legends_default = router11;

// src/routes/managerMarket.ts
init_prisma();
import { Router as Router12 } from "express";
var router12 = Router12({ mergeParams: true });
router12.use(requireAuth);
router12.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureManagerMarketSeed();
  const clubs = await prisma.aiClub.findMany({
    include: { manager: true },
    orderBy: { reputation: "desc" }
  });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ["free", "interim"] } },
    orderBy: { reputation: "desc" }
  });
  const events = await prisma.managerMarketEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 25
  });
  res.json({
    clubs: clubs.map((c) => ({
      id: c.id,
      name: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      leagueTier: c.leagueTier,
      jobSecurity: c.jobSecurity,
      record: `${c.wins}V ${c.draws}N ${c.losses}D`,
      manager: c.manager ? {
        name: c.manager.name,
        nation: c.manager.nation,
        reputation: c.manager.reputation,
        status: c.manager.status,
        preferredVision: c.manager.preferredVision,
        seasonsAtClub: c.manager.seasonsAtClub
      } : null
    })),
    freeAgents: freeAgents.map((m) => ({
      id: m.id,
      name: m.name,
      nation: m.nation,
      reputation: m.reputation,
      status: m.status,
      preferredVision: m.preferredVision
    })),
    events
  });
});
router12.post("/tick", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const result = await tickManagerMarket(teamId);
  res.json(result);
});
router12.get("/jobs", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureManagerMarketSeed();
  const clubs = await prisma.aiClub.findMany({ include: { manager: true }, orderBy: { reputation: "desc" } });
  const playerRep = Math.min(90, 40 + team.wins * 3 + Math.floor(team.budget / 5e4));
  const vision = team.tacticalVision || "standard";
  const jobs = clubs.map((c) => {
    const vacant = !c.manager || c.manager.status === "interim";
    const shaky = (c.jobSecurity ?? 50) < 40;
    if (!vacant && !shaky) return null;
    const visionFit = c.tacticalVision === vision ? 25 : 10;
    const repFit = 20 - Math.min(20, Math.abs(playerRep - c.reputation) / 3);
    const urgency = vacant ? 20 : shaky ? 12 : 0;
    const score = Math.round(visionFit + repFit + urgency + (100 - (c.jobSecurity ?? 50)) * 0.15);
    return {
      clubId: c.id,
      clubName: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      jobSecurity: c.jobSecurity,
      status: vacant ? "vacant" : "under_pressure",
      managerName: c.manager?.name ?? null,
      compatibility: Math.max(5, Math.min(99, score)),
      likelihood: score >= 55 ? "\xE9lev\xE9e" : score >= 40 ? "moyenne" : "faible"
    };
  }).filter(Boolean).sort((a, b) => b.compatibility - a.compatibility).slice(0, 12);
  res.json({
    playerReputation: playerRep,
    tacticalVision: vision,
    jobs
  });
});
router12.post("/jobs/:clubId/apply", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const clubId = Number(req.params.clubId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const club = await prisma.aiClub.findUnique({ where: { id: clubId }, include: { manager: true } });
  if (!club) return res.status(404).json({ error: "Club introuvable" });
  const playerRep = Math.min(90, 40 + team.wins * 3 + Math.floor(team.budget / 5e4));
  const vision = team.tacticalVision || "standard";
  const vacant = !club.manager || club.manager.status === "interim";
  const shaky = (club.jobSecurity ?? 50) < 40;
  if (!vacant && !shaky) {
    return res.status(400).json({ error: "Ce poste n\u2019est pas ouvert actuellement" });
  }
  const visionFit = club.tacticalVision === vision ? 25 : 10;
  const repFit = 20 - Math.min(20, Math.abs(playerRep - club.reputation) / 3);
  const score = visionFit + repFit + (vacant ? 20 : 12);
  const accepted = score >= 42 && Math.random() < 0.55 + score / 200;
  await prisma.message.create({
    data: {
      teamId,
      sender: "MANAGER MARKET",
      title: accepted ? `Candidature accept\xE9e \u2014 ${club.name}` : `Candidature refus\xE9e \u2014 ${club.name}`,
      content: accepted ? `Le conseil de ${club.name} retient votre profil (compatibilit\xE9 ${Math.round(score)}). Suite narrative en carri\xE8re avanc\xE9e.` : `${club.name} privil\xE9gie un autre profil pour le moment (score ${Math.round(score)}).`
    }
  });
  await prisma.managerMarketEvent.create({
    data: {
      type: accepted ? "application_accepted" : "application_rejected",
      clubName: club.name,
      managerName: team.name,
      detail: `score ${Math.round(score)} \xB7 teamId ${teamId}`
    }
  });
  res.json({
    ok: true,
    accepted,
    clubName: club.name,
    score: Math.round(score),
    note: accepted ? "Profil retenu" : "Profil non retenu"
  });
});
var managerMarket_default = router12;

// src/routes/events.ts
import { Router as Router13 } from "express";
import { z as z6 } from "zod";
init_prisma();
init_eventEngine();
var router13 = Router13({ mergeParams: true });
router13.use(requireAuth);
async function getOwnedTeam2(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId } });
}
router13.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const status = typeof req.query.status === "string" ? req.query.status : void 0;
  const events = await listEvents(teamId, status);
  const pending = await getPendingEvent(teamId);
  res.json({
    events,
    pending,
    legacy: toLegacyUnexpectedShape(pending),
    counts: {
      pending: events.filter((e) => e.status === "pending").length,
      resolved: events.filter((e) => e.status === "resolved").length
    }
  });
});
router13.get("/pending", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await getOwnedTeam2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const pending = await getPendingEvent(teamId);
  res.json({ pending, legacy: toLegacyUnexpectedShape(pending) });
});
router13.post("/:eventId/resolve", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const eventId = req.params.eventId;
  const team = await getOwnedTeam2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const parsed = z6.object({ choiceId: z6.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "choiceId requis" });
  try {
    const { event, result } = await resolveCareerEvent(teamId, eventId, parsed.data.choiceId);
    const next = await getPendingEvent(teamId);
    res.json({
      ok: true,
      event,
      result,
      team: {
        budget: result.budget,
        jobSecurity: result.jobSecurity,
        tacticalVision: result.tacticalVision
      },
      nextPending: next,
      legacy: toLegacyUnexpectedShape(next)
    });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Erreur r\xE9solution" });
  }
});
var events_default = router13;

// src/routes/staff.ts
init_prisma();
import { Router as Router14 } from "express";
import { z as z7 } from "zod";
var router14 = Router14({ mergeParams: true });
router14.use(requireAuth);
var CATALOG2 = [
  { role: "assistant", name: "Adjoint tactique", rating: 72, salary: 1800, specialty: "Tactique", cost: 12e3 },
  { role: "scout", name: "Scout senior", rating: 70, salary: 1500, specialty: "D\xE9tection", cost: 1e4 },
  { role: "medical", name: "M\xE9decin du sport", rating: 74, salary: 2e3, specialty: "R\xE9cup\xE9ration", cost: 14e3 },
  { role: "fitness", name: "Pr\xE9pa physique", rating: 68, salary: 1300, specialty: "Condition", cost: 9e3 },
  { role: "analyst", name: "Analyste vid\xE9o", rating: 66, salary: 1100, specialty: "Data", cost: 8e3 },
  { role: "youth", name: "Resp. acad\xE9mie", rating: 71, salary: 1600, specialty: "Jeunes", cost: 11e3 }
];
async function owned2(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId } });
}
router14.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const staff = await prisma.staffMember.findMany({
    where: { teamId },
    orderBy: { hiredAt: "desc" }
  });
  res.json({
    staff,
    catalog: CATALOG2.map((c) => ({
      ...c,
      hired: staff.some((s) => s.role === c.role)
    })),
    weeklyStaffCost: staff.reduce((s, x) => s + x.salary, 0)
  });
});
router14.post("/hire", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z7.object({ role: z7.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "role requis" });
  const def = CATALOG2.find((c) => c.role === parsed.data.role);
  if (!def) return res.status(404).json({ error: "Profil staff inconnu" });
  const team = await owned2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const already = await prisma.staffMember.findFirst({ where: { teamId, role: def.role } });
  if (already) return res.status(400).json({ error: "Poste d\xE9j\xE0 pourvu" });
  if (team.budget < def.cost) return res.status(400).json({ error: "Budget insuffisant" });
  const member = await prisma.staffMember.create({
    data: {
      teamId,
      role: def.role,
      name: def.name,
      rating: def.rating,
      salary: def.salary,
      specialty: def.specialty
    }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - def.cost }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "staff_hire",
      amount: -def.cost,
      reason: `Recrutement staff : ${def.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "DIRECTION RH",
      title: "Nouveau staff",
      content: `${def.name} rejoint le club (${def.specialty}). Co\xFBt signature \xA3${def.cost.toLocaleString()}.`
    }
  });
  if (def.role === "medical" || def.role === "assistant") {
    await prisma.team.update({
      where: { id: teamId },
      data: { jobSecurity: Math.min(99, team.jobSecurity + 2) }
    });
  }
  res.status(201).json({ member, budget: team.budget - def.cost });
});
router14.post("/fire/:staffId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const staffId = Number(req.params.staffId);
  const team = await owned2(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const member = await prisma.staffMember.findFirst({ where: { id: staffId, teamId } });
  if (!member) return res.status(404).json({ error: "Staff introuvable" });
  const severance = Math.round(member.salary * 4);
  if (team.budget < severance) return res.status(400).json({ error: `Indemnit\xE9 \xA3${severance} requise` });
  await prisma.staffMember.delete({ where: { id: staffId } });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - severance, jobSecurity: Math.max(5, team.jobSecurity - 1) }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "staff_fire",
      amount: -severance,
      reason: `Licenciement ${member.name}`
    }
  });
  res.json({ ok: true, severance, budget: team.budget - severance });
});
var staff_default = router14;

// src/routes/competitions.ts
init_prisma();
import { Router as Router15 } from "express";
var router15 = Router15({ mergeParams: true });
router15.use(requireAuth);
router15.get("/table", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({ where: { id: teamId, userId: req.user.userId } });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureLeagueForTeam(teamId, team.name);
  const table = await getTable(1);
  const me = table.find((r) => r.playerTeamId === teamId);
  res.json({
    competition: "Super Ligue",
    season: 1,
    table,
    myRank: me?.rank ?? null,
    myRow: me ?? null
  });
});
router15.get("/overview", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({ where: { id: teamId, userId: req.user.userId } });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureLeagueForTeam(teamId, team.name);
  const table = await getTable(1);
  res.json({
    competitions: [
      {
        id: "super_ligue_1",
        name: "Super Ligue",
        type: "league",
        season: 1,
        teams: table.length,
        leader: table[0]?.teamName ?? "\u2014",
        myRank: table.find((r) => r.playerTeamId === teamId)?.rank ?? null
      }
    ]
  });
});
var competitions_default = router15;

// src/routes/transfers.ts
init_prisma();
import { Router as Router16 } from "express";
import { z as z8 } from "zod";
var router16 = Router16({ mergeParams: true });
router16.use(requireAuth);
async function owned3(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId }, include: { players: true } });
}
function pushHistory(json, entry) {
  try {
    const arr = JSON.parse(json || "[]");
    arr.push({ ...entry, at: (/* @__PURE__ */ new Date()).toISOString() });
    return JSON.stringify(arr);
  } catch {
    return JSON.stringify([{ ...entry, at: (/* @__PURE__ */ new Date()).toISOString() }]);
  }
}
router16.get("/negotiations", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned3(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const rows = await prisma.transferNegotiation.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    take: 30
  });
  res.json({ negotiations: rows });
});
router16.post("/negotiations", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const schema = z8.object({
    name: z8.string(),
    position: z8.string(),
    nation: z8.string().optional(),
    salary: z8.number(),
    speed: z8.number(),
    dribble: z8.number(),
    shot: z8.number(),
    pass: z8.number(),
    defense: z8.number(),
    physique: z8.number(),
    potential: z8.number().optional(),
    rating: z8.number().optional(),
    price: z8.number().positive(),
    offerAmount: z8.number().positive(),
    wageOffer: z8.number().positive().optional(),
    contractYears: z8.number().int().min(1).max(5).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Offre invalide" });
  const team = await owned3(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.players.length >= 16) return res.status(400).json({ error: "Effectif plein" });
  if (team.budget < parsed.data.offerAmount) {
    return res.status(400).json({ error: "Budget insuffisant pour cette offre" });
  }
  const rating = parsed.data.rating ?? Math.round(
    (parsed.data.speed + parsed.data.dribble + parsed.data.shot + parsed.data.pass + parsed.data.defense + parsed.data.physique) / 6
  );
  const ask = parsed.data.price;
  const offer = parsed.data.offerAmount;
  const ratio = offer / ask;
  let status = "offered";
  let counterAmount = null;
  let step = 1;
  let note = "";
  if (ratio >= 0.95) {
    status = "agreed";
    step = 3;
    note = "Offre accept\xE9e imm\xE9diatement.";
  } else if (ratio >= 0.75) {
    status = "countered";
    counterAmount = Math.round(ask * (0.88 + Math.random() * 0.1));
    step = 2;
    note = `Contre-offre \xE0 \xA3${counterAmount.toLocaleString()}.`;
  } else {
    status = "rejected";
    step = 2;
    note = "Offre jug\xE9e trop basse \u2014 n\xE9gociations rompues.";
  }
  const row = await prisma.transferNegotiation.create({
    data: {
      teamId,
      playerName: parsed.data.name,
      position: parsed.data.position,
      rating,
      listingJson: JSON.stringify(parsed.data),
      status,
      offerAmount: offer,
      counterAmount,
      wageOffer: parsed.data.wageOffer ?? parsed.data.salary,
      contractYears: parsed.data.contractYears ?? 2,
      step,
      historyJson: pushHistory("[]", { type: "offer", amount: offer, note })
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: `N\xE9gociation : ${parsed.data.name}`,
      content: note
    }
  });
  res.status(201).json({ negotiation: row, note });
});
router16.post("/negotiations/:id/respond", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const id = req.params.id;
  const parsed = z8.object({
    action: z8.enum(["accept_counter", "raise", "walk_away"]),
    raiseAmount: z8.number().positive().optional()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Action invalide" });
  const team = await owned3(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const nego = await prisma.transferNegotiation.findFirst({ where: { id, teamId } });
  if (!nego) return res.status(404).json({ error: "N\xE9gociation introuvable" });
  if (!["offered", "countered"].includes(nego.status)) {
    return res.status(400).json({ error: "N\xE9gociation d\xE9j\xE0 close" });
  }
  let status = nego.status;
  let offerAmount = nego.offerAmount;
  let counterAmount = nego.counterAmount;
  let step = nego.step + 1;
  let historyJson = nego.historyJson;
  let note = "";
  if (parsed.data.action === "walk_away") {
    status = "cancelled";
    note = "Tu as quitt\xE9 la table des n\xE9gociations.";
    historyJson = pushHistory(historyJson, { type: "walk_away", note });
  } else if (parsed.data.action === "accept_counter") {
    if (!counterAmount) return res.status(400).json({ error: "Pas de contre-offre" });
    status = "agreed";
    offerAmount = counterAmount;
    note = `Accord \xE0 \xA3${counterAmount.toLocaleString()}.`;
    historyJson = pushHistory(historyJson, { type: "accept_counter", amount: counterAmount, note });
  } else {
    const raise = parsed.data.raiseAmount;
    if (!raise) return res.status(400).json({ error: "raiseAmount requis" });
    if (team.budget < raise) return res.status(400).json({ error: "Budget insuffisant" });
    offerAmount = raise;
    const listing = JSON.parse(nego.listingJson);
    const ratio = raise / listing.price;
    if (ratio >= 0.9) {
      status = "agreed";
      note = "Nouvelle offre accept\xE9e.";
      historyJson = pushHistory(historyJson, { type: "raise_accepted", amount: raise, note });
    } else if (ratio >= 0.7) {
      status = "countered";
      counterAmount = Math.round(listing.price * 0.92);
      note = `Derni\xE8re contre-offre \xA3${counterAmount.toLocaleString()}.`;
      historyJson = pushHistory(historyJson, { type: "raise_counter", amount: raise, counter: counterAmount, note });
    } else {
      status = "rejected";
      note = "Club adverse refuse de n\xE9gocier plus bas.";
      historyJson = pushHistory(historyJson, { type: "raise_rejected", amount: raise, note });
    }
  }
  const updated = await prisma.transferNegotiation.update({
    where: { id },
    data: { status, offerAmount, counterAmount, step, historyJson }
  });
  res.json({ negotiation: updated, note });
});
router16.post("/negotiations/:id/complete", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const id = req.params.id;
  const team = await owned3(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const nego = await prisma.transferNegotiation.findFirst({ where: { id, teamId } });
  if (!nego) return res.status(404).json({ error: "N\xE9gociation introuvable" });
  if (nego.status !== "agreed") return res.status(400).json({ error: "Pas d\u2019accord sign\xE9" });
  if (team.players.length >= 16) return res.status(400).json({ error: "Effectif plein" });
  if (team.budget < nego.offerAmount) return res.status(400).json({ error: "Budget insuffisant" });
  const listing = JSON.parse(nego.listingJson);
  const player = await prisma.player.create({
    data: {
      teamId,
      name: listing.name,
      position: listing.position,
      nation: listing.nation ?? "International",
      salary: nego.wageOffer ?? listing.salary,
      speed: listing.speed,
      dribble: listing.dribble,
      shot: listing.shot,
      pass: listing.pass,
      defense: listing.defense,
      physique: listing.physique,
      potential: listing.potential ?? 75,
      contractUntil: new Date(Date.now() + (nego.contractYears || 2) * 365 * 24 * 3600 * 1e3)
    }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - nego.offerAmount }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "transfer_in",
      amount: -nego.offerAmount,
      reason: `Transfert ${listing.name}`
    }
  });
  await prisma.transferNegotiation.update({
    where: { id },
    data: {
      status: "completed",
      step: nego.step + 1,
      historyJson: pushHistory(nego.historyJson, { type: "completed", amount: nego.offerAmount })
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "MERCATO",
      title: "Transfert conclu",
      content: `${listing.name} signe pour \xA3${nego.offerAmount.toLocaleString()} \xB7 ${nego.contractYears} ans.`
    }
  });
  res.json({ ok: true, player, budget: team.budget - nego.offerAmount });
});
var transfers_default = router16;

// src/routes/chronicle.ts
import { Router as Router17 } from "express";
init_chronicle();
var router17 = Router17({ mergeParams: true });
router17.use(requireAuth);
function teamIdParam(req) {
  return Number(req.params.teamId);
}
router17.get("/", async (req, res) => {
  const teamId = teamIdParam(req);
  const season = req.query.season ? Number(req.query.season) : void 0;
  const limit = req.query.limit ? Number(req.query.limit) : 40;
  const entries = await listChronicle(teamId, { season, limit });
  res.json({ entries });
});
router17.get("/season-review", async (req, res) => {
  const teamId = teamIdParam(req);
  const season = req.query.season ? Number(req.query.season) : 1;
  const review = await seasonReview(teamId, season);
  if (!review) return res.status(404).json({ error: "\xC9quipe introuvable" });
  res.json(review);
});
var chronicle_default = router17;

// src/middleware/ownership.ts
init_prisma();
async function requireTeamOwner(req, res, next) {
  const teamId = Number(req.params.teamId);
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return res.status(400).json({ error: "\xC9quipe invalide" });
  }
  if (!req.user?.userId) {
    return res.status(401).json({ error: "Non authentifi\xE9" });
  }
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    select: { id: true }
  });
  if (!team) {
    return res.status(404).json({ error: "\xC9quipe introuvable" });
  }
  req.teamId = teamId;
  next();
}

// src/middleware/security.ts
var isProd = () => process.env.NODE_ENV === "production";
var hits = /* @__PURE__ */ new Map();
function rateLimit(max = 60, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${ip}:${req.path.split("/").slice(0, 4).join("/")}`;
    const row = hits.get(key) || hits.get(ip);
    const bucket = hits.get(key);
    if (!bucket || now > bucket.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.reset - now) / 1e3)));
      return res.status(429).json({ error: "Trop de requ\xEAtes, r\xE9essaie plus tard" });
    }
    void row;
    next();
  };
}
function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (isProd()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
  }
  next();
}
function requireJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32 || s.includes("change-me") || s.includes("dev-secret")) {
    if (isProd()) {
      console.error("FATAL: JWT_SECRET manquant ou trop faible (min 32 chars) en production");
      process.exit(1);
    }
    console.warn("WARNING: JWT_SECRET faible \u2014 OK en dev uniquement");
  }
}
function productionErrorHandler(err, _req, res, _next) {
  if (!isProd()) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
  console.error("[error]", err instanceof Error ? err.message : "unknown");
  return res.status(500).json({ error: "Erreur serveur" });
}
function logInfo(...args) {
  if (!isProd() || process.env.LOG_VERBOSE === "1") {
    console.log(...args);
  }
}
function rejectUploads(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return res.status(415).json({ error: "Upload non autoris\xE9" });
  }
  next();
}

// src/index.ts
requireJwtSecret();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var app = express();
var PORT = process.env.PORT || 3001;
var isProd2 = process.env.NODE_ENV === "production";
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(rejectUploads);
var corsOrigin = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigin && corsOrigin.length ? corsOrigin : isProd2 ? false : true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600
  })
);
app.use(
  express.json({
    limit: "100kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(rateLimit(120, 6e4));
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "alym",
    version: "1.0.1-secure",
    studio: "LA MYLA",
    feature: "chronicle"
  });
});
app.use("/api/auth", rateLimit(10, 6e4), auth_default);
app.use("/api/teams", teams_default);
var teamScoped = [
  ["/api/teams/:teamId/messages", messages_default],
  ["/api/teams/:teamId/players", players_default],
  ["/api/teams/:teamId/matches", matches_default],
  ["/api/teams/:teamId/shop", shop_default],
  ["/api/teams/:teamId/achievements", achievements_default],
  ["/api/teams/:teamId/budget", budget_default],
  ["/api/teams/:teamId/career", career_default],
  ["/api/teams/:teamId/live", live_default],
  ["/api/teams/:teamId/legends", legends_default],
  ["/api/teams/:teamId/manager-market", managerMarket_default],
  ["/api/teams/:teamId/events", events_default],
  ["/api/teams/:teamId/staff", staff_default],
  ["/api/teams/:teamId/competitions", competitions_default],
  ["/api/teams/:teamId/transfers", transfers_default],
  ["/api/teams/:teamId/chronicle", chronicle_default]
];
for (const [pathPrefix, routes] of teamScoped) {
  app.use(pathPrefix, requireAuth, requireTeamOwner, routes);
}
app.get("/api", (_req, res) => {
  res.json({ name: "ALYM API", version: "1.0.1-secure", studio: "LA MYLA" });
});
var webDist = path.resolve(__dirname, "../../web/dist");
app.use(express.static(webDist, { maxAge: isProd2 ? "1h" : 0 }));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  res.sendFile(path.join(webDist, "index.html"), (err) => {
    if (err) res.status(404).json({ error: "Frontend not built" });
  });
});
app.use(productionErrorHandler);
app.listen(PORT, () => {
  logInfo(`ALYM running on port ${PORT}`);
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl.replace(/\/$/, "")}/health`).catch(() => void 0);
    }, 8 * 60 * 1e3);
  }
});
