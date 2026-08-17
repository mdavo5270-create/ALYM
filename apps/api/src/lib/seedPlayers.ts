import { prisma } from './prisma.js';

const FIRST = ['Lucas', 'Hugo', 'Nathan', 'Enzo', 'Louis', 'Raphaël', 'Arthur', 'Jules', 'Adam', 'Leo', 'Paul', 'Tom', 'Noah', 'Maxime', 'Alex'];
const LAST = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David'];
const POSITIONS = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'DF', 'MF'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedStarterPlayers(teamId: number, nation = 'France') {
  const used = new Set<string>();
  const data = POSITIONS.map((position) => {
    let name = '';
    do {
      name = `${pick(FIRST)} ${pick(LAST)}`;
    } while (used.has(name));
    used.add(name);

    const base = position === 'GK' ? 55 : 60;
    return {
      teamId,
      name,
      position,
      nation,
      salary: rand(800, 4200), // vs budget £200k
      speed: rand(base, base + 25),
      dribble: rand(base - 5, base + 25),
      shot: rand(base - 10, base + 20),
      pass: rand(base, base + 25),
      defense: position === 'DF' || position === 'GK' ? rand(base + 5, base + 30) : rand(base - 15, base + 10),
      physique: rand(base, base + 25),
    };
  });

  await prisma.player.createMany({ data });
  return data.length;
}
