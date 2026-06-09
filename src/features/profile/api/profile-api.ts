import { supabase } from '@/shared/lib/supabase';
import type { Tables, TablesInsert } from '@/shared/lib/supabase';

export type Profile = Tables<'profiles'>;
export type CreateProfileInput = TablesInsert<'profiles'>;
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
