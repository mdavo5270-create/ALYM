const CHALLENGES = [
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
export {
  CHALLENGES,
  getChallenge
};
