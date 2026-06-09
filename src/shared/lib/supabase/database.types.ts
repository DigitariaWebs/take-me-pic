// Hand-authored to mirror supabase/migrations/0001_initial_schema.sql.
// Regenerate with: supabase gen types typescript --linked > database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PresenceStatus = 'available' | 'busy' | 'offline';
export type RequestStatus =
  | 'requested'
  | 'accepted'
  | 'in_session'
  | 'completed'
  | 'rated'
  | 'cancelled'
  | 'expired';
export type NotificationKind =
  | 'karma'
  | 'request'
  | 'community'
  | 'badge'
  | 'spot'
  | 'system';
export type AppRole = 'user' | 'moderator' | 'admin' | 'super_admin';
export type SubscriptionStatus =
  | 'active'
  | 'in_grace'
  | 'expired'
  | 'cancelled'
  | 'paused';

type Timestamp = string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          username: string;
          age: number | null;
          city: string | null;
          languages: string[];
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          karma: number;
          rating: number;
          photos_count: number;
          followers: number;
          following: number;
          spots_count: number;
          email_verified: boolean;
          phone: string | null;
          phone_verified: boolean;
          verified: boolean;
          is_premium: boolean;
          is_banned: boolean;
          member_since: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          first_name: string;
          username: string;
          last_name?: string | null;
          age?: number | null;
          city?: string | null;
          languages?: string[];
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          email_verified?: boolean;
          phone?: string | null;
          phone_verified?: boolean;
          verified?: boolean;
          is_premium?: boolean;
          is_banned?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      presence: {
        Row: {
          user_id: string;
          status: PresenceStatus;
          location: unknown | null;
          share_radius_m: number;
          updated_at: Timestamp;
        };
        Insert: {
          user_id: string;
          status?: PresenceStatus;
          location?: unknown | null;
          share_radius_m?: number;
        };
        Update: Partial<Database['public']['Tables']['presence']['Insert']>;
        Relationships: [];
      };
      help_requests: {
        Row: {
          id: number;
          requester_id: string;
          helper_id: string | null;
          status: RequestStatus;
          location: unknown;
          people_count: number;
          note: string | null;
          created_at: Timestamp;
          accepted_at: Timestamp | null;
          session_at: Timestamp | null;
          completed_at: Timestamp | null;
          expires_at: Timestamp;
        };
        Insert: {
          requester_id: string;
          location: unknown;
          helper_id?: string | null;
          status?: RequestStatus;
          people_count?: number;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['help_requests']['Insert']>;
        Relationships: [];
      };
      conversations: {
        Row: { id: number; help_request_id: number | null; created_at: Timestamp };
        Insert: { help_request_id?: number | null };
        Update: { help_request_id?: number | null };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: number;
          user_id: string;
          last_read_at: Timestamp | null;
        };
        Insert: {
          conversation_id: number;
          user_id: string;
          last_read_at?: Timestamp | null;
        };
        Update: { last_read_at?: Timestamp | null };
        Relationships: [];
      };
      messages: {
        Row: {
          id: number;
          conversation_id: number;
          sender_id: string;
          body: string | null;
          created_at: Timestamp;
        };
        Insert: { conversation_id: number; sender_id: string; body?: string | null };
        Update: { body?: string | null };
        Relationships: [];
      };
      session_photos: {
        Row: {
          id: number;
          help_request_id: number;
          uploader_id: string;
          storage_path: string;
          is_favorite: boolean;
          created_at: Timestamp;
        };
        Insert: {
          help_request_id: number;
          uploader_id: string;
          storage_path: string;
          is_favorite?: boolean;
        };
        Update: { is_favorite?: boolean };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: number;
          help_request_id: number;
          rater_id: string;
          ratee_id: string;
          stars: number;
          comment: string | null;
          created_at: Timestamp;
        };
        Insert: {
          help_request_id: number;
          rater_id: string;
          ratee_id: string;
          stars: number;
          comment?: string | null;
        };
        Update: { comment?: string | null };
        Relationships: [];
      };
      karma_ledger: {
        Row: {
          id: number;
          user_id: string;
          delta: number;
          reason: string;
          help_request_id: number | null;
          created_at: Timestamp;
        };
        Insert: {
          user_id: string;
          delta: number;
          reason: string;
          help_request_id?: number | null;
        };
        Update: never;
        Relationships: [];
      };
      spots: {
        Row: {
          id: number;
          name: string;
          city: string | null;
          location: unknown | null;
          rating: number;
          reviews_count: number;
          best_time: string | null;
          hero_url: string | null;
          created_by: string | null;
          is_sponsored: boolean;
          created_at: Timestamp;
        };
        Insert: {
          name: string;
          city?: string | null;
          best_time?: string | null;
          hero_url?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['spots']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: number;
          author_id: string;
          spot_id: number | null;
          city: string | null;
          created_at: Timestamp;
        };
        Insert: { author_id: string; spot_id?: number | null; city?: string | null };
        Update: { city?: string | null };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          kind: NotificationKind;
          body: string;
          created_at: Timestamp;
        };
        Insert: { user_id: string; kind: NotificationKind; body: string };
        Update: never;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: number;
          user_id: string;
          status: SubscriptionStatus;
          created_at: Timestamp;
        };
        Insert: { user_id: string; status?: SubscriptionStatus };
        Update: { status?: SubscriptionStatus };
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          user_id: string;
          first_name: string;
          last_name: string | null;
          username: string;
          avatar_url: string | null;
          karma: number;
          rank: number;
        };
      };
    };
    Functions: {
      find_available_helpers: {
        Args: { lat: number; lng: number; radius_m: number };
        Returns: Database['public']['Tables']['profiles']['Row'][];
      };
    };
    Enums: {
      presence_status: PresenceStatus;
      request_status: RequestStatus;
      notification_kind: NotificationKind;
      app_role: AppRole;
      subscription_status: SubscriptionStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
