/**
 * REMOVE FAKE DATA SCRIPT
 * 
 * This script removes all fake RAs and reviews that were created by the fake data seeder.
 * 
 * FAKE DATA MARKERS (INVISIBLE):
 * - RAs: Dorm names start with zero-width non-joiner (U+200C)
 * - Reviews: TextBody starts with zero-width space (U+200B)
 * 
 * WARNING: This will permanently delete all fake data!
 * 
 * Usage:
 *   cd server
 *   npm run db:remove:fake
 * 
 * Or on Railway:
 *   railway run "cd server && npm run db:remove:fake"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Invisible markers
const FAKE_DORM_MARKER = '\u200C'; // Zero-width non-joiner
const FAKE_REVIEW_MARKER = '\u200B'; // Zero-width space

async function removeFakeData() {
  console.log('🗑️  Starting to remove fake data...\n');
  console.log('⚠️  WARNING: This will permanently delete all fake RAs and reviews!\n');

  try {
    // Step 1: Find all fake RAs (dorm starts with zero-width non-joiner)
    console.log('🔍 Finding fake RAs...');
    const fakeRAs = await prisma.rA.findMany({
      where: {
        dorm: {
          startsWith: FAKE_DORM_MARKER,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dorm: true,
        school: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`   Found ${fakeRAs.length} fake RAs\n`);

    if (fakeRAs.length === 0) {
      console.log('✅ No fake RAs found. Nothing to remove.');
      return { rasRemoved: 0, reviewsRemoved: 0 };
    }

    // Show preview
    console.log('📋 Fake RAs to be removed:');
    fakeRAs.slice(0, 10).forEach((ra, idx) => {
      const dormDisplay = ra.dorm.replace(FAKE_DORM_MARKER, '');
      console.log(`   ${idx + 1}. ${ra.firstName} ${ra.lastName} - ${dormDisplay} (${ra.school.name})`);
    });
    if (fakeRAs.length > 10) {
      console.log(`   ... and ${fakeRAs.length - 10} more\n`);
    } else {
      console.log('');
    }

    // Step 2: Find all fake reviews (textBody starts with zero-width space)
    console.log('🔍 Finding fake reviews...');
    const fakeReviewIds = await prisma.review.findMany({
      where: {
        textBody: {
          startsWith: FAKE_REVIEW_MARKER,
        },
      },
      select: {
        id: true,
      },
    });

    console.log(`   Found ${fakeReviewIds.length} fake reviews\n`);

    // Step 3: Delete fake reviews first (to avoid foreign key issues)
    console.log('🗑️  Deleting fake reviews...');
    const reviewsDeleted = await prisma.review.deleteMany({
      where: {
        textBody: {
          startsWith: FAKE_REVIEW_MARKER,
        },
      },
    });

    console.log(`   ✅ Deleted ${reviewsDeleted.count} fake reviews\n`);

    // Step 4: Delete fake RAs (this will cascade delete any remaining reviews)
    console.log('🗑️  Deleting fake RAs...');
    const fakeRAIds = fakeRAs.map(ra => ra.id);
    const rasDeleted = await prisma.rA.deleteMany({
      where: {
        id: {
          in: fakeRAIds,
        },
      },
    });

    console.log(`   ✅ Deleted ${rasDeleted.count} fake RAs\n`);

    // Step 5: Clean up any orphaned tag stats
    console.log('🧹 Cleaning up orphaned tag stats...');
    // Tag stats will be automatically cleaned up when RAs are deleted (CASCADE)
    // But let's check if there are any orphaned ones
    const allTagStats = await prisma.rATagStat.findMany({
      select: {
        id: true,
        raId: true,
      },
    });

    const existingRAIds = new Set(
      (await prisma.rA.findMany({ select: { id: true } })).map(ra => ra.id)
    );

    const orphanedTagStats = allTagStats.filter(stat => !existingRAIds.has(stat.raId));
    
    if (orphanedTagStats.length > 0) {
      const deletedTagStats = await prisma.rATagStat.deleteMany({
        where: {
          id: {
            in: orphanedTagStats.map(stat => stat.id),
          },
        },
      });
      console.log(`   ✅ Deleted ${deletedTagStats.count} orphaned tag stats\n`);
    } else {
      console.log('   ✅ No orphaned tag stats found\n');
    }

    console.log('✨ Fake data removal complete!');
    console.log(`   RAs removed: ${rasDeleted.count}`);
    console.log(`   Reviews removed: ${reviewsDeleted.count}`);
    console.log(`   Tag stats cleaned: ${orphanedTagStats.length}\n`);

    return {
      rasRemoved: rasDeleted.count,
      reviewsRemoved: reviewsDeleted.count,
      tagStatsRemoved: orphanedTagStats.length,
    };
  } catch (error) {
    console.error('❌ Error removing fake data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('remove-fake-data')) {
  removeFakeData()
    .then((result) => {
      console.log('\n✅ Done!');
      console.log(`   Summary: ${result.rasRemoved} RAs and ${result.reviewsRemoved} reviews removed`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { removeFakeData };
