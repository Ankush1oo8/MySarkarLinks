-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for comment ratings
CREATE TYPE public.comment_rating AS ENUM ('positive', 'negative', 'neutral');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create sites table for government sites
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating comment_rating NOT NULL DEFAULT 'neutral',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sites
CREATE POLICY "Sites are publicly viewable"
  ON public.sites FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage all sites"
  ON public.sites FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for comments
CREATE POLICY "Approved comments are publicly viewable"
  ON public.comments FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial government sites data
INSERT INTO public.sites (title, url, description, category) VALUES
  ('National Portal of India', 'https://www.india.gov.in', 'Single-window gateway to all central and state government services, news, forms, tenders and directories.', 'General Services'),
  ('MyGov', 'https://www.mygov.in', 'Citizen-engagement platform for discussions, tasks, polls and feedback on government initiatives.', 'Citizen Engagement'),
  ('Prime Minister''s Office', 'https://www.pmindia.gov.in', 'Official site of the Prime Minister''s Office—announcements, speeches, policies and press releases.', 'Leadership'),
  ('Ministry of Home Affairs', 'https://www.mha.gov.in', 'Internal security, border management, citizenship, disaster management and public grievances.', 'Security & Administration'),
  ('Ministry of Finance', 'https://finmin.nic.in', 'Budget, tax policy, financial sector regulation, public debt and expenditure management.', 'Finance & Economics'),
  ('Ministry of External Affairs', 'https://www.mea.gov.in', 'India''s foreign policy, diplomatic missions, consular services and international treaties.', 'Foreign Affairs'),
  ('Ministry of Defence', 'https://www.mod.gov.in', 'Defence policy, armed forces oversight, procurement and veterans'' affairs.', 'Defence'),
  ('Ministry of Railways', 'https://indianrailways.gov.in', 'Railway network operations, passenger services, freight management and online ticketing (IRCTC).', 'Transportation'),
  ('Ministry of Health & Family Welfare', 'https://www.mohfw.gov.in', 'National health policy, family welfare programs, disease control and medical education.', 'Health & Welfare'),
  ('Ministry of Education', 'https://www.education.gov.in', 'School education, higher education, scholarships, e-learning initiatives and teacher training.', 'Education'),
  ('Ministry of Agriculture & Farmers Welfare', 'https://agricoop.nic.in', 'Agricultural policy, farmer schemes, commodity pricing, market intelligence and credit support.', 'Agriculture'),
  ('Ministry of Electronics & Information Technology', 'https://www.meity.gov.in', 'Digital India programs, IT policy, cybersecurity, e-governance and emerging technologies.', 'Technology'),
  ('Ministry of Environment, Forest & Climate Change', 'https://moef.gov.in', 'Environmental protection, climate action, wildlife conservation and environmental impact assessments.', 'Environment'),
  ('Ministry of Labour & Employment', 'https://labour.gov.in', 'Labour laws, social security, skill development, employment services and worker welfare programs.', 'Employment'),
  ('Ministry of Women & Child Development', 'https://wcd.nic.in', 'Women''s empowerment, child welfare schemes, juvenile justice and protection policies.', 'Social Welfare'),
  ('Ministry of Housing & Urban Affairs', 'https://mohua.gov.in', 'Urban planning, housing schemes (PMAY), smart cities mission and urban infrastructure development.', 'Urban Development'),
  ('Ministry of Petroleum & Natural Gas', 'https://petroleum.nic.in', 'Hydrocarbon exploration, refining, distribution, subsidies and new energy transitions.', 'Energy'),
  ('Ministry of New & Renewable Energy', 'https://mnre.gov.in', 'Solar, wind, bioenergy, policy incentives and renewable integration targets.', 'Energy'),
  ('Open Government Data Platform', 'https://data.gov.in', 'Central repository of open datasets, APIs and data-driven apps published by government entities.', 'Data & Analytics'),
  ('Integrated Government Online Directory', 'https://igod.gov.in', 'Browse all central ministries, departments, statutory bodies, PSUs and field offices by category.', 'General Services');