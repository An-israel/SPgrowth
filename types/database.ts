export type UserRole = "student" | "admin";

export type ResourceLink = {
  label: string;
  url: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  location: string | null;
  role: UserRole;
  created_at: string;
};

export type DailyContent = {
  id: number;
  day_number: number;
  week_number: number;
  chapter: string;
  topic: string;
  key_truth: string;
  practical_exercise: string;
  prayer_focus: string;
  is_review_day: boolean;
  weekly_challenge: string | null;
  resources: ResourceLink[];
};

export type UserProgress = {
  id: string;
  user_id: string;
  day_number: number;
  reading_done: boolean;
  exercise_done: boolean;
  prayer_done: boolean;
  pt_done: boolean;
  exercise_response: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type FinalGrowthPlan = {
  id: string;
  user_id: string;
  greatest_area_of_growth: string | null;
  biggest_spiritual_challenge: string | null;
  habit_1: string | null;
  habit_2: string | null;
  habit_3: string | null;
  accountability_partner: string | null;
  ninety_day_goal: string | null;
  submitted_at: string | null;
};

export type AppConfig = {
  id: number;
  program_start_date: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      daily_content: {
        Row: DailyContent;
        Insert: Partial<DailyContent>;
        Update: Partial<DailyContent>;
        Relationships: [];
      };
      user_progress: {
        Row: UserProgress;
        Insert: Partial<UserProgress> & { user_id: string; day_number: number };
        Update: Partial<UserProgress>;
        Relationships: [];
      };
      final_growth_plan: {
        Row: FinalGrowthPlan;
        Insert: Partial<FinalGrowthPlan> & { user_id: string };
        Update: Partial<FinalGrowthPlan>;
        Relationships: [];
      };
      app_config: {
        Row: AppConfig;
        Insert: Partial<AppConfig>;
        Update: Partial<AppConfig>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
