import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const PLANS = {
  '3_months': { name: 'Starter', amount: 120000, term: 3 },
  '6_months': { name: 'Pro', amount: 100000, term: 6 },
  '12_months': { name: 'Elite', amount: 83300, term: 12 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json();
    const { planId, successUrl, cancelUrl } = body;

    const plan = PLANS[planId];
    if (!plan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!successUrl || !cancelUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not set");
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        "line_items[0][price_data][currency]": "zar",
        "line_items[0][price_data][unit_amount]": String(plan.amount),
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][price_data][product_data][name]": `PrimeTrade ${plan.name}`,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        "metadata[userId]": user.id,
        "metadata[planId]": planId,
        "metadata[planName]": plan.name,
        "metadata[base44_app_id]": Deno.env.get("BASE44_APP_ID") || "",
      }),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", JSON.stringify(session));
      return Response.json({ error: session.error?.message || "Failed to create checkout session" }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});