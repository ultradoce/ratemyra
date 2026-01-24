import { PrismaClient } from '@prisma/client';

// Create prisma instance for standalone script execution
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
  
  // More California Schools
  { name: 'California State University, Northridge', location: 'Northridge, CA', domain: 'csun.edu' },
  { name: 'California State University, Los Angeles', location: 'Los Angeles, CA', domain: 'calstatela.edu' },
  { name: 'California State University, Sacramento', location: 'Sacramento, CA', domain: 'csus.edu' },
  { name: 'California State University, Fresno', location: 'Fresno, CA', domain: 'csufresno.edu' },
  { name: 'California State University, San Francisco', location: 'San Francisco, CA', domain: 'sfsu.edu' },
  { name: 'California State University, East Bay', location: 'Hayward, CA', domain: 'csueastbay.edu' },
  { name: 'California State University, Chico', location: 'Chico, CA', domain: 'csuchico.edu' },
  { name: 'California State University, Dominguez Hills', location: 'Carson, CA', domain: 'csudh.edu' },
  { name: 'California State University, Bakersfield', location: 'Bakersfield, CA', domain: 'csub.edu' },
  { name: 'California State University, San Bernardino', location: 'San Bernardino, CA', domain: 'csusb.edu' },
  { name: 'California State University, Stanislaus', location: 'Turlock, CA', domain: 'csustan.edu' },
  { name: 'California State University, Monterey Bay', location: 'Seaside, CA', domain: 'csumb.edu' },
  { name: 'California State University, Channel Islands', location: 'Camarillo, CA', domain: 'csuci.edu' },
  { name: 'Pepperdine University', location: 'Malibu, CA', domain: 'pepperdine.edu' },
  { name: 'Loyola Marymount University', location: 'Los Angeles, CA', domain: 'lmu.edu' },
  { name: 'Chapman University', location: 'Orange, CA', domain: 'chapman.edu' },
  { name: 'University of San Diego', location: 'San Diego, CA', domain: 'sandiego.edu' },
  { name: 'University of San Francisco', location: 'San Francisco, CA', domain: 'usfca.edu' },
  { name: 'Santa Clara University', location: 'Santa Clara, CA', domain: 'scu.edu' },
  { name: 'Occidental College', location: 'Los Angeles, CA', domain: 'oxy.edu' },
  { name: 'Harvey Mudd College', location: 'Claremont, CA', domain: 'hmc.edu' },
  { name: 'Scripps College', location: 'Claremont, CA', domain: 'scrippscollege.edu' },
  { name: 'Pitzer College', location: 'Claremont, CA', domain: 'pitzer.edu' },
  { name: 'University of Redlands', location: 'Redlands, CA', domain: 'redlands.edu' },
  { name: 'Mills College', location: 'Oakland, CA', domain: 'mills.edu' },
  
  // More Texas Schools
  { name: 'University of Houston', location: 'Houston, TX', domain: 'uh.edu' },
  { name: 'Texas Tech University', location: 'Lubbock, TX', domain: 'ttu.edu' },
  { name: 'University of North Texas', location: 'Denton, TX', domain: 'unt.edu' },
  { name: 'Texas State University', location: 'San Marcos, TX', domain: 'txstate.edu' },
  { name: 'University of Texas at Dallas', location: 'Richardson, TX', domain: 'utdallas.edu' },
  { name: 'University of Texas at Arlington', location: 'Arlington, TX', domain: 'uta.edu' },
  { name: 'University of Texas at San Antonio', location: 'San Antonio, TX', domain: 'utsa.edu' },
  { name: 'University of Texas at El Paso', location: 'El Paso, TX', domain: 'utep.edu' },
  { name: 'Baylor University', location: 'Waco, TX', domain: 'baylor.edu' },
  { name: 'Southern Methodist University', location: 'Dallas, TX', domain: 'smu.edu' },
  { name: 'Texas Christian University', location: 'Fort Worth, TX', domain: 'tcu.edu' },
  { name: 'Trinity University', location: 'San Antonio, TX', domain: 'trinity.edu' },
  
  // More Florida Schools
  { name: 'Florida State University', location: 'Tallahassee, FL', domain: 'fsu.edu' },
  { name: 'University of Central Florida', location: 'Orlando, FL', domain: 'ucf.edu' },
  { name: 'University of South Florida', location: 'Tampa, FL', domain: 'usf.edu' },
  { name: 'Florida International University', location: 'Miami, FL', domain: 'fiu.edu' },
  { name: 'Florida Atlantic University', location: 'Boca Raton, FL', domain: 'fau.edu' },
  { name: 'University of Miami', location: 'Coral Gables, FL', domain: 'miami.edu' },
  { name: 'Rollins College', location: 'Winter Park, FL', domain: 'rollins.edu' },
  { name: 'Eckerd College', location: 'St. Petersburg, FL', domain: 'eckerd.edu' },
  
  // More New York Schools
  { name: 'State University of New York at Buffalo', location: 'Buffalo, NY', domain: 'buffalo.edu' },
  { name: 'State University of New York at Stony Brook', location: 'Stony Brook, NY', domain: 'stonybrook.edu' },
  { name: 'State University of New York at Albany', location: 'Albany, NY', domain: 'albany.edu' },
  { name: 'State University of New York at Binghamton', location: 'Binghamton, NY', domain: 'binghamton.edu' },
  { name: 'City University of New York', location: 'New York, NY', domain: 'cuny.edu' },
  { name: 'Fordham University', location: 'New York, NY', domain: 'fordham.edu' },
  { name: 'Syracuse University', location: 'Syracuse, NY', domain: 'syr.edu' },
  { name: 'Rensselaer Polytechnic Institute', location: 'Troy, NY', domain: 'rpi.edu' },
  { name: 'Rochester Institute of Technology', location: 'Rochester, NY', domain: 'rit.edu' },
  { name: 'University of Rochester', location: 'Rochester, NY', domain: 'rochester.edu' },
  { name: 'Colgate University', location: 'Hamilton, NY', domain: 'colgate.edu' },
  { name: 'Hamilton College', location: 'Clinton, NY', domain: 'hamilton.edu' },
  { name: 'Vassar College', location: 'Poughkeepsie, NY', domain: 'vassar.edu' },
  { name: 'Skidmore College', location: 'Saratoga Springs, NY', domain: 'skidmore.edu' },
  { name: 'Union College', location: 'Schenectady, NY', domain: 'union.edu' },
  { name: 'Bard College', location: 'Annandale-on-Hudson, NY', domain: 'bard.edu' },
  
  // More Pennsylvania Schools
  { name: 'University of Pittsburgh', location: 'Pittsburgh, PA', domain: 'pitt.edu' },
  { name: 'Temple University', location: 'Philadelphia, PA', domain: 'temple.edu' },
  { name: 'Drexel University', location: 'Philadelphia, PA', domain: 'drexel.edu' },
  { name: 'Villanova University', location: 'Villanova, PA', domain: 'villanova.edu' },
  { name: 'Lehigh University', location: 'Bethlehem, PA', domain: 'lehigh.edu' },
  { name: 'Bucknell University', location: 'Lewisburg, PA', domain: 'bucknell.edu' },
  { name: 'Lafayette College', location: 'Easton, PA', domain: 'lafayette.edu' },
  { name: 'Dickinson College', location: 'Carlisle, PA', domain: 'dickinson.edu' },
  { name: 'Franklin & Marshall College', location: 'Lancaster, PA', domain: 'fandm.edu' },
  { name: 'Gettysburg College', location: 'Gettysburg, PA', domain: 'gettysburg.edu' },
  
  // More Illinois Schools
  { name: 'University of Illinois at Chicago', location: 'Chicago, IL', domain: 'uic.edu' },
  { name: 'Illinois State University', location: 'Normal, IL', domain: 'ilstu.edu' },
  { name: 'Northern Illinois University', location: 'DeKalb, IL', domain: 'niu.edu' },
  { name: 'Southern Illinois University', location: 'Carbondale, IL', domain: 'siu.edu' },
  { name: 'Loyola University Chicago', location: 'Chicago, IL', domain: 'luc.edu' },
  { name: 'DePaul University', location: 'Chicago, IL', domain: 'depaul.edu' },
  { name: 'Illinois Institute of Technology', location: 'Chicago, IL', domain: 'iit.edu' },
  { name: 'Wheaton College', location: 'Wheaton, IL', domain: 'wheaton.edu' },
  { name: 'Knox College', location: 'Galesburg, IL', domain: 'knox.edu' },
  
  // More Massachusetts Schools
  { name: 'Northeastern University', location: 'Boston, MA', domain: 'northeastern.edu' },
  { name: 'Brandeis University', location: 'Waltham, MA', domain: 'brandeis.edu' },
  { name: 'College of the Holy Cross', location: 'Worcester, MA', domain: 'holycross.edu' },
  { name: 'Smith College', location: 'Northampton, MA', domain: 'smith.edu' },
  { name: 'Mount Holyoke College', location: 'South Hadley, MA', domain: 'mtholyoke.edu' },
  { name: 'Amherst College', location: 'Amherst, MA', domain: 'amherst.edu' },
  { name: 'Bentley University', location: 'Waltham, MA', domain: 'bentley.edu' },
  { name: 'Babson College', location: 'Wellesley, MA', domain: 'babson.edu' },
  { name: 'Worcester Polytechnic Institute', location: 'Worcester, MA', domain: 'wpi.edu' },
  
  // More North Carolina Schools
  { name: 'North Carolina State University', location: 'Raleigh, NC', domain: 'ncsu.edu' },
  { name: 'East Carolina University', location: 'Greenville, NC', domain: 'ecu.edu' },
  { name: 'Appalachian State University', location: 'Boone, NC', domain: 'appstate.edu' },
  { name: 'Elon University', location: 'Elon, NC', domain: 'elon.edu' },
  { name: 'Davidson College', location: 'Davidson, NC', domain: 'davidson.edu' },
  
  // More Virginia Schools
  { name: 'Virginia Tech', location: 'Blacksburg, VA', domain: 'vt.edu' },
  { name: 'College of William & Mary', location: 'Williamsburg, VA', domain: 'wm.edu' },
  { name: 'George Mason University', location: 'Fairfax, VA', domain: 'gmu.edu' },
  { name: 'James Madison University', location: 'Harrisonburg, VA', domain: 'jmu.edu' },
  { name: 'Virginia Commonwealth University', location: 'Richmond, VA', domain: 'vcu.edu' },
  { name: 'University of Richmond', location: 'Richmond, VA', domain: 'richmond.edu' },
  { name: 'Washington and Lee University', location: 'Lexington, VA', domain: 'wlu.edu' },
  
  // More Georgia Schools
  { name: 'Georgia Institute of Technology', location: 'Atlanta, GA', domain: 'gatech.edu' },
  { name: 'Georgia State University', location: 'Atlanta, GA', domain: 'gsu.edu' },
  { name: 'Kennesaw State University', location: 'Kennesaw, GA', domain: 'kennesaw.edu' },
  { name: 'Mercer University', location: 'Macon, GA', domain: 'mercer.edu' },
  { name: 'Spelman College', location: 'Atlanta, GA', domain: 'spelman.edu' },
  { name: 'Morehouse College', location: 'Atlanta, GA', domain: 'morehouse.edu' },
  
  // More Michigan Schools
  { name: 'Western Michigan University', location: 'Kalamazoo, MI', domain: 'wmich.edu' },
  { name: 'Central Michigan University', location: 'Mount Pleasant, MI', domain: 'cmich.edu' },
  { name: 'Eastern Michigan University', location: 'Ypsilanti, MI', domain: 'emich.edu' },
  { name: 'Northern Michigan University', location: 'Marquette, MI', domain: 'nmu.edu' },
  { name: 'Kalamazoo College', location: 'Kalamazoo, MI', domain: 'kzoo.edu' },
  { name: 'Hope College', location: 'Holland, MI', domain: 'hope.edu' },
  { name: 'Calvin University', location: 'Grand Rapids, MI', domain: 'calvin.edu' },
  
  // More Ohio Schools
  { name: 'Ohio University', location: 'Athens, OH', domain: 'ohio.edu' },
  { name: 'Wright State University', location: 'Dayton, OH', domain: 'wright.edu' },
  { name: 'University of Akron', location: 'Akron, OH', domain: 'uakron.edu' },
  { name: 'Cleveland State University', location: 'Cleveland, OH', domain: 'csuohio.edu' },
  { name: 'Case Western Reserve University', location: 'Cleveland, OH', domain: 'case.edu' },
  { name: 'Oberlin College', location: 'Oberlin, OH', domain: 'oberlin.edu' },
  { name: 'Kenyon College', location: 'Gambier, OH', domain: 'kenyon.edu' },
  { name: 'Denison University', location: 'Granville, OH', domain: 'denison.edu' },
  { name: 'College of Wooster', location: 'Wooster, OH', domain: 'wooster.edu' },
  
  // More Indiana Schools
  { name: 'Ball State University', location: 'Muncie, IN', domain: 'bsu.edu' },
  { name: 'Butler University', location: 'Indianapolis, IN', domain: 'butler.edu' },
  { name: 'DePauw University', location: 'Greencastle, IN', domain: 'depauw.edu' },
  { name: 'Wabash College', location: 'Crawfordsville, IN', domain: 'wabash.edu' },
  { name: 'Rose-Hulman Institute of Technology', location: 'Terre Haute, IN', domain: 'rose-hulman.edu' },
  
  // More Wisconsin Schools
  { name: 'University of Wisconsin-Milwaukee', location: 'Milwaukee, WI', domain: 'uwm.edu' },
  { name: 'Marquette University', location: 'Milwaukee, WI', domain: 'marquette.edu' },
  { name: 'Beloit College', location: 'Beloit, WI', domain: 'beloit.edu' },
  { name: 'Lawrence University', location: 'Appleton, WI', domain: 'lawrence.edu' },
  
  // More Minnesota Schools
  { name: 'University of Minnesota Duluth', location: 'Duluth, MN', domain: 'd.umn.edu' },
  { name: 'St. Olaf College', location: 'Northfield, MN', domain: 'stolaf.edu' },
  { name: 'Carleton College', location: 'Northfield, MN', domain: 'carleton.edu' },
  { name: 'Macalester College', location: 'St. Paul, MN', domain: 'macalester.edu' },
  
  // More Washington Schools
  { name: 'Washington State University', location: 'Pullman, WA', domain: 'wsu.edu' },
  { name: 'Western Washington University', location: 'Bellingham, WA', domain: 'wwu.edu' },
  { name: 'Eastern Washington University', location: 'Cheney, WA', domain: 'ewu.edu' },
  { name: 'Gonzaga University', location: 'Spokane, WA', domain: 'gonzaga.edu' },
  { name: 'Whitman College', location: 'Walla Walla, WA', domain: 'whitman.edu' },
  { name: 'University of Puget Sound', location: 'Tacoma, WA', domain: 'pugetsound.edu' },
  
  // More Oregon Schools
  { name: 'Portland State University', location: 'Portland, OR', domain: 'pdx.edu' },
  { name: 'Reed College', location: 'Portland, OR', domain: 'reed.edu' },
  { name: 'Lewis & Clark College', location: 'Portland, OR', domain: 'lclark.edu' },
  { name: 'Willamette University', location: 'Salem, OR', domain: 'willamette.edu' },
  
  // More Colorado Schools
  { name: 'Colorado State University', location: 'Fort Collins, CO', domain: 'colostate.edu' },
  { name: 'University of Denver', location: 'Denver, CO', domain: 'du.edu' },
  { name: 'Colorado College', location: 'Colorado Springs, CO', domain: 'coloradocollege.edu' },
  { name: 'United States Air Force Academy', location: 'Colorado Springs, CO', domain: 'usafa.edu' },
  
  // More Arizona Schools
  { name: 'Northern Arizona University', location: 'Flagstaff, AZ', domain: 'nau.edu' },
  { name: 'Grand Canyon University', location: 'Phoenix, AZ', domain: 'gcu.edu' },
  
  // More Tennessee Schools
  { name: 'Vanderbilt University', location: 'Nashville, TN', domain: 'vanderbilt.edu' },
  { name: 'Middle Tennessee State University', location: 'Murfreesboro, TN', domain: 'mtsu.edu' },
  { name: 'University of Memphis', location: 'Memphis, TN', domain: 'memphis.edu' },
  { name: 'Rhodes College', location: 'Memphis, TN', domain: 'rhodes.edu' },
  { name: 'Sewanee: The University of the South', location: 'Sewanee, TN', domain: 'sewanee.edu' },
  
  // More Alabama Schools
  { name: 'University of Alabama at Birmingham', location: 'Birmingham, AL', domain: 'uab.edu' },
  { name: 'Auburn University at Montgomery', location: 'Montgomery, AL', domain: 'aum.edu' },
  { name: 'Troy University', location: 'Troy, AL', domain: 'troy.edu' },
  { name: 'University of South Alabama', location: 'Mobile, AL', domain: 'southalabama.edu' },
  
  // More Louisiana Schools
  { name: 'Tulane University', location: 'New Orleans, LA', domain: 'tulane.edu' },
  { name: 'University of New Orleans', location: 'New Orleans, LA', domain: 'uno.edu' },
  { name: 'Louisiana Tech University', location: 'Ruston, LA', domain: 'latech.edu' },
  
  // More Mississippi Schools
  { name: 'Mississippi State University', location: 'Starkville, MS', domain: 'msstate.edu' },
  { name: 'University of Southern Mississippi', location: 'Hattiesburg, MS', domain: 'usm.edu' },
  { name: 'Millsaps College', location: 'Jackson, MS', domain: 'millsaps.edu' },
  
  // More Arkansas Schools
  { name: 'Arkansas State University', location: 'Jonesboro, AR', domain: 'astate.edu' },
  { name: 'University of Central Arkansas', location: 'Conway, AR', domain: 'uca.edu' },
  { name: 'Hendrix College', location: 'Conway, AR', domain: 'hendrix.edu' },
  
  // More Missouri Schools
  { name: 'Missouri State University', location: 'Springfield, MO', domain: 'missouristate.edu' },
  { name: 'University of Missouri-Kansas City', location: 'Kansas City, MO', domain: 'umkc.edu' },
  { name: 'University of Missouri-St. Louis', location: 'St. Louis, MO', domain: 'umsl.edu' },
  { name: 'Truman State University', location: 'Kirksville, MO', domain: 'truman.edu' },
  
  // More Iowa Schools
  { name: 'Grinnell College', location: 'Grinnell, IA', domain: 'grinnell.edu' },
  { name: 'Coe College', location: 'Cedar Rapids, IA', domain: 'coe.edu' },
  { name: 'Cornell College', location: 'Mount Vernon, IA', domain: 'cornellcollege.edu' },
  
  // More Kansas Schools
  { name: 'Wichita State University', location: 'Wichita, KS', domain: 'wichita.edu' },
  { name: 'Emporia State University', location: 'Emporia, KS', domain: 'emporia.edu' },
  
  // More Nebraska Schools
  { name: 'Creighton University', location: 'Omaha, NE', domain: 'creighton.edu' },
  { name: 'University of Nebraska at Omaha', location: 'Omaha, NE', domain: 'unomaha.edu' },
  
  // More South Dakota Schools
  { name: 'South Dakota State University', location: 'Brookings, SD', domain: 'sdstate.edu' },
  
  // More North Dakota Schools
  { name: 'University of North Dakota', location: 'Grand Forks, ND', domain: 'und.edu' },
  
  // More Montana Schools
  { name: 'Montana Tech', location: 'Butte, MT', domain: 'mtech.edu' },
  
  // More Wyoming Schools
  { name: 'University of Wyoming', location: 'Laramie, WY', domain: 'uwyo.edu' },
  
  // More Utah Schools
  { name: 'Utah State University', location: 'Logan, UT', domain: 'usu.edu' },
  { name: 'Weber State University', location: 'Ogden, UT', domain: 'weber.edu' },
  { name: 'Utah Valley University', location: 'Orem, UT', domain: 'uvu.edu' },
  
  // More Idaho Schools
  { name: 'University of Idaho', location: 'Moscow, ID', domain: 'uidaho.edu' },
  { name: 'Boise State University', location: 'Boise, ID', domain: 'boisestate.edu' },
  { name: 'Idaho State University', location: 'Pocatello, ID', domain: 'isu.edu' },
  
  // More Nevada Schools
  { name: 'Nevada State College', location: 'Henderson, NV', domain: 'nsc.edu' },
  
  // More New Mexico Schools
  { name: 'New Mexico Institute of Mining and Technology', location: 'Socorro, NM', domain: 'nmt.edu' },
  
  // More Alaska Schools
  { name: 'University of Alaska Anchorage', location: 'Anchorage, AK', domain: 'uaa.alaska.edu' },
  
  // More Hawaii Schools
  { name: 'Hawaii Pacific University', location: 'Honolulu, HI', domain: 'hpu.edu' },
  
  // More Connecticut Schools
  { name: 'Yale University', location: 'New Haven, CT', domain: 'yale.edu' },
  { name: 'Wesleyan University', location: 'Middletown, CT', domain: 'wesleyan.edu' },
  { name: 'Trinity College', location: 'Hartford, CT', domain: 'trincoll.edu' },
  { name: 'Connecticut College', location: 'New London, CT', domain: 'conncoll.edu' },
  { name: 'Fairfield University', location: 'Fairfield, CT', domain: 'fairfield.edu' },
  { name: 'Quinnipiac University', location: 'Hamden, CT', domain: 'quinnipiac.edu' },
  
  // More Rhode Island Schools
  { name: 'Rhode Island School of Design', location: 'Providence, RI', domain: 'risd.edu' },
  { name: 'Providence College', location: 'Providence, RI', domain: 'providence.edu' },
  { name: 'Bryant University', location: 'Smithfield, RI', domain: 'bryant.edu' },
  
  // More Vermont Schools
  { name: 'Middlebury College', location: 'Middlebury, VT', domain: 'middlebury.edu' },
  { name: 'Bennington College', location: 'Bennington, VT', domain: 'bennington.edu' },
  
  // More New Hampshire Schools
  { name: 'Dartmouth College', location: 'Hanover, NH', domain: 'dartmouth.edu' },
  { name: 'Keene State College', location: 'Keene, NH', domain: 'keene.edu' },
  { name: 'Plymouth State University', location: 'Plymouth, NH', domain: 'plymouth.edu' },
  
  // More Maine Schools
  { name: 'Bates College', location: 'Lewiston, ME', domain: 'bates.edu' },
  { name: 'Colby College', location: 'Waterville, ME', domain: 'colby.edu' },
  { name: 'University of Southern Maine', location: 'Portland, ME', domain: 'usm.maine.edu' },
  
  // More Delaware Schools
  { name: 'Delaware State University', location: 'Dover, DE', domain: 'desu.edu' },
  
  // More West Virginia Schools
  { name: 'Marshall University', location: 'Huntington, WV', domain: 'marshall.edu' },
  
  // More South Carolina Schools
  { name: 'College of Charleston', location: 'Charleston, SC', domain: 'cofc.edu' },
  { name: 'Furman University', location: 'Greenville, SC', domain: 'furman.edu' },
  { name: 'Wofford College', location: 'Spartanburg, SC', domain: 'wofford.edu' },
  { name: 'The Citadel', location: 'Charleston, SC', domain: 'citadel.edu' },
  
  // More Kentucky Schools
  { name: 'Western Kentucky University', location: 'Bowling Green, KY', domain: 'wku.edu' },
  { name: 'Eastern Kentucky University', location: 'Richmond, KY', domain: 'eku.edu' },
  { name: 'Northern Kentucky University', location: 'Highland Heights, KY', domain: 'nku.edu' },
  { name: 'Centre College', location: 'Danville, KY', domain: 'centre.edu' },
  { name: 'Berea College', location: 'Berea, KY', domain: 'berea.edu' },
  
  // HBCUs (Historically Black Colleges and Universities)
  { name: 'Howard University', location: 'Washington, DC', domain: 'howard.edu' },
  { name: 'Hampton University', location: 'Hampton, VA', domain: 'hamptonu.edu' },
  { name: 'Tuskegee University', location: 'Tuskegee, AL', domain: 'tuskegee.edu' },
  { name: 'Florida A&M University', location: 'Tallahassee, FL', domain: 'famu.edu' },
  { name: 'North Carolina A&T State University', location: 'Greensboro, NC', domain: 'ncat.edu' },
  { name: 'Prairie View A&M University', location: 'Prairie View, TX', domain: 'pvamu.edu' },
  { name: 'Tennessee State University', location: 'Nashville, TN', domain: 'tnstate.edu' },
  { name: 'Jackson State University', location: 'Jackson, MS', domain: 'jsums.edu' },
  { name: 'Grambling State University', location: 'Grambling, LA', domain: 'gram.edu' },
  { name: 'Southern University', location: 'Baton Rouge, LA', domain: 'subr.edu' },
  { name: 'Alabama State University', location: 'Montgomery, AL', domain: 'alasu.edu' },
  { name: 'Alabama A&M University', location: 'Normal, AL', domain: 'aamu.edu' },
  { name: 'Bethune-Cookman University', location: 'Daytona Beach, FL', domain: 'cookman.edu' },
  { name: 'Xavier University of Louisiana', location: 'New Orleans, LA', domain: 'xula.edu' },
  { name: 'Fisk University', location: 'Nashville, TN', domain: 'fisk.edu' },
  { name: 'Dillard University', location: 'New Orleans, LA', domain: 'dillard.edu' },
  { name: 'Clark Atlanta University', location: 'Atlanta, GA', domain: 'cau.edu' },
  { name: 'Morehouse College', location: 'Atlanta, GA', domain: 'morehouse.edu' },
  { name: 'Spelman College', location: 'Atlanta, GA', domain: 'spelman.edu' },
  { name: 'Bennett College', location: 'Greensboro, NC', domain: 'bennett.edu' },
  { name: 'Winston-Salem State University', location: 'Winston-Salem, NC', domain: 'wssu.edu' },
  { name: 'North Carolina Central University', location: 'Durham, NC', domain: 'nccu.edu' },
  { name: 'Delaware State University', location: 'Dover, DE', domain: 'desu.edu' },
  { name: 'Morgan State University', location: 'Baltimore, MD', domain: 'morgan.edu' },
  { name: 'Bowie State University', location: 'Bowie, MD', domain: 'bowiestate.edu' },
  { name: 'Coppin State University', location: 'Baltimore, MD', domain: 'coppin.edu' },
  { name: 'University of Maryland Eastern Shore', location: 'Princess Anne, MD', domain: 'umes.edu' },
  { name: 'Virginia State University', location: 'Petersburg, VA', domain: 'vsu.edu' },
  { name: 'Norfolk State University', location: 'Norfolk, VA', domain: 'nsu.edu' },
  { name: 'Virginia Union University', location: 'Richmond, VA', domain: 'vuu.edu' },
  { name: 'Kentucky State University', location: 'Frankfort, KY', domain: 'kysu.edu' },
  { name: 'Central State University', location: 'Wilberforce, OH', domain: 'centralstate.edu' },
  { name: 'Wilberforce University', location: 'Wilberforce, OH', domain: 'wilberforce.edu' },
  { name: 'Lincoln University', location: 'Jefferson City, MO', domain: 'lincolnu.edu' },
  { name: 'Harris-Stowe State University', location: 'St. Louis, MO', domain: 'hssu.edu' },
  { name: 'Langston University', location: 'Langston, OK', domain: 'langston.edu' },
  { name: 'Texas Southern University', location: 'Houston, TX', domain: 'tsu.edu' },
  { name: 'Wiley College', location: 'Marshall, TX', domain: 'wileyc.edu' },
  { name: 'Paul Quinn College', location: 'Dallas, TX', domain: 'pqc.edu' },
  { name: 'Jarvis Christian College', location: 'Hawkins, TX', domain: 'jarvis.edu' },
  { name: 'Huston-Tillotson University', location: 'Austin, TX', domain: 'htu.edu' },
  { name: 'Texas College', location: 'Tyler, TX', domain: 'texascollege.edu' },
  { name: 'Southwestern Christian College', location: 'Terrell, TX', domain: 'swcc.edu' },
  { name: 'St. Philip\'s College', location: 'San Antonio, TX', domain: 'alamo.edu' },
  { name: 'University of Arkansas at Pine Bluff', location: 'Pine Bluff, AR', domain: 'uapb.edu' },
  { name: 'Philander Smith College', location: 'Little Rock, AR', domain: 'philander.edu' },
  { name: 'Shorter College', location: 'North Little Rock, AR', domain: 'shortercollege.edu' },
  { name: 'Mississippi Valley State University', location: 'Itta Bena, MS', domain: 'mvsu.edu' },
  { name: 'Rust College', location: 'Holly Springs, MS', domain: 'rustcollege.edu' },
  { name: 'Tougaloo College', location: 'Tougaloo, MS', domain: 'tougaloo.edu' },
  { name: 'Alcorn State University', location: 'Lorman, MS', domain: 'alcorn.edu' },
  { name: 'Stillman College', location: 'Tuscaloosa, AL', domain: 'stillman.edu' },
  { name: 'Talladega College', location: 'Talladega, AL', domain: 'talladega.edu' },
  { name: 'Miles College', location: 'Fairfield, AL', domain: 'miles.edu' },
  { name: 'Selma University', location: 'Selma, AL', domain: 'selmauniversity.edu' },
  { name: 'Concordia College Alabama', location: 'Selma, AL', domain: 'concordiaselma.edu' },
  { name: 'Oakwood University', location: 'Huntsville, AL', domain: 'oakwood.edu' },
  { name: 'Edward Waters College', location: 'Jacksonville, FL', domain: 'ewc.edu' },
  { name: 'Florida Memorial University', location: 'Miami Gardens, FL', domain: 'fmuniv.edu' },
  { name: 'Savannah State University', location: 'Savannah, GA', domain: 'savannahstate.edu' },
  { name: 'Albany State University', location: 'Albany, GA', domain: 'asurams.edu' },
  { name: 'Fort Valley State University', location: 'Fort Valley, GA', domain: 'fvsu.edu' },
  { name: 'Paine College', location: 'Augusta, GA', domain: 'paine.edu' },
  { name: 'Voorhees College', location: 'Denmark, SC', domain: 'voorhees.edu' },
  { name: 'Claflin University', location: 'Orangeburg, SC', domain: 'claflin.edu' },
  { name: 'Benedict College', location: 'Columbia, SC', domain: 'benedict.edu' },
  { name: 'Allen University', location: 'Columbia, SC', domain: 'allenuniversity.edu' },
  { name: 'Morris College', location: 'Sumter, SC', domain: 'morris.edu' },
  { name: 'Clinton College', location: 'Rock Hill, SC', domain: 'clintoncollege.edu' },
  { name: 'Denmark Technical College', location: 'Denmark, SC', domain: 'denmarktech.edu' },
  { name: 'Livingstone College', location: 'Salisbury, NC', domain: 'livingstone.edu' },
  { name: 'Johnson C. Smith University', location: 'Charlotte, NC', domain: 'jcsu.edu' },
  { name: 'Saint Augustine\'s University', location: 'Raleigh, NC', domain: 'st-aug.edu' },
  { name: 'Shaw University', location: 'Raleigh, NC', domain: 'shawu.edu' },
  { name: 'Elizabeth City State University', location: 'Elizabeth City, NC', domain: 'ecsu.edu' },
  { name: 'Fayetteville State University', location: 'Fayetteville, NC', domain: 'uncfsu.edu' },
  { name: 'Virginia University of Lynchburg', location: 'Lynchburg, VA', domain: 'vul.edu' },
  { name: 'Virginia Wesleyan University', location: 'Virginia Beach, VA', domain: 'vwu.edu' },
  { name: 'Bluefield State College', location: 'Bluefield, WV', domain: 'bluefieldstate.edu' },
  { name: 'West Virginia State University', location: 'Institute, WV', domain: 'wvstateu.edu' },
  { name: 'Wilberforce University', location: 'Wilberforce, OH', domain: 'wilberforce.edu' },
  { name: 'Central State University', location: 'Wilberforce, OH', domain: 'centralstate.edu' },
  { name: 'Kentucky State University', location: 'Frankfort, KY', domain: 'kysu.edu' },
  { name: 'Simmons College of Kentucky', location: 'Louisville, KY', domain: 'simmonscollegeky.edu' },
  { name: 'Lincoln University', location: 'Jefferson City, MO', domain: 'lincolnu.edu' },
  { name: 'Harris-Stowe State University', location: 'St. Louis, MO', domain: 'hssu.edu' },
  { name: 'Langston University', location: 'Langston, OK', domain: 'langston.edu' },
  { name: 'University of the District of Columbia', location: 'Washington, DC', domain: 'udc.edu' },
  
  // Service Academies
  { name: 'United States Military Academy', location: 'West Point, NY', domain: 'usma.edu' },
  { name: 'United States Naval Academy', location: 'Annapolis, MD', domain: 'usna.edu' },
  { name: 'United States Coast Guard Academy', location: 'New London, CT', domain: 'uscga.edu' },
  { name: 'United States Merchant Marine Academy', location: 'Kings Point, NY', domain: 'usmma.edu' },
  
  // Additional Notable Schools
  { name: 'Cooper Union', location: 'New York, NY', domain: 'cooper.edu' },
  { name: 'The New School', location: 'New York, NY', domain: 'newschool.edu' },
  { name: 'Juilliard School', location: 'New York, NY', domain: 'juilliard.edu' },
  { name: 'Berklee College of Music', location: 'Boston, MA', domain: 'berklee.edu' },
  { name: 'New England Conservatory', location: 'Boston, MA', domain: 'necmusic.edu' },
  { name: 'California Institute of the Arts', location: 'Valencia, CA', domain: 'calarts.edu' },
  { name: 'Art Center College of Design', location: 'Pasadena, CA', domain: 'artcenter.edu' },
  { name: 'Otis College of Art and Design', location: 'Los Angeles, CA', domain: 'otis.edu' },
  { name: 'Savannah College of Art and Design', location: 'Savannah, GA', domain: 'scad.edu' },
  { name: 'Ringling College of Art and Design', location: 'Sarasota, FL', domain: 'ringling.edu' },
  { name: 'Pratt Institute', location: 'Brooklyn, NY', domain: 'pratt.edu' },
  { name: 'School of the Art Institute of Chicago', location: 'Chicago, IL', domain: 'saic.edu' },
  { name: 'Maryland Institute College of Art', location: 'Baltimore, MD', domain: 'mica.edu' },
  { name: 'Massachusetts College of Art and Design', location: 'Boston, MA', domain: 'massart.edu' },
  { name: 'California College of the Arts', location: 'San Francisco, CA', domain: 'cca.edu' },
  { name: 'Minneapolis College of Art and Design', location: 'Minneapolis, MN', domain: 'mcad.edu' },
  { name: 'Kansas City Art Institute', location: 'Kansas City, MO', domain: 'kcai.edu' },
  { name: 'Cleveland Institute of Art', location: 'Cleveland, OH', domain: 'cia.edu' },
  { name: 'Columbus College of Art and Design', location: 'Columbus, OH', domain: 'ccad.edu' },
  { name: 'Fashion Institute of Technology', location: 'New York, NY', domain: 'fitnyc.edu' },
  { name: 'School of Visual Arts', location: 'New York, NY', domain: 'sva.edu' },
  { name: 'California Institute of Technology', location: 'Pasadena, CA', domain: 'caltech.edu' },
  { name: 'Stevens Institute of Technology', location: 'Hoboken, NJ', domain: 'stevens.edu' },
  { name: 'Colorado School of Mines', location: 'Golden, CO', domain: 'mines.edu' },
  { name: 'Missouri University of Science and Technology', location: 'Rolla, MO', domain: 'mst.edu' },
  { name: 'Michigan Technological University', location: 'Houghton, MI', domain: 'mtu.edu' },
  { name: 'South Dakota School of Mines and Technology', location: 'Rapid City, SD', domain: 'sdsmt.edu' },
  { name: 'Alfred University', location: 'Alfred, NY', domain: 'alfred.edu' },
  { name: 'New York Institute of Technology', location: 'Old Westbury, NY', domain: 'nyit.edu' },
  { name: 'Clarkson University', location: 'Potsdam, NY', domain: 'clarkson.edu' },
  { name: 'SUNY Polytechnic Institute', location: 'Utica, NY', domain: 'sunypoly.edu' },
  { name: 'Embry-Riddle Aeronautical University', location: 'Daytona Beach, FL', domain: 'erau.edu' },
  { name: 'Webb Institute', location: 'Glen Cove, NY', domain: 'webb.edu' },
  { name: 'Deep Springs College', location: 'Dyer, NV', domain: 'deepsprings.edu' },
  { name: 'St. John\'s College', location: 'Annapolis, MD', domain: 'sjc.edu' },
  { name: 'St. John\'s College', location: 'Santa Fe, NM', domain: 'sjc.edu' },
  { name: 'Thomas Aquinas College', location: 'Santa Paula, CA', domain: 'thomasaquinas.edu' },
  { name: 'Hillsdale College', location: 'Hillsdale, MI', domain: 'hillsdale.edu' },
  { name: 'Grove City College', location: 'Grove City, PA', domain: 'gcc.edu' },
  { name: 'Christendom College', location: 'Front Royal, VA', domain: 'christendom.edu' },
  { name: 'Magdalen College', location: 'Warner, NH', domain: 'magdalen.edu' },
  { name: 'Wyoming Catholic College', location: 'Lander, WY', domain: 'wyomingcatholic.edu' },
  { name: 'New Saint Andrews College', location: 'Moscow, ID', domain: 'nsa.edu' },
  { name: 'Patrick Henry College', location: 'Purcellville, VA', domain: 'phc.edu' },
  { name: 'Regent University', location: 'Virginia Beach, VA', domain: 'regent.edu' },
  { name: 'Liberty University', location: 'Lynchburg, VA', domain: 'liberty.edu' },
  { name: 'Bob Jones University', location: 'Greenville, SC', domain: 'bju.edu' },
  { name: 'Cedarville University', location: 'Cedarville, OH', domain: 'cedarville.edu' },
  { name: 'Dordt University', location: 'Sioux Center, IA', domain: 'dordt.edu' },
  { name: 'Northwestern College', location: 'Orange City, IA', domain: 'nwciowa.edu' },
  { name: 'Bethel University', location: 'St. Paul, MN', domain: 'bethel.edu' },
  { name: 'Crown College', location: 'St. Bonifacius, MN', domain: 'crown.edu' },
  { name: 'Concordia University', location: 'St. Paul, MN', domain: 'csp.edu' },
  { name: 'Gustavus Adolphus College', location: 'St. Peter, MN', domain: 'gustavus.edu' },
  { name: 'Augsburg University', location: 'Minneapolis, MN', domain: 'augsburg.edu' },
  { name: 'Hamline University', location: 'St. Paul, MN', domain: 'hamline.edu' },
  { name: 'University of St. Thomas', location: 'St. Paul, MN', domain: 'stthomas.edu' },
  { name: 'College of St. Benedict', location: 'St. Joseph, MN', domain: 'csbsju.edu' },
  { name: 'St. John\'s University', location: 'Collegeville, MN', domain: 'csbsju.edu' },
  { name: 'Concordia College', location: 'Moorhead, MN', domain: 'concordiacollege.edu' },
  { name: 'University of Jamestown', location: 'Jamestown, ND', domain: 'uj.edu' },
  { name: 'Valley City State University', location: 'Valley City, ND', domain: 'vcsu.edu' },
  { name: 'Mayville State University', location: 'Mayville, ND', domain: 'mayvillestate.edu' },
  { name: 'Dickinson State University', location: 'Dickinson, ND', domain: 'dickinsonstate.edu' },
  { name: 'Minot State University', location: 'Minot, ND', domain: 'minotstateu.edu' },
  { name: 'University of Mary', location: 'Bismarck, ND', domain: 'umary.edu' },
  { name: 'Trinity Bible College', location: 'Ellendale, ND', domain: 'trinitybiblecollege.edu' },
  { name: 'Sitting Bull College', location: 'Fort Yates, ND', domain: 'sittingbull.edu' },
  { name: 'Turtle Mountain Community College', location: 'Belcourt, ND', domain: 'tm.edu' },
  { name: 'United Tribes Technical College', location: 'Bismarck, ND', domain: 'uttc.edu' },
  { name: 'Cankdeska Cikana Community College', location: 'Fort Totten, ND', domain: 'littlehoop.edu' },
  { name: 'Nueta Hidatsa Sahnish College', location: 'New Town, ND', domain: 'nhsc.edu' },
  { name: 'Dakota College at Bottineau', location: 'Bottineau, ND', domain: 'dakotacollege.edu' },
  { name: 'Lake Region State College', location: 'Devils Lake, ND', domain: 'lrsc.edu' },
  { name: 'Williston State College', location: 'Williston, ND', domain: 'willistonstate.edu' },
  { name: 'Bismarck State College', location: 'Bismarck, ND', domain: 'bismarckstate.edu' },
  { name: 'North Dakota State College of Science', location: 'Wahpeton, ND', domain: 'ndscs.edu' },
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
