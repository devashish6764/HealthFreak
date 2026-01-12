import { createClient } from '@supabase/client';

// IMPORTANT: Supabase is not yet integrated with this environment
// This file is prepared for future Supabase integration
// Currently using localStorage as data persistence layer

// Placeholder for Supabase client
// Uncomment and configure after completing Supabase integration:
/*
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// Database Schema (for reference when setting up Supabase):
/*
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  weight DECIMAL,
  height DECIMAL,
  lactose_intolerant BOOLEAN DEFAULT FALSE,
  weight_unit TEXT DEFAULT 'kg',
  height_unit TEXT DEFAULT 'cm',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food logs table
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication reminders table
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  reminder_time TEXT NOT NULL,
  days_of_week JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water intake table
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight logs table
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own food logs" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON food_logs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON medications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own water intake" ON water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake" ON water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own water intake" ON water_intake FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own weight logs" ON weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
*/

export default null;