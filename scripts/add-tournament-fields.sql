
-- Add missing columns to the tournaments table

-- 1. event_website
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'event_website') THEN
        ALTER TABLE public.tournaments ADD COLUMN event_website text;
    END IF;
END $$;

-- 2. classification_acceptance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'classification_acceptance') THEN
        ALTER TABLE public.tournaments ADD COLUMN classification_acceptance text DEFAULT 'OPEN';
    END IF;
END $$;

-- 3. accepted_classifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'accepted_classifications') THEN
        ALTER TABLE public.tournaments ADD COLUMN accepted_classifications text[];
    END IF;
END $$;

-- 4. age_group (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'age_group') THEN
        ALTER TABLE public.tournaments ADD COLUMN age_group text;
    END IF;
END $$;

-- 5. prize_info (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'prize_info') THEN
        ALTER TABLE public.tournaments ADD COLUMN prize_info text;
    END IF;
END $$;

-- 6. format_type (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'format_type') THEN
        ALTER TABLE public.tournaments ADD COLUMN format_type text DEFAULT 'single_elimination';
    END IF;
END $$;

-- 7. entry_fee (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'entry_fee') THEN
        ALTER TABLE public.tournaments ADD COLUMN entry_fee numeric;
    END IF;
END $$;

-- 8. max_participants (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'max_participants') THEN
        ALTER TABLE public.tournaments ADD COLUMN max_participants integer DEFAULT 16;
    END IF;
END $$;

-- 9. location_name (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'location_name') THEN
        ALTER TABLE public.tournaments ADD COLUMN location_name text;
    END IF;
END $$;

-- 10. address (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'address') THEN
        ALTER TABLE public.tournaments ADD COLUMN address text;
    END IF;
END $$;

-- 11. city (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'city') THEN
        ALTER TABLE public.tournaments ADD COLUMN city text;
    END IF;
END $$;

-- 12. state (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'state') THEN
        ALTER TABLE public.tournaments ADD COLUMN state text;
    END IF;
END $$;

-- 13. country (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'country') THEN
        ALTER TABLE public.tournaments ADD COLUMN country text DEFAULT 'USA';
    END IF;
END $$;

-- 14. latitude (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'latitude') THEN
        ALTER TABLE public.tournaments ADD COLUMN latitude double precision;
    END IF;
END $$;

-- 15. longitude (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'longitude') THEN
        ALTER TABLE public.tournaments ADD COLUMN longitude double precision;
    END IF;
END $$;
