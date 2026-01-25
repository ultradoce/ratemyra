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
            <p>RateMyRA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, "the Service").</p>
            <p>Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use the Service.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <p>We collect information that you voluntarily provide when using the Service:</p>
            <ul>
              <li><strong>Account Information (Optional):</strong> If you choose to create an account, we collect your email address and a hashed password. Account creation is optional and most features are available without an account.</li>
              <li><strong>Review Content:</strong> Reviews, ratings, tags, semesters, and any text you submit in reviews</li>
              <li><strong>RA Information:</strong> Names, schools, dorm/hall information, and floor details when you add RAs to the database</li>
              <li><strong>Help Messages:</strong> If you contact our support team, we collect your name, email, subject, and message content</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you use the Service:</p>
            <ul>
              <li><strong>IP Address:</strong> We collect and hash your IP address for abuse prevention and security purposes. We do not store your actual IP address.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, screen resolution, and other technical information</li>
              <li><strong>Device Fingerprint:</strong> We create a hashed device fingerprint based on browser characteristics, screen properties, timezone, and other non-personally identifiable device attributes for abuse prevention</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, and interaction patterns</li>
              <li><strong>Location Data:</strong> We may collect approximate location information (state/country) based on your IP address for analytics purposes. This is aggregated and anonymized.</li>
              <li><strong>Referrer Information:</strong> The website or page that referred you to our Service</li>
              <li><strong>User Agent:</strong> Information about your browser and device</li>
            </ul>

            <h3>2.3 Cookies and Tracking Technologies</h3>
            <p>We use cookies and similar tracking technologies to:</p>
            <ul>
              <li>Maintain your session and authentication state (if you have an account)</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage and performance</li>
              <li>Prevent abuse and fraud</li>
            </ul>
            <p>You can control cookies through your browser settings, though disabling cookies may affect site functionality.</p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our services, including displaying reviews, managing RA profiles, and enabling search functionality</li>
              <li><strong>Content Processing:</strong> To process, display, and moderate your reviews and ratings</li>
              <li><strong>Authentication:</strong> To authenticate users and manage accounts (for users who choose to create accounts)</li>
              <li><strong>Abuse Prevention:</strong> To detect and prevent fraud, spam, abuse, and other prohibited activities using IP hashing, device fingerprinting, and rate limiting</li>
              <li><strong>Content Moderation:</strong> To automatically filter profanity and inappropriate content, and to flag content for manual review</li>
              <li><strong>Analytics:</strong> To analyze usage patterns, track page views, understand user behavior, and generate aggregated statistics (e.g., views by state)</li>
              <li><strong>Communication:</strong> To respond to your inquiries, provide customer support, and send administrative messages</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations, respond to legal requests, and protect our rights and the rights of others</li>
              <li><strong>Security:</strong> To protect the security and integrity of the Service</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            
            <h3>4.1 Public Content</h3>
            <p>Reviews, ratings, and RA profiles you submit are publicly visible on the Service. This includes:</p>
            <ul>
              <li>Review text, ratings, tags, and semesters</li>
              <li>RA names, schools, dorm/hall information</li>
              <li>Review sharing links and downloadable images</li>
            </ul>
            <p>Please be aware that any information you include in publicly visible content can be viewed, shared, and downloaded by others.</p>

            <h3>4.2 Service Providers</h3>
            <p>We may share information with third-party service providers who perform services on our behalf, including:</p>
            <ul>
              <li>Hosting and cloud infrastructure providers</li>
              <li>Analytics services (aggregated, anonymized data only)</li>
              <li>Email service providers (for support communications)</li>
            </ul>
            <p>These service providers are contractually obligated to protect your information and use it only for the purposes we specify.</p>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>

            <h3>4.4 Business Transfers</h3>
            <p>In connection with any merger, acquisition, reorganization, sale of assets, or bankruptcy, your information may be transferred to the acquiring entity.</p>

            <h3>4.5 Protection of Rights</h3>
            <p>We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
            <ul>
              <li><strong>Encryption:</strong> Passwords are hashed using bcrypt. We hash IP addresses and device fingerprints rather than storing them in plain text</li>
              <li><strong>Secure Connections:</strong> All data transmission uses HTTPS/TLS encryption</li>
              <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
              <li><strong>Regular Security Assessments:</strong> We regularly review and update our security practices</li>
              <li><strong>Rate Limiting:</strong> We implement rate limits to prevent abuse and protect against automated attacks</li>
            </ul>
            <p>However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> You can request correction of inaccurate information (for account holders, you can edit your reviews directly)</li>
              <li><strong>Deletion:</strong> You can request deletion of your account and associated personal information</li>
              <li><strong>Opt-Out:</strong> You can opt out of certain data collection where technically feasible (e.g., disabling cookies)</li>
              <li><strong>Review Editing:</strong> If you created an account, you can edit or delete your reviews through your account</li>
            </ul>
            <p>To exercise these rights, please contact our support team. We will respond to your request within a reasonable timeframe.</p>
            <p><strong>Note:</strong> If you submitted content without an account, we may not be able to identify or delete your specific content, as it is associated with hashed identifiers rather than personal information.</p>
          </section>

          <section>
            <h2>7. Anonymous Use</h2>
            <p>Most features of RateMyRA are available without creating an account. When you use the Service anonymously:</p>
            <ul>
              <li>We do not collect your email address or other directly identifying information</li>
              <li>We use hashed IP addresses and device fingerprints to prevent abuse, but these cannot be used to identify you personally</li>
              <li>Your reviews are posted anonymously</li>
              <li>You can vote on review helpfulness anonymously</li>
            </ul>
            <p>If you choose to create an account, you gain the ability to edit your reviews, but your reviews remain publicly visible and anonymous to other users.</p>
          </section>

          <section>
            <h2>8. Content Filtering and Moderation</h2>
            <p>We use automated systems to filter and moderate content:</p>
            <ul>
              <li><strong>Profanity Filtering:</strong> We automatically detect and prevent submission of reviews containing profanity, including attempts to circumvent filters</li>
              <li><strong>Abuse Detection:</strong> We use similarity detection to identify duplicate or suspicious reviews</li>
              <li><strong>Rate Limiting:</strong> We limit the number of submissions per IP/device to prevent spam</li>
            </ul>
            <p>These automated systems may process your content to determine if it violates our guidelines. Content that is flagged may be reviewed by administrators.</p>
          </section>

          <section>
            <h2>9. Analytics and Tracking</h2>
            <p>We collect analytics data to understand how the Service is used:</p>
            <ul>
              <li><strong>Page Views:</strong> We track which pages are viewed, including RA profiles, reviews, and search results</li>
              <li><strong>Location Data:</strong> We collect approximate location (state/country) based on IP address for analytics. This is aggregated and anonymized</li>
              <li><strong>Usage Patterns:</strong> We analyze how users interact with the Service to improve functionality</li>
            </ul>
            <p>This analytics data is aggregated and does not identify individual users. We may use third-party analytics services that process this aggregated data.</p>
          </section>

          <section>
            <h2>10. Third-Party Links</h2>
            <p>Our Service may contain links to third-party websites (e.g., Instagram). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any information.</p>
            <p>This Privacy Policy applies only to information collected by RateMyRA. We have no control over and assume no responsibility for the privacy policies or practices of third-party websites.</p>
          </section>

          <section>
            <h2>11. Children's Privacy</h2>
            <p>RateMyRA is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
            <p>If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information from our servers.</p>
          </section>

          <section>
            <h2>12. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to:</p>
            <ul>
              <li>Provide the Service to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Maintain the integrity of our database and prevent abuse</li>
            </ul>
            <p>When you delete your account, we will delete or anonymize your personal information (email, account credentials) within a reasonable timeframe. However:</p>
            <ul>
              <li>Publicly visible content (reviews, RA profiles) may remain on the Service as it is part of the public database</li>
              <li>We may retain certain information as required by law or for legitimate business purposes (e.g., preventing abuse)</li>
              <li>Hashed IP addresses and device fingerprints used for abuse prevention may be retained to maintain security</li>
            </ul>
          </section>

          <section>
            <h2>13. International Users</h2>
            <p>If you are accessing RateMyRA from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using our Service, you consent to this transfer.</p>
            <p>If you are located in the European Economic Area (EEA), United Kingdom, or other jurisdictions with data protection laws, you have certain rights under those laws. Please contact us to exercise those rights.</p>
          </section>

          <section>
            <h2>14. California Privacy Rights</h2>
            <p>If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA), including:</p>
            <ul>
              <li>The right to know what personal information we collect, use, and disclose</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p>To exercise these rights, please contact our support team.</p>
          </section>

          <section>
            <h2>15. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:</p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date at the top of this page</li>
              <li>For significant changes, we may provide additional notice (e.g., via email if you have an account)</li>
            </ul>
            <p>You are advised to review this Privacy Policy periodically for any changes. Your continued use of the Service after changes become effective constitutes your acceptance of the updated Privacy Policy.</p>
          </section>

          <section>
            <h2>16. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our support team through the Help page or via email.</p>
            <p>You can also follow us on Instagram: <a href="https://www.instagram.com/ratemyra/" target="_blank" rel="noopener noreferrer">@ratemyra</a></p>
            <p>We will respond to your inquiry within a reasonable timeframe.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
