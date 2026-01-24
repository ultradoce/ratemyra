import React from 'react';
import './Privacy.css';

function Privacy() {
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="content-card">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>1. Introduction</h2>
            <p>RateMyRA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, password (hashed), and role (user/admin)</li>
              <li><strong>Content:</strong> Reviews, ratings, and comments you submit</li>
              <li><strong>RA Information:</strong> Names and details of Resident Assistants you add</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>IP address and browser information</li>
              <li>Usage data and interaction patterns</li>
              <li>Device information and operating system</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and display your reviews and ratings</li>
              <li>Authenticate users and manage accounts</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Public Content:</strong> Reviews and ratings you submit are publicly visible</li>
              <li><strong>Service Providers:</strong> With third-party services that help us operate (hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
            <ul>
              <li>Encryption of passwords using bcrypt</li>
              <li>Secure HTTPS connections</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of certain data collection (where applicable)</li>
            </ul>
            <p>To exercise these rights, please contact us through the admin portal.</p>
          </section>

          <section>
            <h2>7. Cookies and Tracking</h2>
            <p>We may use cookies and similar tracking technologies to:</p>
            <ul>
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage and performance</li>
            </ul>
            <p>You can control cookies through your browser settings, though this may affect site functionality.</p>
          </section>

          <section>
            <h2>8. Third-Party Links</h2>
            <p>Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>RateMyRA is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </section>

          <section>
            <h2>10. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it by law.</p>
          </section>

          <section>
            <h2>11. International Users</h2>
            <p>If you are accessing RateMyRA from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using our Service, you consent to this transfer.</p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically.</p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us through the admin portal.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
