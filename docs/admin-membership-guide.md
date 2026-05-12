# DIFW Membership — Admin Guide

Membership applications are managed in Airtable. No custom admin panel is needed.

---

## Approving a Membership Application

1. Open the **Membership Applications** table in Airtable
2. Open the applicant record
3. Generate a payment link from your payment provider (Revolut Business, Stripe, etc.)
4. Paste the link into the **Payment Link** field
5. Fill in the **Payment Amount** field (e.g. `€150`)
6. Change **Status** to `Approved`

The approval email with payment link will send automatically within 1–2 minutes via the Airtable automation.
The **Magic Link Sent** checkbox will be ticked automatically once the email is confirmed sent.

---

## Confirming Payment

1. Once you have confirmed payment has been received
2. Change **Status** to `Paid`

The welcome email with portal access link will send automatically. The **Supabase User ID** field will be populated once the member account is created.

---

## Airtable Table Fields

Make sure the following fields exist in the **Membership Applications** table:

| Field Name | Type |
|---|---|
| Full Name | Single line text |
| Brand Name | Single line text |
| Location | Single line text |
| Email | Email |
| Phone | Phone number |
| Website URL | URL |
| Instagram | Single line text |
| Membership Tier | Single select: `emerging_designer`, `established_designer`, `signature_designer`, `curator` |
| About Work | Long text |
| Why Join | Long text |
| DIFW26 Participation | Single select: `yes`, `no`, `unsure` |
| Headshot URL | URL |
| Logo URL | URL |
| Supporting Docs URL | URL |
| Emerging Proof URL | URL |
| Status | Single select: `pending`, `approved`, `rejected`, `paid` |
| Payment Link | URL |
| Payment Amount | Single line text |
| Admin Notes | Long text |
| Supabase ID | Single line text *(application UUID, written on submission)* |
| Supabase User ID | Single line text *(auth user UUID, written after activation)* |
| Magic Link Sent | Checkbox *(ticked automatically after approval email sends)* |

---

## Airtable Automations Setup

### Automation 1: On Approval (sends payment email)

- **Trigger:** When record matches conditions
  - Status = `Approved`
  - AND Payment Link is not empty
- **Action:** Send a POST request
  - URL: `https://[your-vercel-url]/api/webhooks/membership-approved`
  - Method: POST
  - Headers:
    - `Content-Type`: `application/json`
    - `x-difw-secret`: `[your WEBHOOK_SECRET value]`
  - Body (paste exactly, Airtable will substitute field values):
    ```json
    {
      "airtable_record_id": "{Record ID}",
      "email": "{Email}",
      "full_name": "{Full Name}",
      "payment_link": "{Payment Link}",
      "payment_amount": "{Payment Amount}",
      "membership_tier": "{Membership Tier}"
    }
    ```

### Automation 2: On Payment Confirmed (creates account + sends magic link)

- **Trigger:** When record matches conditions
  - Status = `Paid`
- **Action:** Send a POST request
  - URL: `https://[your-vercel-url]/api/webhooks/membership-paid`
  - Method: POST
  - Headers:
    - `Content-Type`: `application/json`
    - `x-difw-secret`: `[your WEBHOOK_SECRET value]`
  - Body:
    ```json
    {
      "airtable_record_id": "{Record ID}",
      "email": "{Email}",
      "full_name": "{Full Name}",
      "brand_name": "{Brand Name}",
      "membership_tier": "{Membership Tier}"
    }
    ```

---

## Environment Variables

Add to `.env.local` (and to Vercel environment variables for production):

```
WEBHOOK_SECRET=choose-a-long-random-string
```

The same string goes in the Airtable automation header (`x-difw-secret`).

---

## Testing

To test end-to-end:
1. Submit a test application via `/membership/apply`
2. Open the record in Airtable
3. Paste a test payment link, set Payment Amount, change Status to `Approved`
4. Confirm the approval email arrives (check Magic Link Sent checkbox ticks)
5. Change Status to `Paid`
6. Confirm the welcome email arrives with a working magic link
7. Click the link — confirm it redirects to `/members/setup`
8. Set a password and confirm access to `/members/talent`
