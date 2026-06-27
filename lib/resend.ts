import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@dublin-ifw.com'
const REPLY_TO = 'info@dublin-ifw.com'

// ── Talent emails ────────────────────────────────────────────

export async function sendTalentConfirmation(to: string, fullName: string) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Directory — Submission Received',
    html: emailWrapper(`
      <h1>Submission Received</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for your submission to the DIFW Talent Directory. Submissions are reviewed on a rolling basis and you can expect to hear back within 5 business days.</p>
      <p>If you have any questions in the meantime, please contact us at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a></p>
    `),
  })
}

export async function sendTalentApproval(to: string, fullName: string) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Directory — Application Approved',
    html: emailWrapper(`
      <h1>You're In</h1>
      <p>Hi ${firstName},</p>
      <p>Your submission to the DIFW Talent Directory has been approved. Your profile is now visible to DIFW members when they are selecting creatives to work with.</p>
      <p>If you need to update any of your details or portfolio links, contact us at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a></p>
    `),
  })
}

export async function sendTalentRejection(to: string, fullName: string) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Directory — Application Update',
    html: emailWrapper(`
      <h1>Application Update</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in the DIFW Talent Directory. After reviewing your submission, we're unable to move forward at this time.</p>
      <p>We appreciate you taking the time to apply and wish you the best with your work.</p>
    `),
  })
}

// ── Membership emails ────────────────────────────────────────

export async function sendMembershipConfirmation(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Membership — Application Received',
    html: emailWrapper(`
      <h1>Application Received</h1>
      <p>Hi ${firstName},</p>
      <p>Thanks for applying to become a DIFW member. A member of our team will review your application and be in touch shortly.</p>
    `),
  })
}

export async function sendMembershipApproval(
  to: string,
  fullName: string,
  tier: string,
  paymentLink: string,
  paymentAmount: string
) {
  const tierLabel = tier.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your DIFW Membership Application',
    html: emailWrapper(`
      <h1 style="margin:0 0 4px;">Your Application</h1>
      <h1 style="margin:0 0 32px;">Has Been Approved</h1>
      <p>We are delighted to let you know that your application to become a member has been approved.</p>
      <p>To confirm your membership, please complete your payment using the link below.</p>
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;margin:32px 0 16px;">${tierLabel} — ${paymentAmount}</p>
      <a href="${paymentLink}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;">Complete Payment</a>
      <p style="margin-top:40px;">Once your payment is confirmed, you will receive a separate email with access to the DIFW portal.</p>
      <p>If you have any questions, contact us at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a></p>
    `),
  })
}

export async function sendMembershipRejection(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your DIFW Membership Application',
    html: emailWrapper(`
      <h1>Application Update</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for submitting an application to become a DIFW Member.</p>
      <p>After careful review, we have decided not to move forward with your application at this time.</p>
      <p>If you would like to appeal this decision, receive feedback, or discuss reapplying in the future, please contact us at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a>.</p>
      <p>We sincerely appreciate your interest in being part of the DIFW community.</p>
    `),
  })
}

