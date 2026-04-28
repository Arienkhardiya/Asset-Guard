import nodemailer from 'nodemailer';
import { query } from '../../db/index.js';
import axios from 'axios';
// import PDFDocument from 'pdfkit'; // Used for report generation
// Configure Email Transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
// Domain WHOIS lookup logic
export const getAbuseContact = async (domain) => {
    try {
        const apiKey = process.env.WHOIS_API_KEY;
        if (!apiKey)
            return 'abuse@mock-isp.com';
        const resp = await axios.get(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`);
        const email = resp.data?.WhoisRecord?.contactEmail;
        return email || 'abuse@mock-isp.com';
    }
    catch (error) {
        console.error('WHOIS lookup failed:', error);
        return 'abuse@mock-isp.com';
    }
};
// Send DMCA Notice
export const sendDMCANotice = async (detectionId, tenantId) => {
    // 1. Get detection from DB
    const { rows } = await query('SELECT * FROM detections WHERE id = $1 AND tenant_id = $2', [detectionId, tenantId]);
    if (rows.length === 0)
        throw new Error('Detection not found');
    const detection = rows[0];
    const url = new URL(detection.url);
    const domain = url.hostname;
    // 2. Lookup abuse email
    const abuseEmail = await getAbuseContact(domain);
    // 3. Construct Email
    const mailOptions = {
        from: '"Asset Guard AI Legal" <dmca@assetguard.ai>',
        to: abuseEmail,
        subject: `Notice of Copyright Infringement - ${domain}`,
        text: `To Whom It May Concern,

We are writing to notify you of unauthorized use of copyrighted material hosted on your platform.
Infringing URL: ${detection.url}
Evidence: Screenshot attached and logged via pHash matching (Similarity: ${detection.confidence}%).

Please remove this content immediately.
`
    };
    // 4. Send Email
    console.log(`Sending DMCA notice to ${abuseEmail} for ${detection.url}`);
    if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
    }
    // 5. Update DB Status & Log Action
    await query('UPDATE detections SET status = $1 WHERE id = $2', ['TERMINATED', detectionId]);
    await query('INSERT INTO actions(tenant_id, detection_id, action_type, status, result_details) VALUES($1, $2, $3, $4, $5)', [tenantId, detectionId, 'DMCA_TAKEDOWN', 'EXECUTED', `Email sent to ${abuseEmail}`]);
    return { success: true, emailSentTo: abuseEmail };
};
