-- Add missing enum value 'professor' to app_role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'professor'
  ) THEN
    EXECUTE 'ALTER TYPE public.app_role ADD VALUE ''professor''';
  END IF;
END $$;