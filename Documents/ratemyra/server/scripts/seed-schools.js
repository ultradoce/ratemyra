import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Major US colleges and universities
const schools = [
  // Ivy League
  { name: 'Harvard University', location: 'Cambridge, MA', domain: 'harvard.edu' },
  { name: 'Yale University', location: 'New Haven, CT', domain: 'yale.edu' },
  { name: 'Princeton University', location: 'Princeton, NJ', domain: 'princeton.edu' },
  { name: 'Columbia University', location: 'New York, NY', domain: 'columbia.edu' },
  { name: 'University of Pennsylvania', location: 'Philadelphia, PA', domain: 'upenn.edu' },
  { name: 'Brown University', location: 'Providence, RI', domain: 'brown.edu' },
  { name: 'Dartmouth College', location: 'Hanover, NH', domain: 'dartmouth.edu' },
  { name: 'Cornell University', location: 'Ithaca, NY', domain: 'cornell.edu' },
  
  // Top Public Universities
  { name: 'University of California, Berkeley', location: 'Berkeley, CA', domain: 'berkeley.edu' },
  { name: 'University of California, Los Angeles', location: 'Los Angeles, CA', domain: 'ucla.edu' },
  { name: 'University of Michigan', location: 'Ann Arbor, MI', domain: 'umich.edu' },
  { name: 'University of Virginia', location: 'Charlottesville, VA', domain: 'virginia.edu' },
  { name: 'University of North Carolina at Chapel Hill', location: 'Chapel Hill, NC', domain: 'unc.edu' },
  { name: 'University of Texas at Austin', location: 'Austin, TX', domain: 'utexas.edu' },
  { name: 'University of Wisconsin-Madison', location: 'Madison, WI', domain: 'wisc.edu' },
  { name: 'University of Illinois at Urbana-Champaign', location: 'Urbana, IL', domain: 'illinois.edu' },
  { name: 'University of Washington', location: 'Seattle, WA', domain: 'washington.edu' },
  { name: 'University of California, San Diego', location: 'San Diego, CA', domain: 'ucsd.edu' },
  { name: 'University of California, Davis', location: 'Davis, CA', domain: 'ucdavis.edu' },
  { name: 'University of California, Santa Barbara', location: 'Santa Barbara, CA', domain: 'ucsb.edu' },
  { name: 'University of California, Irvine', location: 'Irvine, CA', domain: 'uci.edu' },
  { name: 'Pennsylvania State University', location: 'University Park, PA', domain: 'psu.edu' },
  { name: 'Ohio State University', location: 'Columbus, OH', domain: 'osu.edu' },
  { name: 'University of Florida', location: 'Gainesville, FL', domain: 'ufl.edu' },
  { name: 'University of Georgia', location: 'Athens, GA', domain: 'uga.edu' },
  { name: 'University of Maryland', location: 'College Park, MD', domain: 'umd.edu' },
  { name: 'Rutgers University', location: 'New Brunswick, NJ', domain: 'rutgers.edu' },
  { name: 'Indiana University Bloomington', location: 'Bloomington, IN', domain: 'indiana.edu' },
  { name: 'Purdue University', location: 'West Lafayette, IN', domain: 'purdue.edu' },
  { name: 'University of Minnesota', location: 'Minneapolis, MN', domain: 'umn.edu' },
  { name: 'Arizona State University', location: 'Tempe, AZ', domain: 'asu.edu' },
  { name: 'University of Arizona', location: 'Tucson, AZ', domain: 'arizona.edu' },
  { name: 'University of Colorado Boulder', location: 'Boulder, CO', domain: 'colorado.edu' },
  { name: 'University of Oregon', location: 'Eugene, OR', domain: 'uoregon.edu' },
  { name: 'Oregon State University', location: 'Corvallis, OR', domain: 'oregonstate.edu' },
  
  // Top Private Universities
  { name: 'Stanford University', location: 'Stanford, CA', domain: 'stanford.edu' },
  { name: 'Massachusetts Institute of Technology', location: 'Cambridge, MA', domain: 'mit.edu' },
  { name: 'University of Chicago', location: 'Chicago, IL', domain: 'uchicago.edu' },
  { name: 'Duke University', location: 'Durham, NC', domain: 'duke.edu' },
  { name: 'Northwestern University', location: 'Evanston, IL', domain: 'northwestern.edu' },
  { name: 'Johns Hopkins University', location: 'Baltimore, MD', domain: 'jhu.edu' },
  { name: 'Vanderbilt University', location: 'Nashville, TN', domain: 'vanderbilt.edu' },
  { name: 'Rice University', location: 'Houston, TX', domain: 'rice.edu' },
  { name: 'Washington University in St. Louis', location: 'St. Louis, MO', domain: 'wustl.edu' },
  { name: 'Emory University', location: 'Atlanta, GA', domain: 'emory.edu' },
  { name: 'Georgetown University', location: 'Washington, DC', domain: 'georgetown.edu' },
  { name: 'Carnegie Mellon University', location: 'Pittsburgh, PA', domain: 'cmu.edu' },
  { name: 'University of Southern California', location: 'Los Angeles, CA', domain: 'usc.edu' },
  { name: 'New York University', location: 'New York, NY', domain: 'nyu.edu' },
  { name: 'Boston University', location: 'Boston, MA', domain: 'bu.edu' },
  { name: 'Tufts University', location: 'Medford, MA', domain: 'tufts.edu' },
  { name: 'Wake Forest University', location: 'Winston-Salem, NC', domain: 'wfu.edu' },
  { name: 'University of Notre Dame', location: 'Notre Dame, IN', domain: 'nd.edu' },
  { name: 'Boston College', location: 'Chestnut Hill, MA', domain: 'bc.edu' },
  { name: 'Brandeis University', location: 'Waltham, MA', domain: 'brandeis.edu' },
  
  // Liberal Arts Colleges
  { name: 'Williams College', location: 'Williamstown, MA', domain: 'williams.edu' },
  { name: 'Amherst College', location: 'Amherst, MA', domain: 'amherst.edu' },
  { name: 'Swarthmore College', location: 'Swarthmore, PA', domain: 'swarthmore.edu' },
  { name: 'Wellesley College', location: 'Wellesley, MA', domain: 'wellesley.edu' },
  { name: 'Middlebury College', location: 'Middlebury, VT', domain: 'middlebury.edu' },
  { name: 'Pomona College', location: 'Claremont, CA', domain: 'pomona.edu' },
  { name: 'Bowdoin College', location: 'Brunswick, ME', domain: 'bowdoin.edu' },
  { name: 'Claremont McKenna College', location: 'Claremont, CA', domain: 'cmc.edu' },
  { name: 'Davidson College', location: 'Davidson, NC', domain: 'davidson.edu' },
  { name: 'Haverford College', location: 'Haverford, PA', domain: 'haverford.edu' },
  
  // State Universities (More)
  { name: 'University of California, Riverside', location: 'Riverside, CA', domain: 'ucr.edu' },
  { name: 'University of California, Santa Cruz', location: 'Santa Cruz, CA', domain: 'ucsc.edu' },
  { name: 'University of California, Merced', location: 'Merced, CA', domain: 'ucmerced.edu' },
  { name: 'California State University, Long Beach', location: 'Long Beach, CA', domain: 'csulb.edu' },
  { name: 'California State University, Fullerton', location: 'Fullerton, CA', domain: 'fullerton.edu' },
  { name: 'San Diego State University', location: 'San Diego, CA', domain: 'sdsu.edu' },
  { name: 'San Jose State University', location: 'San Jose, CA', domain: 'sjsu.edu' },
  { name: 'California Polytechnic State University', location: 'San Luis Obispo, CA', domain: 'calpoly.edu' },
  { name: 'University of California, Santa Barbara', location: 'Santa Barbara, CA', domain: 'ucsb.edu' },
  { name: 'University of California, Berkeley', location: 'Berkeley, CA', domain: 'berkeley.edu' },
  
  // Additional Major Universities
  { name: 'Texas A&M University', location: 'College Station, TX', domain: 'tamu.edu' },
  { name: 'University of South Carolina', location: 'Columbia, SC', domain: 'sc.edu' },
  { name: 'Clemson University', location: 'Clemson, SC', domain: 'clemson.edu' },
  { name: 'University of Tennessee', location: 'Knoxville, TN', domain: 'utk.edu' },
  { name: 'University of Kentucky', location: 'Lexington, KY', domain: 'uky.edu' },
  { name: 'University of Louisville', location: 'Louisville, KY', domain: 'louisville.edu' },
  { name: 'University of Alabama', location: 'Tuscaloosa, AL', domain: 'ua.edu' },
  { name: 'Auburn University', location: 'Auburn, AL', domain: 'auburn.edu' },
  { name: 'University of Mississippi', location: 'Oxford, MS', domain: 'olemiss.edu' },
  { name: 'Louisiana State University', location: 'Baton Rouge, LA', domain: 'lsu.edu' },
  { name: 'University of Arkansas', location: 'Fayetteville, AR', domain: 'uark.edu' },
  { name: 'University of Oklahoma', location: 'Norman, OK', domain: 'ou.edu' },
  { name: 'Oklahoma State University', location: 'Stillwater, OK', domain: 'okstate.edu' },
  { name: 'Kansas State University', location: 'Manhattan, KS', domain: 'k-state.edu' },
  { name: 'University of Kansas', location: 'Lawrence, KS', domain: 'ku.edu' },
  { name: 'Iowa State University', location: 'Ames, IA', domain: 'iastate.edu' },
  { name: 'University of Iowa', location: 'Iowa City, IA', domain: 'uiowa.edu' },
  { name: 'University of Nebraska-Lincoln', location: 'Lincoln, NE', domain: 'unl.edu' },
  { name: 'University of Missouri', location: 'Columbia, MO', domain: 'missouri.edu' },
  { name: 'University of South Dakota', location: 'Vermillion, SD', domain: 'usd.edu' },
  { name: 'North Dakota State University', location: 'Fargo, ND', domain: 'ndsu.edu' },
  { name: 'Montana State University', location: 'Bozeman, MT', domain: 'montana.edu' },
  { name: 'University of Montana', location: 'Missoula, MT', domain: 'umt.edu' },
  { name: 'University of Wyoming', location: 'Laramie, WY', domain: 'uwyo.edu' },
  { name: 'University of Utah', location: 'Salt Lake City, UT', domain: 'utah.edu' },
  { name: 'Brigham Young University', location: 'Provo, UT', domain: 'byu.edu' },
  { name: 'University of Nevada, Las Vegas', location: 'Las Vegas, NV', domain: 'unlv.edu' },
  { name: 'University of Nevada, Reno', location: 'Reno, NV', domain: 'unr.edu' },
  { name: 'University of New Mexico', location: 'Albuquerque, NM', domain: 'unm.edu' },
  { name: 'New Mexico State University', location: 'Las Cruces, NM', domain: 'nmsu.edu' },
  { name: 'University of Alaska Fairbanks', location: 'Fairbanks, AK', domain: 'alaska.edu' },
  { name: 'University of Hawaii at Manoa', location: 'Honolulu, HI', domain: 'hawaii.edu' },
  
  // East Coast
  { name: 'University of Connecticut', location: 'Storrs, CT', domain: 'uconn.edu' },
  { name: 'University of Massachusetts Amherst', location: 'Amherst, MA', domain: 'umass.edu' },
  { name: 'University of Vermont', location: 'Burlington, VT', domain: 'uvm.edu' },
  { name: 'University of New Hampshire', location: 'Durham, NH', domain: 'unh.edu' },
  { name: 'University of Maine', location: 'Orono, ME', domain: 'maine.edu' },
  { name: 'University of Delaware', location: 'Newark, DE', domain: 'udel.edu' },
  { name: 'West Virginia University', location: 'Morgantown, WV', domain: 'wvu.edu' },
  
  // More State Schools
  { name: 'Michigan State University', location: 'East Lansing, MI', domain: 'msu.edu' },
  { name: 'Wayne State University', location: 'Detroit, MI', domain: 'wayne.edu' },
  { name: 'University of Cincinnati', location: 'Cincinnati, OH', domain: 'uc.edu' },
  { name: 'Miami University', location: 'Oxford, OH', domain: 'miamioh.edu' },
  { name: 'Kent State University', location: 'Kent, OH', domain: 'kent.edu' },
  { name: 'Bowling Green State University', location: 'Bowling Green, OH', domain: 'bgsu.edu' },
  { name: 'University of Toledo', location: 'Toledo, OH', domain: 'utoledo.edu' },
];

export async function seedSchools(prismaInstance = null) {
  const db = prismaInstance || prisma;
  console.log('🌱 Starting to seed schools...\n');

  let created = 0;
  let skipped = 0;

  for (const school of schools) {
    try {
      const existing = await db.school.findUnique({
        where: { name: school.name },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${school.name} (already exists)`);
        skipped++;
        continue;
      }

      await db.school.create({
        data: school,
      });

      console.log(`✅ Created: ${school.name}`);
      created++;
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped: ${school.name} (duplicate)`);
        skipped++;
      } else {
        console.error(`❌ Error creating ${school.name}:`, error.message);
      }
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   Created: ${created} schools`);
  console.log(`   Skipped: ${skipped} schools`);
  console.log(`   Total: ${schools.length} schools`);
  
  return { created, skipped, total: schools.length };
}

// Export schools data
export { schools as SCHOOLS_DATA };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('seed-schools')) {
  seedSchools()
    .catch((error) => {
      console.error('Error seeding schools:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
