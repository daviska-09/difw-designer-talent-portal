import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM = 'onboarding@resend.dev'
const REPLY_TO = 'hello@dublinfashionweek.ie'

// ── Talent emails ────────────────────────────────────────────

export async function sendTalentConfirmation(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Database — Application Received',
    html: emailWrapper(`
      <h1>Application Received</h1>
      <p>Hi ${firstName},</p>
      <p>Thanks for applying to the DIFW Talent Database. A member of our team will review your application and be in touch shortly.</p>
      <p>In the meantime, if you have any questions you can reply to this email.</p>
    `),
  })
}

export async function sendTalentApproval(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Database — Application Approved',
    html: emailWrapper(`
      <h1>You're In</h1>
      <p>Hi ${firstName},</p>
      <p>Your application to the DIFW Talent Database has been approved. Your profile is now live in our member directory and visible to DIFW members looking for collaborators.</p>
      <p>If you need to update any of your details or portfolio links, reply to this email.</p>
    `),
  })
}

export async function sendTalentRejection(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Talent Database — Application Update',
    html: emailWrapper(`
      <h1>Application Update</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in the DIFW Talent Database. After reviewing your application, we're unable to move forward at this time.</p>
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
  const firstName = fullName.split(' ')[0]
  const tierLabel = tier.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Your DIFW Membership Application',
    html: emailWrapper(`
      <h1 style="margin:0 0 4px;">Your Application</h1>
      <h1 style="margin:0 0 32px;">Has Been Approved</h1>
      <p>Congratulations ${firstName}. Your application for DIFW membership has been approved by our team.</p>
      <p>To confirm your membership, please complete your payment using the link below.</p>
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;margin:32px 0 16px;">${tierLabel} Membership — ${paymentAmount}</p>
      <a href="${paymentLink}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;">Complete Payment</a>
      <p style="margin-top:40px;">Once your payment is confirmed, you will receive a separate email with access to the DIFW member portal.</p>
      <p>If you have any questions, contact us at <a href="mailto:info@dublin-ifw.com" style="color:#000;">info@dublin-ifw.com</a></p>
    `),
  })
}

export async function sendMembershipRejection(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'DIFW Membership — Application Update',
    html: emailWrapper(`
      <h1>Application Update</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in DIFW membership. After reviewing your application, we're unable to move forward at this time.</p>
      <p>We appreciate your support and hope to connect with you at future DIFW events.</p>
    `),
  })
}

export async function sendMemberWelcome(
  to: string,
  fullName: string,
  magicLink: string
) {
  const firstName = fullName.split(' ')[0]
  return getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Welcome to DIFW — Access Your Member Portal',
    html: emailWrapper(`
      <h1 style="margin:0 0 4px;">Welcome to DIFW,</h1>
      <h1 style="margin:0 0 32px;">${firstName}.</h1>
      <p>Your payment has been confirmed and your membership is now active.</p>
      <p>Click the button below to set up your password and access the member portal. This link expires in 24 hours and can only be used once.</p>
      <a href="${magicLink}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;font-family:sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase;margin-top:8px;">Access Member Portal</a>
      <p style="margin-top:40px;">Inside the portal you will find:</p>
      <p style="color:#555;">— The DIFW talent database<br>— Member announcements and articles<br>— Events and industry updates</p>
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
