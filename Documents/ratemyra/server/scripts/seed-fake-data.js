/**
 * FAKE DATA SEEDER
 * 
 * This script creates fake RAs and reviews for testing/demo purposes.
 * 
 * HIDDEN MARKER FOR REMOVAL:
 * - All fake RAs have dorm names prefixed with "[FAKE]" (invisible to users, searchable by admin)
 * - All fake reviews have a zero-width space character (U+200B) at the start of textBody
 * - Fake RA IDs are logged to console and listed in comments below
 * 
 * TO REMOVE FAKE DATA:
 * 1. Search for RAs with dorm containing "[FAKE]"
 * 2. Search for reviews with textBody starting with zero-width space
 * 3. Delete all matching records
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Zero-width space marker for fake reviews
const FAKE_MARKER = '\u200B'; // Zero-width space (invisible)

// Real residence halls by school
const SCHOOL_DORMS = {
  'Georgia Institute of Technology': [
    'Armstrong Hall', 'Brown Hall', 'Caldwell Hall', 'Center Street North',
    'Center Street South', 'Folk Hall', 'Fitten Hall', 'Field Hall',
    'Fulmer Hall', 'Glenn Hall', 'Hanson Hall', 'Harris Hall',
    'Harrison Hall', 'Heisman Hall', 'Hopkins Hall', 'Howell Hall',
    'Matheson Hall', 'Montag Hall', 'North Avenue Apartments', 'Perry Hall',
    'Smith Hall', 'Stein Hall', 'Towers Hall', 'Woodruff Hall',
  ],
  'Harvard University': [
    'Adams House', 'Cabot House', 'Currier House', 'Dunster House',
    'Eliot House', 'Kirkland House', 'Leverett House', 'Lowell House',
    'Mather House', 'Pforzheimer House', 'Quincy House', 'Winthrop House',
  ],
  'Massachusetts Institute of Technology': [
    'Baker House', 'Burton-Conner House', 'East Campus', 'MacGregor House',
    'Maseeh Hall', 'McCormick Hall', 'New House', 'New Vassar',
    'Next House', 'Random Hall', 'Simmons Hall',
  ],
  'Stanford University': [
    'Branner Hall', 'Crothers Hall', 'Florence Moore Hall', 'Gerhard Casper Quad',
    'Governor\'s Corner', 'Lagunita Court', 'Roble Hall', 'Stern Hall',
    'Toyon Hall', 'Wilbur Hall',
  ],
  'University of California, Berkeley': [
    'Bowles Hall', 'Clark Kerr Campus', 'Foothill', 'Martinez Commons',
    'Stern Hall', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4',
  ],
  'University of California, Los Angeles': [
    'De Neve', 'Dykstra Hall', 'Hedrick Hall', 'Rieber Hall',
    'Rieber Terrace', 'Saxon Suites', 'Sproul Hall', 'Sunset Village',
  ],
  'University of Michigan': [
    'Alice Lloyd Hall', 'Bursley Hall', 'Couzens Hall', 'East Quad',
    'Markley Hall', 'Martha Cook Building', 'Mosher-Jordan Hall', 'North Quad',
    'Oxford Houses', 'South Quad', 'Stockwell Hall', 'West Quad',
  ],
  'University of Texas at Austin': [
    'Brackenridge Hall', 'Carothers Hall', 'Creekside', 'Duren Hall',
    'Jester Center', 'Kinsolving Hall', 'Littlefield Hall', 'Moore-Hill',
    'Roberts Hall', 'San Jacinto Hall', 'Whitis Court',
  ],
  'University of Pennsylvania': [
    'Fisher Hassenfeld College House', 'Gregory College House', 'Harrison College House',
    'Hill College House', 'Kings Court English', 'Lauder College House',
    'Riepe College House', 'Rodin College House', 'Stouffer College House',
    'Ware College House', 'Wynn College House',
  ],
  'Yale University': [
    'Berkeley College', 'Branford College', 'Davenport College', 'Ezra Stiles College',
    'Grace Hopper College', 'Jonathan Edwards College', 'Morse College',
    'Pauli Murray College', 'Pierson College', 'Saybrook College',
    'Silliman College', 'Timothy Dwight College', 'Trumbull College',
  ],
};

// Fake first names
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Sam', 'Jamie', 'Cameron', 'Drew', 'Blake', 'Reese', 'Parker', 'Sage',
  'Chris', 'Pat', 'Dakota', 'River', 'Skylar', 'Phoenix', 'Rowan', 'Finley'
];

// Fake last names
const LAST_NAMES = [
  'Anderson', 'Martinez', 'Thompson', 'Garcia', 'Wilson', 'Moore', 'Taylor',
  'Jackson', 'White', 'Harris', 'Martin', 'Lee', 'Walker', 'Hall', 'Young',
  'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker',
  'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips'
];

// Review tags
const REVIEW_TAGS = [
  'CLEAR_COMMUNICATION', 'HELPFUL', 'RESPONSIVE', 'FRIENDLY', 'ORGANIZED',
  'FAIR', 'SUPPORTIVE', 'STRICT', 'UNORGANIZED', 'UNRESPONSIVE', 'HARSH'
];

// Review text templates
const REVIEW_TEXTS = [
  'Great RA! Always available when needed and very understanding.',
  'Very helpful and approachable. Made the transition to college much easier.',
  'Organized and clear with communication. Always kept us informed about events.',
  'Fair and supportive. Really cares about the residents.',
  'Could be more responsive sometimes, but overall pretty good.',
  'Very strict with rules, but that kept the floor quiet and clean.',
  'Friendly and welcoming. Created a great community atmosphere.',
  'Sometimes seemed unorganized, but always tried their best.',
  'Not the most responsive, but when they did respond, they were helpful.',
  'Very supportive during difficult times. Really appreciated their help.',
  'Clear communication and well-organized events. Great experience!',
  'Fair grading and expectations. Would recommend.',
  'Could improve on responsiveness, but overall decent RA.',
  'Very friendly and approachable. Made dorm life enjoyable.',
  'Strict but fair. Maintained a good living environment.',
];

// Generate fake IP hash
function generateFakeIPHash() {
  const fakeIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  return crypto.createHash('sha256').update(fakeIP).digest('hex');
}

// Generate fake device fingerprint hash
function generateFakeDeviceHash() {
  const fakeFingerprint = `fake-device-${Math.random().toString(36).substring(7)}`;
  return crypto.createHash('sha256').update(fakeFingerprint).digest('hex');
}

// Generate random semester
function getRandomSemester() {
  const seasons = ['Fall', 'Spring', 'Summer'];
  const year = 2022 + Math.floor(Math.random() * 4); // 2022-2025
  return `${seasons[Math.floor(Math.random() * seasons.length)]} ${year}`;
}

// Generate random tags (1-4 tags)
function getRandomTags() {
  const numTags = Math.floor(Math.random() * 4) + 1;
  const shuffled = [...REVIEW_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

export async function seedFakeData() {
  console.log('🎭 Starting to seed fake data...\n');

  try {
    const fakeRAIds = [];
    let rasCreated = 0;
    let reviewsCreated = 0;

    // Schools to seed fake data for
    const schoolsToSeed = Object.keys(SCHOOL_DORMS);

    for (const schoolName of schoolsToSeed) {
      // Find school
      const school = await prisma.school.findFirst({
        where: {
          name: {
            contains: schoolName,
            mode: 'insensitive',
          },
        },
      });

      if (!school) {
        console.log(`⏭️  Skipped: ${schoolName} (not found in database)`);
        continue;
      }

      console.log(`\n✅ Found: ${school.name}`);
      const dorms = SCHOOL_DORMS[schoolName];
      
      // Create 12-18 fake RAs per school
      const numRAs = Math.floor(Math.random() * 7) + 12;
      
      for (let i = 0; i < numRAs; i++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const dorm = dorms[Math.floor(Math.random() * dorms.length)];
        const floor = `${Math.floor(Math.random() * 5) + 1}${['st', 'nd', 'rd', 'th'][Math.min(Math.floor(Math.random() * 4), 3)]} Floor`;
        
        // Add hidden marker: [FAKE] prefix (will be searchable but looks normal in UI)
        const dormWithMarker = `[FAKE]${dorm}`;

        try {
          const ra = await prisma.rA.create({
            data: {
              firstName,
              lastName,
              schoolId: school.id,
              dorm: dormWithMarker,
              floor,
            },
          });

          fakeRAIds.push({ id: ra.id, school: school.name, name: `${firstName} ${lastName}` });
          rasCreated++;
          console.log(`  ✅ Created RA: ${firstName} ${lastName} (${dorm})`);

          // Create 2-4 reviews per RA
          const numReviews = Math.floor(Math.random() * 3) + 2;
          
          for (let j = 0; j < numReviews; j++) {
            const ratingClarity = Math.floor(Math.random() * 2) + 3; // 3-5
            const ratingHelpfulness = Math.floor(Math.random() * 2) + 3; // 3-5
            const difficulty = Math.floor(Math.random() * 3) + 2; // 2-4
            const wouldTakeAgain = Math.random() > 0.3; // 70% yes
            const tags = getRandomTags();
            const semesters = [getRandomSemester()];
            
            // Add second semester 30% of the time
            if (Math.random() > 0.7) {
              semesters.push(getRandomSemester());
            }

            const reviewText = REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)];
            // Add zero-width space marker at start (invisible)
            const textBody = FAKE_MARKER + reviewText;

            const ratingOverall = (ratingClarity + ratingHelpfulness) / 2;

            await prisma.review.create({
              data: {
                raId: ra.id,
                semesters,
                ratingClarity,
                ratingHelpfulness,
                ratingOverall,
                difficulty,
                wouldTakeAgain,
                tags,
                attendanceRequired: Math.random() > 0.7,
                textBody,
                ipHash: generateFakeIPHash(),
                deviceFingerprintHash: generateFakeDeviceHash(),
                status: 'ACTIVE',
              },
            });

            reviewsCreated++;
          }
        } catch (error) {
          console.error(`  ❌ Error creating RA ${firstName} ${lastName}:`, error.message);
        }
      }
    }

    console.log(`\n✨ Fake data seeding complete!`);
    console.log(`   RAs created: ${rasCreated}`);
    console.log(`   Reviews created: ${reviewsCreated}`);
    console.log(`\n📋 Fake RA IDs (for removal):`);
    console.log(JSON.stringify(fakeRAIds, null, 2));
    console.log(`\n🔍 To remove fake data:`);
    console.log(`   1. Search for RAs with dorm containing "[FAKE]"`);
    console.log(`   2. Search for reviews with textBody starting with zero-width space`);
    console.log(`   3. Delete all matching records\n`);

    return { created: rasCreated, reviews: reviewsCreated, raIds: fakeRAIds };
  } catch (error) {
    console.error('❌ Error seeding fake data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('seed-fake-data')) {
  seedFakeData()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
