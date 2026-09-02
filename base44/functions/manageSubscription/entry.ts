import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const PLANS = {
  'Starter': { id: '3_months', name: 'Starter', amount: 1200, term: 3 },
  'Pro': { id: '6_months', name: 'Pro', amount: 1000, term: 6 },
  'Elite': { id: '12_months', name: 'Elite', amount: 833, term: 12 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();

    // Only the owner (admin) can grant or revoke subscriptions
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { action, email, plan } = body;

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Find the target user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const targetUser = users[0];

    if (!targetUser) {
      return Response.json({ error: 'User not found — they must register first' }, { status: 404 });
    }

    if (action === 'revoke') {
      await base44.asServiceRole.entities.User.update(targetUser.id, {
        subscription_status: 'cancelled',
      });
      return Response.json({ success: true, action: 'revoked', email });
    }

    // Grant subscription
    const planConfig = PLANS[plan] || PLANS['Pro'];
    const startDate = new Date().toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + planConfig.term * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    await base44.asServiceRole.entities.Subscription.create({
      plan_id: planConfig.id,
      plan_name: planConfig.name,
      monthly_amount: planConfig.amount,
      term_months: planConfig.term,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      bank_account_holder: targetUser.full_name || email,
      bank_name: 'Manual Grant',
      bank_account_number: 'manual',
      bank_branch_code: 'N/A',
      bank_account_type: 'cheque',
      debit_order_day: 1,
    });

    await base44.asServiceRole.entities.User.update(targetUser.id, {
      subscription_status: 'active',
      subscription_plan: planConfig.name,
    });

    return Response.json({ success: true, action: 'granted', email, plan: planConfig.name });
  } catch (error) {
    console.error("Manage subscription error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});