import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const firstNames = [
  'Jason', 'Jennifer', 'Michael', 'Heather', 'Christopher', 'Amy', 'Matthew', 'Melissa', 'Joshua', 'Stephanie',
  'David', 'Nicole', 'James', 'Angela', 'John', 'Michelle', 'Robert', 'Kimberly', 'Brian', 'Lisa',
  'William', 'Rebecca', 'Eric', 'Elizabeth', 'Scott', 'Tiffany', 'Kevin', 'Shannon', 'Jeffrey', 'Christina',
  'Richard', 'Kelly', 'Steven', 'Tracy', 'Thomas', 'Julie', 'Timothy', 'Wendy', 'Charles', 'Rachel',
  'Daniel', 'Laura', 'Paul', 'Sara', 'Mark', 'Erin', 'Anthony', 'Stacy', 'Gregory', 'April'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
  'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall',
  'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards'
];

const screenNames = [
  'HanSolo', 'LukeSkywalker', 'LeiaOrgana', 'Chewbacca', 'DarthVader', 'ObiWan', 'Yoda', 'BobaFett', 'Lando', 'Rey',
  'Finn', 'PoeDameron', 'KyloRen', 'MaceWindu', 'Padme', 'Anakin', 'JynErso', 'Cassian', 'Chirrut', 'K2SO',
  'IndianaJones', 'Rambo', 'Terminator', 'Robocop', 'JohnMcClane', 'Ripley', 'SarahConnor', 'Dutch', 'Maverick', 'Rocky',
  'Blade', 'Maximus', 'Wolverine', 'Deadpool', 'Neo', 'Trinity', 'Morpheus', 'Spartan117', 'SnakePlissken', 'JackBurton',
  'AshWilliams', 'FrankCastle', 'JudgeDredd', 'EllenRipley', 'MadMax', 'V', 'Leon', 'TheBride', 'BeatrixKiddo', 'JohnWick'
];

const image = '/user.svg'; // Local user icon

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.user.create({
      data: {
        firstName: getRandom(firstNames),
        lastName: getRandom(lastNames),
        screenName: getRandom(screenNames),
        image,
        email: `user${i + 1}@example.com`, // Add email for NextAuth compatibility
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 