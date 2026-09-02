import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Permanently delete all Subscription records owned by the user.
    // Subscription RLS restricts delete to admins, so the service role is required.
    await base44.asServiceRole.entities.Subscription.deleteMany({ created_by_id: user.id });

    // Clear all personal data from the user profile (dynamic fields).
    await base44.asServiceRole.entities.User.update(user.id, {
      telegram: '',
      whatsapp: '',
      notifications_setup: false,
      subscription_status: 'cancelled',
      subscription_plan: '',
      subscription_end_date: '',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}