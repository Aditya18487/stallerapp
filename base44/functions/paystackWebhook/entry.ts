import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PLANS } from '../../shared/plans.ts';
import { secrets } from 'base44:runtime';

async function verifyPaystackSignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const expectedBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(expectedBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return signature === expected;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const secretKey = secrets.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const isValid = await verifyPaystackSignature(body, signature, secretKey);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;

      // Verify the transaction with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.data || verifyData.data.status !== 'success') {
        console.error('Paystack verification failed:', JSON.stringify(verifyData));
        return Response.json({ error: 'Verification failed' }, { status: 400 });
      }

      const metadata = verifyData.data.metadata || {};
      const userId = metadata.userId;
      const planId = metadata.planId;
      const planName = metadata.planName || 'Pro';
      const plan = PLANS[planId];

      if (!userId) {
        console.error('No userId in transaction metadata');
        return Response.json({ error: 'Missing userId' }, { status: 400 });
      }

      const startDate = new Date().toISOString().slice(0, 10);
      const termMonths = plan?.term || 6;
      const endDate = new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      await base44.asServiceRole.entities.Subscription.create({
        plan_id: planId,
        plan_name: planName,
        monthly_amount: plan?.monthly || 1000,
        term_months: termMonths,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        bank_account_holder: 'Paystack',
        bank_name: 'Paystack',
        bank_account_number: 'paystack_' + (verifyData.data.customer?.email || reference),
        bank_branch_code: 'N/A',
        bank_account_type: 'cheque',
        debit_order_day: 1,
      });

      await base44.asServiceRole.entities.User.update(userId, {
        subscription_status: 'active',
        subscription_plan: planName,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}