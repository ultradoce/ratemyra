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
            <p>By accessing and using RateMyRA ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily access the materials on RateMyRA for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on RateMyRA</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>To access certain features of the Service, you may be required to create an account. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2>4. User Content</h2>
            <p>You retain ownership of any content you submit, post, or display on or through the Service ("User Content"). By submitting User Content, you grant RateMyRA a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content for the purpose of operating and providing the Service.</p>
            <p>You represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights to the User Content</li>
              <li>Your User Content does not violate any third-party rights</li>
              <li>Your User Content complies with our Site Guidelines</li>
            </ul>
          </section>

          <section>
            <h2>5. Prohibited Uses</h2>
            <p>You may not use the Service:</p>
            <ul>
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any malicious code, viruses, or harmful data</li>
              <li>To impersonate or attempt to impersonate another person or entity</li>
              <li>To engage in any automated use of the system</li>
              <li>To interfere with or disrupt the Service or servers</li>
              <li>To harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2>6. Content Moderation</h2>
            <p>RateMyRA reserves the right to review, edit, or remove any content at any time for any reason, including but not limited to content that violates these Terms or our Site Guidelines. We are not obligated to monitor content but may do so at our discretion.</p>
          </section>

          <section>
            <h2>7. Disclaimer</h2>
            <p>The materials on RateMyRA are provided on an 'as is' basis. RateMyRA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2>8. Limitations</h2>
            <p>In no event shall RateMyRA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RateMyRA, even if RateMyRA or a RateMyRA authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2>9. Accuracy of Materials</h2>
            <p>The materials appearing on RateMyRA could include technical, typographical, or photographic errors. RateMyRA does not warrant that any of the materials on its website are accurate, complete, or current. RateMyRA may make changes to the materials contained on its website at any time without notice.</p>
          </section>

          <section>
            <h2>10. Modifications</h2>
            <p>RateMyRA may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>

          <section>
            <h2>11. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>If you have any questions about these Terms & Conditions, please contact us through the admin portal.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
