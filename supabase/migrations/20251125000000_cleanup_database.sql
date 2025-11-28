-- Cleanup database, preserving test player (ID: 3231a3c2-2a31-41be-a48d-106ac1e169bb)

-- 1. Tournaments
DELETE FROM public.tournament_applications;
DELETE FROM public.tournament_participants;
DELETE FROM public.tournaments;

-- 2. Teams
DELETE FROM public.team_members;
DELETE FROM public.team_achievements;
DELETE FROM public.team_media;
DELETE FROM public.tryout_applications;
DELETE FROM public.tryouts;
-- DELETE FROM public.calendar_events; -- Table might not exist

DELETE FROM public.teams;

-- 3. Players and Profiles
DELETE FROM public.player_profiles WHERE user_id != '3231a3c2-2a31-41be-a48d-106ac1e169bb';
DELETE FROM public.players WHERE user_id != '3231a3c2-2a31-41be-a48d-106ac1e169bb';
DELETE FROM public.profiles WHERE id != '3231a3c2-2a31-41be-a48d-106ac1e169bb';

-- 4. Other
DELETE FROM public.messages;
DELETE FROM public.notifications;
