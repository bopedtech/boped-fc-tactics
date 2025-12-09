-- Fix search_path for update_players_updated_at_camelcase
CREATE OR REPLACE FUNCTION public.update_players_updated_at_camelcase()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$function$;

-- Fix search_path for update_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix search_path for update_metadata_updated_at
CREATE OR REPLACE FUNCTION public.update_metadata_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$function$;

-- Fix search_path for update_players_updated_at
CREATE OR REPLACE FUNCTION public.update_players_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;