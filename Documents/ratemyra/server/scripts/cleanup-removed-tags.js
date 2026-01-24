/**
 * Cleanup script to remove invalid tags from existing reviews
 * Removes: TOUGH_GRADER, PARTICIPATION_MATTERS, GROUP_WORK, INDEPENDENT_WORK
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REMOVED_TAGS = [
  'TOUGH_GRADER',
  'PARTICIPATION_MATTERS',
  'GROUP_WORK',
  'INDEPENDENT_WORK',
];

async function cleanupTags() {
  try {
    console.log('🧹 Starting tag cleanup...');
    console.log('Removing tags:', REMOVED_TAGS.join(', '));

    // Get all reviews that have any of the removed tags
    const reviewsToUpdate = await prisma.review.findMany({
      where: {
        tags: {
          hasSome: REMOVED_TAGS,
        },
      },
      select: {
        id: true,
        tags: true,
        raId: true,
      },
    });

    console.log(`Found ${reviewsToUpdate.length} reviews with removed tags`);

    let updatedCount = 0;
    let totalTagsRemoved = 0;

    // Update each review to remove the invalid tags
    for (const review of reviewsToUpdate) {
      const originalTags = [...review.tags];
      const cleanedTags = review.tags.filter(tag => !REMOVED_TAGS.includes(tag));
      
      if (cleanedTags.length !== originalTags.length) {
        const removedCount = originalTags.length - cleanedTags.length;
        totalTagsRemoved += removedCount;

        await prisma.review.update({
          where: { id: review.id },
          data: { tags: cleanedTags },
        });

        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`  Updated ${updatedCount} reviews...`);
        }
      }
    }

    console.log(`✅ Updated ${updatedCount} reviews`);
    console.log(`✅ Removed ${totalTagsRemoved} invalid tag instances`);

    // Delete tag statistics for removed tags
    console.log('\n🧹 Cleaning up tag statistics...');
    
    let deletedStatsCount = 0;
    for (const tag of REMOVED_TAGS) {
      const result = await prisma.rATagStat.deleteMany({
        where: { tag },
      });
      deletedStatsCount += result.count;
      if (result.count > 0) {
        console.log(`  Deleted ${result.count} tag stats for ${tag}`);
      }
    }

    console.log(`✅ Deleted ${deletedStatsCount} tag statistics entries`);

    console.log('\n✨ Cleanup completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Reviews updated: ${updatedCount}`);
    console.log(`  - Tags removed: ${totalTagsRemoved}`);
    console.log(`  - Tag stats deleted: ${deletedStatsCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupTags()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
