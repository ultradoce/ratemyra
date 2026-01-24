import React from 'react';
import './Guidelines.css';

function Guidelines() {
  return (
    <div className="guidelines-page">
      <div className="container">
        <div className="content-card">
          <h1>Site Guidelines</h1>
          
          <section>
            <h2>Community Standards</h2>
            <p>RateMyRA is a platform for students to share honest, constructive feedback about Resident Assistants. To maintain a respectful and helpful community, please follow these guidelines:</p>
          </section>

          <section>
            <h2>Review Guidelines</h2>
            
            <h3>Do:</h3>
            <ul>
              <li>Be honest and specific about your experiences</li>
              <li>Focus on the RA's performance, helpfulness, and professionalism</li>
              <li>Provide constructive feedback that could help future students</li>
              <li>Respect privacy and avoid sharing personal information</li>
              <li>Use appropriate language and maintain a respectful tone</li>
              <li>Base your review on actual interactions with the RA</li>
            </ul>

            <h3>Don't:</h3>
            <ul>
              <li>Post false, misleading, or defamatory information</li>
              <li>Include personal attacks, harassment, or discriminatory content</li>
              <li>Share private information about yourself or others</li>
              <li>Post spam, advertisements, or off-topic content</li>
              <li>Submit multiple reviews for the same RA from the same account</li>
              <li>Use profanity or inappropriate language</li>
            </ul>
          </section>

          <section>
            <h2>Content Moderation</h2>
            <p>All reviews are subject to moderation. Reviews that violate these guidelines may be removed without notice. Repeated violations may result in account suspension or termination.</p>
          </section>

          <section>
            <h2>Adding RAs</h2>
            <p>When adding a new RA to the database:</p>
            <ul>
              <li>Ensure the RA actually exists at the specified school</li>
              <li>Provide accurate information (name, dorm/hall if known)</li>
              <li>Do not add duplicate entries for the same RA</li>
              <li>Only add RAs you have personal knowledge of</li>
            </ul>
          </section>

          <section>
            <h2>Privacy & Safety</h2>
            <ul>
              <li>Do not share personal contact information in reviews</li>
              <li>Respect the privacy of RAs and other students</li>
              <li>Report any content that appears to violate these guidelines</li>
              <li>If you see inappropriate content, contact an administrator</li>
            </ul>
          </section>

          <section>
            <h2>Consequences of Violations</h2>
            <p>Violations of these guidelines may result in:</p>
            <ul>
              <li>Removal of the violating content</li>
              <li>Temporary or permanent account suspension</li>
              <li>Legal action in cases of defamation or harassment</li>
            </ul>
          </section>

          <section>
            <h2>Questions?</h2>
            <p>If you have questions about these guidelines or need to report a violation, please contact our support team.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;
