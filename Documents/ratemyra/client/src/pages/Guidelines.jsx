import React from 'react';
import './Guidelines.css';

function Guidelines() {
  return (
    <div className="guidelines-page">
      <div className="container">
        <div className="content-card">
          <h1>Site Guidelines</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>Community Standards</h2>
            <p>RateMyRA is a platform for students to share honest, constructive feedback about Resident Assistants (RAs). Our goal is to create a helpful, respectful community where students can make informed decisions. To maintain the integrity and usefulness of our platform, please follow these guidelines.</p>
          </section>

          <section>
            <h2>Review Guidelines</h2>
            <p>When writing reviews, your feedback should be honest, constructive, and based on your personal experiences. All reviews are subject to automated content filtering and manual moderation.</p>
            
            <h3>Do:</h3>
            <ul>
              <li><strong>Be honest and specific:</strong> Share your genuine experiences with concrete examples</li>
              <li><strong>Focus on performance:</strong> Evaluate the RA's helpfulness, clarity, professionalism, and overall quality</li>
              <li><strong>Provide constructive feedback:</strong> Help future students understand what to expect</li>
              <li><strong>Use appropriate language:</strong> Maintain a respectful, professional tone</li>
              <li><strong>Base reviews on actual interactions:</strong> Only review RAs you have personally worked with</li>
              <li><strong>Be accurate:</strong> Select the correct semesters and provide accurate information</li>
              <li><strong>Respect privacy:</strong> Avoid sharing personal contact information or private details</li>
            </ul>

            <h3>Don't:</h3>
            <ul>
              <li><strong>Use profanity or inappropriate language:</strong> Our automated filters will flag and prevent submission of reviews containing profanity, including attempts to circumvent filters (e.g., using numbers or symbols to replace letters)</li>
              <li><strong>Post false or defamatory information:</strong> Reviews must be truthful and based on real experiences</li>
              <li><strong>Include personal attacks or harassment:</strong> Focus on behavior and performance, not personal characteristics</li>
              <li><strong>Share private information:</strong> Do not include personal contact information, addresses, or other private details about yourself or others</li>
              <li><strong>Post spam or advertisements:</strong> Keep content relevant to RA reviews</li>
              <li><strong>Submit duplicate reviews:</strong> Our system prevents multiple reviews from the same device/IP for the same RA within a 24-hour period</li>
              <li><strong>Engage in discriminatory behavior:</strong> Reviews must not contain discriminatory content based on race, gender, religion, sexual orientation, or other protected characteristics</li>
            </ul>
          </section>

          <section>
            <h2>Adding RAs to the Database</h2>
            <p>When adding a new RA profile, please ensure:</p>
            <ul>
              <li><strong>Accuracy:</strong> The RA actually exists at the specified school</li>
              <li><strong>Completeness:</strong> Provide accurate information including first name, last name, and school</li>
              <li><strong>No duplicates:</strong> Check that the RA doesn't already exist before adding</li>
              <li><strong>Personal knowledge:</strong> Only add RAs you have personal knowledge of</li>
              <li><strong>Proper formatting:</strong> Use proper capitalization (first letter of each name capitalized)</li>
            </ul>
            <p>Our system automatically checks for potential duplicates and will alert you if a similar RA profile already exists.</p>
          </section>

          <section>
            <h2>Helpfulness Voting</h2>
            <p>You can vote on whether reviews are helpful or not helpful. This feature is available to all users, including those without accounts. Please use this feature responsibly:</p>
            <ul>
              <li>Vote based on whether the review provides useful, accurate information</li>
              <li>Do not manipulate voting systems or engage in coordinated voting</li>
              <li>Each device can vote once per review</li>
            </ul>
          </section>

          <section>
            <h2>Review Sharing</h2>
            <p>Reviews can be shared via link or downloaded as an image. When sharing reviews:</p>
            <ul>
              <li>Share responsibly and in appropriate contexts</li>
              <li>Do not use shared reviews to harass or defame RAs</li>
              <li>Respect the privacy of all parties involved</li>
            </ul>
          </section>

          <section>
            <h2>Content Moderation</h2>
            <p>All content submitted to RateMyRA is subject to automated filtering and manual moderation:</p>
            <ul>
              <li><strong>Automated filtering:</strong> Our system automatically detects and prevents profanity, spam, and other prohibited content</li>
              <li><strong>Manual review:</strong> Content may be reviewed by administrators</li>
              <li><strong>Abuse prevention:</strong> We use rate limiting and device fingerprinting to prevent spam and abuse</li>
              <li><strong>Removal policy:</strong> Content that violates these guidelines may be removed without notice</li>
              <li><strong>Appeals:</strong> If you believe your content was incorrectly removed, contact our support team</li>
            </ul>
          </section>

          <section>
            <h2>Account Requirements</h2>
            <p>RateMyRA is designed to be fully accessible without creating an account:</p>
            <ul>
              <li>You can browse reviews, search for RAs, and vote on helpfulness anonymously</li>
              <li>You can submit reviews without an account</li>
              <li>You can add RAs to the database without an account</li>
              <li>All features are available to anonymous users</li>
              <li>Account creation is not available to the general public</li>
              <li>Administrative accounts are restricted to authorized administrators only</li>
            </ul>
            <p>All user interactions on RateMyRA are anonymous by default. Your reviews and contributions are not linked to any personal account or email address.</p>
          </section>

          <section>
            <h2>Privacy & Safety</h2>
            <ul>
              <li><strong>Protect personal information:</strong> Do not share personal contact information, addresses, or other private details in reviews</li>
              <li><strong>Respect privacy:</strong> Respect the privacy of RAs and other students</li>
              <li><strong>Report violations:</strong> If you see content that violates these guidelines, report it to our support team</li>
              <li><strong>Anonymous reviews:</strong> Reviews are posted anonymously by default to protect your privacy</li>
            </ul>
          </section>

          <section>
            <h2>Rate Limiting and Abuse Prevention</h2>
            <p>To ensure fair use and prevent abuse, RateMyRA implements the following limits:</p>
            <ul>
              <li>RA submissions: Limited to 10 per hour per IP address</li>
              <li>Review submissions: Limited to 5 per hour per IP address</li>
              <li>One review per RA per device within 24 hours</li>
              <li>Daily review limit: 20 reviews per device per day</li>
            </ul>
            <p>These limits help maintain platform quality and prevent spam. If you need to submit more content, please contact our support team.</p>
          </section>

          <section>
            <h2>Consequences of Violations</h2>
            <p>Violations of these guidelines may result in:</p>
            <ul>
              <li><strong>Content removal:</strong> Immediate removal of violating content</li>
              <li><strong>Account suspension:</strong> Temporary or permanent suspension of user accounts</li>
              <li><strong>IP blocking:</strong> Blocking of IP addresses engaged in abuse</li>
              <li><strong>Legal action:</strong> In cases of defamation, harassment, or other illegal activity, we may pursue legal remedies</li>
            </ul>
            <p>We reserve the right to take any action necessary to protect the integrity of our platform and community.</p>
          </section>

          <section>
            <h2>Questions or Concerns?</h2>
            <p>If you have questions about these guidelines, need to report a violation, or believe your content was incorrectly moderated, please contact our support team through the Help page or email us directly.</p>
            <p>We are committed to maintaining a fair, respectful, and helpful community for all users.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;