export async function sendMemberWelcome(to: string, fullName: string, memberId: string) {
  const firstName = fullName.split(' ')[0]
  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/access?token=${memberId}`
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Welcome to DIFW — Access Your DIFW Portal',
    html: emailWrapper(`
      <h1 style="margin:0 0 4px;">Welcome to DIFW,</h1>
      <h1 style="margin:0 0 32px;">${firstName}.</h1>
      <p>Your payment has been confirmed and your membership is now active.</p>
      <p>Click the button below to set up your account and access the DIFW Portal.</p>
      <a href="${setupUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;margin-top:8px;">Set Up Your Account</a>
      <p style="margin-top:40px;">Here, you can:</p>
      <p style="color:#555;">— Access the DIFW Talent Directory<br>— Stay up to date with events, announcements, and opportunities exclusive to DIFW members<br>— Manage your DIFW membership account</p>
      <p>Thank you for being part of the DIFW community, we're excited to have you with us. Let's change the future of fashion together.</p>
    `),
  })
}

export async function sendAccessLink(to: string, fullName: string, magicLink: string) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Portal — Your Sign-In Link',
    html: emailWrapper(`
      <h1>Sign In to DIFW</h1>
      <p>Hi ${firstName},</p>
      <p>Click the button below to sign in to your DIFW member account and set up your password.</p>
      <a href="${magicLink}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;margin-top:8px;">Sign In to DIFW Portal</a>
      <p style="margin-top:40px;font-size:12px;color:#888;">This link expires in 1 hour and can only be used once. If you did not request this, you can ignore this email.</p>
    `),
  })
}

export async function sendEventSubmissionConfirmation(
  to: string,
  fullName: string,
  eventTitle: string,
  eventType: string,
) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW26 — Event Proposal Received',
    html: emailWrapper(`
      <h1>Proposal Received</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for submitting your event proposal for <strong>Dublin Independent Fashion Week 2026</strong>. We're delighted to receive your application and look forward to reviewing your proposal.</p>

      <div style="background:#f9f9f9;border-left:3px solid #000;padding:16px 20px;margin:32px 0;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Submitted Proposal</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#000;">${eventTitle}</p>
        <p style="margin:0;font-size:13px;color:#555;">${eventType}</p>
      </div>

      <p>Your application will be reviewed by the DIFW26 Curation Committee. Applications will either be <strong>Accepted</strong> or <strong>Deferred for Further Development</strong>. A deferred application is not a rejection — it simply means that further development is required before the proposal can be included in the programme.</p>

      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#555;margin:40px 0 16px;">Key Dates</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="border-bottom:1px solid #e5e5e5;">
          <td style="padding:10px 16px 10px 0;color:#888;white-space:nowrap;vertical-align:top;font-size:11px;letter-spacing:1px;text-transform:uppercase;">27 July 2026</td>
          <td style="padding:10px 0;color:#333;">Submission Deadline</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e5e5;">
          <td style="padding:10px 16px 10px 0;color:#888;white-space:nowrap;vertical-align:top;font-size:11px;letter-spacing:1px;text-transform:uppercase;">3 August 2026</td>
          <td style="padding:10px 0;color:#333;">Acceptance and Deferral Notifications Issued</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e5e5;">
          <td style="padding:10px 16px 10px 0;color:#888;white-space:nowrap;vertical-align:top;font-size:11px;letter-spacing:1px;text-transform:uppercase;">August 2026</td>
          <td style="padding:10px 0;color:#333;">
            <strong style="color:#000;">Approved:</strong> Design and promotional asset production begins<br>
            <strong style="color:#000;">Deferred:</strong> Development support provided by the DIFW26 Curation Committee
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px 10px 0;color:#888;white-space:nowrap;vertical-align:top;font-size:11px;letter-spacing:1px;text-transform:uppercase;">1 September 2026</td>
          <td style="padding:10px 0;color:#333;">Deadline for all final event information, graphics, and promotional materials</td>
        </tr>
      </table>

      <p style="margin-top:40px;">If you have any questions in the meantime, please don't hesitate to reach out at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a></p>
      <p>Thank you for being part of DIFW26.</p>
    `),
  })
}

export async function sendAdminPasswordReset(to: string, resetLink: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: '[DIFW] Reset Your Admin Password',
    html: emailWrapper(`
      <h1>Admin Password Reset</h1>
      <p>A password reset was requested for this admin account. Click the button below to set a new password.</p>
      <a href="${resetLink}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;margin-top:8px;">Reset Password</a>
      <p style="margin-top:40px;font-size:12px;color:#888;">This link expires in 1 hour and can only be used once. If you did not request a password reset, please contact your team immediately at <a href="mailto:info@dublin-ifw.com" style="color:#888;">info@dublin-ifw.com</a>.</p>
    `),
  })
}

// ── Shared wrapper ───────────────────────────────────────────

function emailWrapper(body: string): string {
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/logo.webp`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; color:#000; font-family:Arial,sans-serif; font-size:15px; line-height:1.6; }
    .outer { background:#f4f4f4; padding:40px 16px; }
    .container { max-width:560px; margin:0 auto; background:#ffffff; padding:48px 40px; }
    .logo-wrap { margin-bottom:40px; padding-bottom:32px; border-bottom:1px solid #e5e5e5; }
    h1 { font-size:26px; letter-spacing:2px; text-transform:uppercase; margin:0 0 20px; font-weight:700; color:#000; }
    p { color:#333; margin:0 0 16px; }
    strong { color:#000; }
    a { color:#000; }
    .footer { margin-top:48px; padding-top:24px; border-top:1px solid #e5e5e5; font-size:12px; color:#888; }
  </style>
</head>
<body>
  <div class="outer">
    <div class="container">
      <div class="logo-wrap">
        <img src="${logoUrl}" alt="Dublin Independent Fashion Week" width="100" style="display:block;" />
      </div>
      ${body}
      <div class="footer">
        Dublin Independent Fashion Week &nbsp;·&nbsp; dublin-ifw.com<br>
        © Dublin Independent Fashion Week. This email was sent because you submitted an application on our platform.
      </div>
    </div>
  </div>
</body>
</html>`
}
