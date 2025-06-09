-- Drop and recreate the handle_new_user function to ensure it works correctly
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Insert the new profile with SECURITY DEFINER to bypass RLS
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error (in a real system, you'd want better logging)
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW; -- Still return NEW to avoid blocking the auth user creation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix the RLS policy for profiles to ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Fix the RLS policy for profiles to ensure users can view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles 
    FOR SELECT 
    USING (true);

-- Fix the RLS policy for profiles to ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
