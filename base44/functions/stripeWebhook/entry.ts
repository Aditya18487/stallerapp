import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

async function verifyStripeSignature(payload, signatureHeader, secret) {
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = timestampPart.slice(2);
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatures.some((sig) => sig === expectedHex);
}

const PLANS = {
  '3_months': { name: 'Starter', amount: 1200, term: 3 },
  '6_months': { name: 'Pro', amount: 1000, term: 6 },
  '12_months': { name: 'Elite', amount: 833, term: 12 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return Response.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const planName = session.metadata?.planName || "Pro";
      const plan = PLANS[planId];

      if (!userId) {
        console.error("No userId in session metadata");
        return Response.json({ error: "Missing userId" }, { status: 400 });
      }

      const startDate = new Date().toISOString().slice(0, 10);
      const termMonths = plan?.term || 6;
      const endDate = new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      // Create subscription record
      await base44.asServiceRole.entities.Subscription.create({
        plan_id: planId,
        plan_name: planName,
        monthly_amount: plan?.amount || 1000,
        term_months: termMonths,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        bank_account_holder: 'Stripe',
        bank_name: 'Stripe',
        bank_account_number: 'stripe_' + (session.customer || 'unknown'),
        bank_branch_code: 'N/A',
        bank_account_type: 'cheque',
        debit_order_day: 1,
      });

      // Activate subscription — only after verified Stripe payment
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_status: 'active',
        subscription_plan: planName,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});