// send-booking-notification
//
// Triggered by a Supabase Database Webhook on INSERT into `bookings`.
// Sends an email to the business owner via Resend so they know a new
// appointment was booked, without needing to check the admin dashboard.
//
// Required secrets (set with `supabase secrets set`, never committed):
//   RESEND_API_KEY   - from https://resend.com/api-keys
//   OWNER_EMAIL      - the email address that should receive notifications
//   WEBHOOK_SECRET    - a random string shared with the Database Webhook
//                        config, so only that webhook can trigger this
//                        function (see setup instructions).
//
// Deployed with --no-verify-jwt because the caller is a Database Webhook,
// not a logged-in user — the WEBHOOK_SECRET header check below is what
// keeps this endpoint from being called by anyone else.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Confirm this request really came from our Database Webhook, not a
  // random caller — the webhook is configured to send this same header.
  const incomingSecret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || incomingSecret !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!RESEND_API_KEY || !OWNER_EMAIL) {
    console.error("Missing RESEND_API_KEY or OWNER_EMAIL secret.");
    return new Response("Server not configured", { status: 500 });
  }

  const payload = await req.json();

  // Database Webhooks send { type, table, record, old_record, schema }.
  // Only act on new bookings — ignore updates/deletes if this function
  // ever gets reused for other events.
  if (payload.type !== "INSERT" || payload.table !== "bookings") {
    return new Response("Ignored", { status: 200 });
  }

  const b = payload.record ?? {};

  const subject = `New booking: ${b.customer_name ?? "Unknown"} — ${b.appointment_date ?? ""} ${b.appointment_time ?? ""}`;

  const html = `
    <h2>New booking received</h2>
    <p><strong>${escapeHtml(b.customer_name)}</strong> booked
      <strong>${escapeHtml(b.service_name)}</strong>
      for <strong>${escapeHtml(b.appointment_date)}</strong> at
      <strong>${escapeHtml(b.appointment_time)}</strong>.</p>
    <table cellpadding="4" style="border-collapse: collapse;">
      <tr><td><strong>Vehicle</strong></td><td>${escapeHtml(b.vehicle_year)} ${escapeHtml(b.vehicle_make)} ${escapeHtml(b.vehicle_model)} (${escapeHtml(b.vehicle_type)})</td></tr>
      <tr><td><strong>Address</strong></td><td>${escapeHtml(b.address)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(b.customer_phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(b.customer_email)}</td></tr>
      <tr><td><strong>Notes</strong></td><td>${escapeHtml(b.notes) || "—"}</td></tr>
      <tr><td><strong>Price</strong></td><td>${escapeHtml(b.service_price) || "—"}</td></tr>
    </table>
    <p style="color:#888; font-size:12px;">Log into /admin to manage this appointment.</p>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MV Auto Detailing <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errText = await resendResponse.text();
    console.error("Resend API error:", resendResponse.status, errText);
    // Surfaced in net._http_response.content for easy debugging via SQL —
    // safe to leave in place long-term, it never includes secrets.
    return new Response(`Resend error (${resendResponse.status}): ${errText}`, { status: 502 });
  }

  return new Response("OK", { status: 200 });
});
