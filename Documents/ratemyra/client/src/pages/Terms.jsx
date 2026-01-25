import React from 'react';
import './Terms.css';

function Terms() {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="content-card">
          <h1>Terms & Conditions</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using RateMyRA ("the Service," "we," "our," or "us"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
            <p>These Terms & Conditions apply to all users of the Service, including visitors, content contributors, and account holders.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>RateMyRA is an online platform that allows students to:</p>
            <ul>
              <li>Search for and view information about Resident Assistants (RAs)</li>
              <li>Submit reviews and ratings of RAs</li>
              <li>Add new RA profiles to the database</li>
              <li>Vote on the helpfulness of reviews</li>
              <li>Share reviews via links or images</li>
              <li>Access administrative features (for authorized administrators only)</li>
            </ul>
            <p>All features are available without creating an account. Account creation is not available to the general public. Administrative accounts are restricted to authorized administrators only.</p>
          </section>

          <section>
            <h2>3. Use License</h2>
            <p>Permission is granted to temporarily access the materials on RateMyRA for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any software contained on RateMyRA</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Use automated systems, bots, or scrapers to access or collect data from the Service</li>
            </ul>
            <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by RateMyRA at any time.</p>
          </section>

          <section>
            <h2>4. User Accounts</h2>
            <p>Account creation is not available to the general public. All features of RateMyRA are accessible without creating an account, and all user interactions are anonymous by default.</p>
            <p>Administrative accounts are restricted to authorized administrators only. If you are an authorized administrator, you are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring your account information remains current and accurate</li>
            </ul>
            <p>You may not share your account credentials with others or use another person's account. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2>5. User Content</h2>
            <p>You retain ownership of any content you submit, post, or display on or through the Service ("User Content"), including reviews, ratings, RA profiles, and comments. By submitting User Content, you grant RateMyRA a worldwide, non-exclusive, royalty-free, perpetual, irrevocable license to use, reproduce, modify, adapt, publish, translate, distribute, and display your User Content for the purpose of operating and providing the Service.</p>
            <p>You represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights, licenses, and permissions to the User Content</li>
              <li>Your User Content does not violate any third-party rights, including intellectual property, privacy, or publicity rights</li>
              <li>Your User Content complies with our Site Guidelines and all applicable laws</li>
              <li>Your User Content is truthful and based on your personal experiences</li>
              <li>You have not been compensated or provided with any incentive to post User Content</li>
            </ul>
            <p>You understand that User Content you submit may be publicly visible and may be shared, linked to, or downloaded by other users.</p>
          </section>

          <section>
            <h2>6. Prohibited Uses</h2>
            <p>You may not use the Service:</p>
            <ul>
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To transmit any malicious code, viruses, Trojan horses, or harmful data</li>
              <li>To impersonate or attempt to impersonate another person, entity, or RA</li>
              <li>To engage in any automated use of the system, including using bots, scrapers, or scripts</li>
              <li>To interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>To harass, abuse, harm, or defame other users, RAs, or any third party</li>
              <li>To submit false, misleading, or defamatory information</li>
              <li>To circumvent rate limits, security measures, or content filters</li>
              <li>To collect or harvest information about other users without their consent</li>
            </ul>
          </section>

          <section>
            <h2>7. Content Moderation and Removal</h2>
            <p>RateMyRA reserves the right to review, edit, flag, hide, or remove any content at any time for any reason, including but not limited to content that:</p>
            <ul>
              <li>Violates these Terms or our Site Guidelines</li>
              <li>Contains profanity, harassment, or discriminatory content</li>
              <li>Is false, misleading, or defamatory</li>
              <li>Infringes on intellectual property or other rights</li>
              <li>Is spam, advertising, or off-topic</li>
              <li>Otherwise violates applicable laws or regulations</li>
            </ul>
            <p>We are not obligated to monitor content but may do so at our discretion. We use automated content filtering systems to detect and prevent prohibited content. Content may be removed without notice, and we are not required to provide explanations for content removal.</p>
            <p>If you believe your content was incorrectly removed, you may contact our support team to request review.</p>
          </section>

          <section>
            <h2>8. Rate Limiting and Abuse Prevention</h2>
            <p>To ensure fair use and prevent abuse, RateMyRA implements rate limiting and abuse prevention measures:</p>
            <ul>
              <li>RA submissions are limited to 10 per hour per IP address</li>
              <li>Review submissions are limited to 5 per hour per IP address</li>
              <li>One review per RA per device/IP combination within 24 hours</li>
              <li>Daily review limit of 20 reviews per device</li>
              <li>We use IP hashing, device fingerprinting, and other technical measures to prevent abuse</li>
            </ul>
            <p>Attempts to circumvent these limits may result in temporary or permanent blocking of your IP address or device.</p>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by RateMyRA and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <p>You may not use our trademarks, logos, or other proprietary information without our prior written consent. You may not remove, alter, or obscure any copyright, trademark, or other proprietary rights notices.</p>
          </section>

          <section>
            <h2>10. Disclaimer of Warranties</h2>
            <p>The materials on RateMyRA are provided on an 'as is' and 'as available' basis. RateMyRA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation:</p>
            <ul>
              <li>Implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights</li>
              <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of any content on the Service</li>
              <li>Warranties that defects will be corrected</li>
            </ul>
            <p>Some jurisdictions do not allow the exclusion of implied warranties, so the above exclusion may not apply to you.</p>
          </section>

          <section>
            <h2>11. Limitation of Liability</h2>
            <p>In no event shall RateMyRA, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:</p>
            <ul>
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from your use or inability to use the Service</li>
              <li>Damages resulting from any conduct or content of third parties on the Service</li>
              <li>Damages resulting from unauthorized access to or use of our servers and/or any personal information stored therein</li>
            </ul>
            <p>This limitation of liability applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if RateMyRA has been advised of the possibility of such damage.</p>
            <p>Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation or exclusion may not apply to you.</p>
          </section>

          <section>
            <h2>12. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless RateMyRA and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:</p>
            <ul>
              <li>Your use and access of the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third party right, including without limitation any copyright, property, or privacy right</li>
              <li>Any claim that your User Content caused damage to a third party</li>
            </ul>
          </section>

          <section>
            <h2>13. Accuracy of Materials</h2>
            <p>The materials appearing on RateMyRA could include technical, typographical, or photographic errors. RateMyRA does not warrant that any of the materials on its website are accurate, complete, or current. RateMyRA may make changes to the materials contained on its website at any time without notice. However, RateMyRA does not make any commitment to update the materials.</p>
            <p>RateMyRA does not verify the accuracy of user-submitted content, including reviews and RA information. Users are responsible for the accuracy of content they submit.</p>
          </section>

          <section>
            <h2>14. Links to Third-Party Websites</h2>
            <p>The Service may contain links to third-party websites or services that are not owned or controlled by RateMyRA. RateMyRA has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
            <p>You acknowledge and agree that RateMyRA shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods, or services available on or through any such websites or services.</p>
          </section>

          <section>
            <h2>15. Termination</h2>
            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
            <p>If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.</p>
            <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
          </section>

          <section>
            <h2>16. Modifications to Terms</h2>
            <p>RateMyRA may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service. We will update the "Last Updated" date at the top of this page when changes are made.</p>
            <p>Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If you do not agree to any of these terms or any future Terms, do not use or access (or continue to access) the Service.</p>
          </section>

          <section>
            <h2>17. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. You irrevocably submit to the exclusive jurisdiction of the courts in the United States for any disputes arising out of or relating to these Terms or the Service.</p>
            <p>If you are accessing the Service from outside the United States, you are responsible for compliance with local laws in your jurisdiction.</p>
          </section>

          <section>
            <h2>18. Severability</h2>
            <p>If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>
          </section>

          <section>
            <h2>19. Contact Information</h2>
            <p>If you have any questions about these Terms & Conditions, please contact our support team through the Help page or via email.</p>
            <p>You can also follow us on Instagram: <a href="https://www.instagram.com/ratemyra/" target="_blank" rel="noopener noreferrer">@ratemyra</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
