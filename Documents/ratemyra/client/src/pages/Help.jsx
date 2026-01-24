import React from 'react';
import './Help.css';

function Help() {
  return (
    <div className="help-page">
      <div className="container">
        <div className="content-card">
          <h1>Help & Support</h1>
          
          <section>
            <h2>Getting Started</h2>
            <p>Welcome to RateMyRA! Here's how to get started:</p>
            <ol>
              <li><strong>Search for a School:</strong> Start by selecting your college or university from the search box on the homepage.</li>
              <li><strong>Look Up an RA:</strong> Once you've selected a school, search for your Resident Assistant by name.</li>
              <li><strong>Read Reviews:</strong> View honest ratings and reviews from other students who have had the same RA.</li>
              <li><strong>Add an RA:</strong> If your RA isn't listed yet, you can add their profile to the database.</li>
              <li><strong>Write a Review:</strong> Share your honest feedback by writing a review about your experience with the RA.</li>
            </ol>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I look up an RA?</h3>
              <p>First, select your school from the dropdown. Then, type your RA's name in the search box. You can search by first name, last name, or both.</p>
            </div>

            <div className="faq-item">
              <h3>Can I add an RA that's not listed?</h3>
              <p>Yes! Click on "Add RA" in the navigation menu, select your school, and fill in the RA's information.</p>
            </div>

            <div className="faq-item">
              <h3>How do I write a review?</h3>
              <p>Navigate to an RA's profile page and click "Write a Review". You'll need to be logged in to submit a review.</p>
            </div>

            <div className="faq-item">
              <h3>What should I include in my review?</h3>
              <p>Be honest and constructive. Include information about the RA's helpfulness, approachability, responsiveness, and overall experience. Avoid personal attacks or inappropriate content.</p>
            </div>

            <div className="faq-item">
              <h3>Can I edit or delete my review?</h3>
              <p>Currently, reviews cannot be edited or deleted after submission. Please review your content carefully before submitting.</p>
            </div>

            <div className="faq-item">
              <h3>How are ratings calculated?</h3>
              <p>Ratings are calculated as the average of all submitted reviews for that RA. Each review includes ratings for helpfulness, approachability, and overall experience.</p>
            </div>
          </section>

          <section>
            <h2>Contact Support</h2>
            <p>If you need additional help or have questions not covered here, please refer to our <a href="/guidelines">Site Guidelines</a> or contact our support team.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Help;
