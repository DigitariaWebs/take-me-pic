import { supabase } from '@/shared/lib/supabase';
import type { Tables, TablesInsert } from '@/shared/lib/supabase';

export type Profile = Tables<'profiles'>;
type ProfileInsert = TablesInsert<'profiles'>;
export type CreateProfileInput = Pick<
  ProfileInsert,
  'id' | 'first_name' | 'username' | 'last_name' | 'age' | 'city' | 'languages' | 'bio' | 'phone'
>;
export type UpdateProfileInput = Partial<Omit<CreateProfileInput, 'id'>>;
export type LeaderboardEntry = {
  user_id: string;
  first_name: string;
  last_name: string | null;
  username: string;
  avatar_url: string | null;
  karma: number;
  rank: number;
};

export const profileApi = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(input: CreateProfileInput): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(input as never)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, input: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(input as never)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
