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
  // 90s Action Heroes
  'Terminator', 'Robocop', 'Rambo', 'JohnMcClane', 'IndianaJones', 'Ripley', 'SarahConnor', 'Dutch', 'Maverick', 'Rocky',
  'Blade', 'Maximus', 'Wolverine', 'Deadpool', 'Neo', 'Trinity', 'Morpheus', 'Spartan117', 'SnakePlissken', 'JackBurton',
  'AshWilliams', 'FrankCastle', 'JudgeDredd', 'EllenRipley', 'MadMax', 'V', 'Leon', 'TheBride', 'BeatrixKiddo', 'JohnWick',
  
  // 90s Cartoons
  'BugsBunny', 'DaffyDuck', 'TweetyBird', 'Sylvester', 'ElmerFudd', 'YosemiteSam', 'RoadRunner', 'WileECoyote', 'PorkyPig', 'FoghornLeghorn',
  'TomCat', 'JerryMouse', 'SpikeDog', 'TykePuppy', 'DroopyDog', 'ScoobyDoo', 'Shaggy', 'FredJones', 'Daphne', 'Velma',
  'Batman', 'Superman', 'SpiderMan', 'XMen', 'TeenageMutantNinjaTurtles', 'PowerRangers', 'Gargoyles', 'DarkwingDuck', 'ChipNDale', 'DuckTales',
  'TinyToons', 'Animaniacs', 'PinkyBrain', 'Freakazoid', 'BatmanTAS', 'SupermanTAS', 'SpiderManTAS', 'XMenTAS', 'IronMan', 'CaptainAmerica'
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Entertainment', 'Other'
];

const image = '/user.svg'; // Local user icon

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Starting seed...');
  
  // Delete all users and profiles first
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  
  for (let i = 0; i < 100; i++) {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const screenName = getRandom(screenNames);
    const industry = getRandom(industries);
    let role: 'admin' | 'customer' | 'user' = 'user';
    if (i === 0) role = 'admin';
    else if (i < 11) role = 'customer';
    // Create user with standard NextAuth fields
    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `user${i + 1}@example.com`,
        image,
        emailVerified: new Date(),
        profile: {
          create: {
            firstName,
            lastName,
            screenName,
            industry,
            role,
          }
        }
      },
    });
    
    console.log(`Created user ${i + 1}: ${firstName} ${lastName} (${screenName}) - ${industry}`);
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 