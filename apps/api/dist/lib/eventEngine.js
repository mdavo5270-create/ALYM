import { prisma } from "./prisma.js";
function pick(arr, rng) {
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
  return pick(pool, rng);
}
function youthPlayer(team, rng) {
  const y = team.players.filter((p) => p.isYouth);
  if (y.length) return pick(y, rng);
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
    rolled.push(pick(pool, rng));
  }
  if (rng() < 0.18 && pool.length > 1) {
    const second = pick(
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
    const { writeChronicle } = await import("./chronicle.js");
    const tone = row.priority === "urgent" ? "tension" : choice.effects.some((e) => e.includes("boost") || e.includes("praise") || e.includes("sponsor")) ? "hope" : "turning";
    await writeChronicle(teamId, {
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
export {
  buildCandidateEvents,
  getPendingEvent,
  listEvents,
  resolveCareerEvent,
  tickCareerEvents,
  toLegacyUnexpectedShape
};
