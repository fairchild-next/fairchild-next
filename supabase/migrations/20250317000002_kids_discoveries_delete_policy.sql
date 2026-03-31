-- Allow users to delete their own discoveries and badges (for reset/testing)
-- Run after 20250317000000_kids_discoveries_badges.sql

drop policy if exists "kids_discoveries_delete_own" on kids_discoveries;
create policy "kids_discoveries_delete_own" on kids_discoveries for delete using (auth.uid() = user_id);

drop policy if exists "kids_user_badges_delete_own" on kids_user_badges;
create policy "kids_user_badges_delete_own" on kids_user_badges for delete using (auth.uid() = user_id);
