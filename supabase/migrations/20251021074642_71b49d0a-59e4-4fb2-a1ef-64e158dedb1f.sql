-- Create custom types
CREATE TYPE public.person_type AS ENUM ('student', 'staff', 'faculty');
CREATE TYPE public.case_status AS ENUM ('open', 'in_progress', 'closed');
CREATE TYPE public.incident_importance AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.incident_status AS ENUM ('pending', 'under_review', 'resolved');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create people table (unified for students, staff, faculty)
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type person_type NOT NULL,
  full_name TEXT NOT NULL,
  national_id TEXT,
  employee_number TEXT,
  student_number TEXT,
  phone TEXT,
  email TEXT,
  is_foreign_student BOOLEAN DEFAULT false,
  faculty TEXT,
  program TEXT,
  department TEXT,
  position TEXT,
  academic_rank TEXT,
  religion TEXT,
  city TEXT,
  country TEXT,
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create people_attachments junction table
CREATE TABLE public.people_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  attachment_id UUID REFERENCES public.attachments(id) ON DELETE CASCADE NOT NULL,
  is_profile_picture BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status case_status DEFAULT 'open',
  summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create case_people junction table
CREATE TABLE public.case_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create case_attachments junction table
CREATE TABLE public.case_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  attachment_id UUID REFERENCES public.attachments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  importance incident_importance DEFAULT 'medium',
  status incident_status DEFAULT 'pending',
  follow_up TEXT,
  description TEXT,
  records TEXT,
  security_opinion TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create incident_people junction table
CREATE TABLE public.incident_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_people ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS policies for people
CREATE POLICY "Authenticated users can view people" ON public.people FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert people" ON public.people FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update people they created" ON public.people FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete people they created" ON public.people FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for attachments
CREATE POLICY "Authenticated users can view attachments" ON public.attachments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert attachments" ON public.attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete attachments" ON public.attachments FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for people_attachments
CREATE POLICY "Authenticated users can view people_attachments" ON public.people_attachments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert people_attachments" ON public.people_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete people_attachments" ON public.people_attachments FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for cases
CREATE POLICY "Authenticated users can view cases" ON public.cases FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update cases they created" ON public.cases FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete cases they created" ON public.cases FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for case_people
CREATE POLICY "Authenticated users can view case_people" ON public.case_people FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert case_people" ON public.case_people FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete case_people" ON public.case_people FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for case_attachments
CREATE POLICY "Authenticated users can view case_attachments" ON public.case_attachments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert case_attachments" ON public.case_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete case_attachments" ON public.case_attachments FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS policies for incidents
CREATE POLICY "Authenticated users can view incidents" ON public.incidents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update incidents they created" ON public.incidents FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete incidents they created" ON public.incidents FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for incident_people
CREATE POLICY "Authenticated users can view incident_people" ON public.incident_people FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert incident_people" ON public.incident_people FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete incident_people" ON public.incident_people FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for profile-pictures
CREATE POLICY "Profile pictures are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Authenticated users can upload profile pictures" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update profile pictures" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete profile pictures" ON storage.objects FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid() IS NOT NULL);

-- Storage policies for documents
CREATE POLICY "Authenticated users can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);