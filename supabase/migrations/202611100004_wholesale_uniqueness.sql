-- A buyer can have at most one active wholesale application.
-- Rejected applications remain in history so buyers can reapply.
create unique index if not exists wholesale_one_active_application_per_user
on public.wholesale_applications(user_id)
where status in ('pending', 'approved');
