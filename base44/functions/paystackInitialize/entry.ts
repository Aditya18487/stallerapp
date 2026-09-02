import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PLANS } from '../../shared/plans.ts';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { planId, successUrl } = body;

    const plan = PLANS[planId];
    if (!plan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!successUrl) {
      return Response.json({ error: 'Missing callback URL' }, { status: 400 });
    }

    const secretKey = secrets.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY not set');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const reference = `PT_${planId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: plan.amount,
        currency: 'ZAR',
        reference,
        callback_url: successUrl,
        metadata: {
          userId: user.id,
          planId,
          planName: plan.name,
          base44_app_id: secrets.get('BASE44_APP_ID') || '',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paystack error:', JSON.stringify(data));
      return Response.json({ error: data.error?.message || 'Failed to initialize payment' }, { status: 500 });
    }

    return Response.json({ url: data.data.authorization_url });
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}