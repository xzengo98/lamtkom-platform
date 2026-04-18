declare module "@supabase/supabase-js" {
  interface SupabaseAuthClient {
    getUser(
      jwt?: string,
    ): Promise<{
      data: {
        user: {
          id: string;
          email?: string | null;
        } | null;
      };
      error: unknown | null;
    }>;

    getSession(): Promise<{
      data: {
        session: unknown | null;
      };
      error: unknown | null;
    }>;

    signUp(credentials: {
      email: string;
      password: string;
      options?: {
        data?: Record<string, unknown>;
        emailRedirectTo?: string;
      };
    }): Promise<{
      data: {
        user: {
          id: string;
          email?: string | null;
        } | null;
        session: unknown | null;
      };
      error: unknown | null;
    }>;

    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{
      data: {
        user: {
          id: string;
          email?: string | null;
        } | null;
        session: unknown | null;
      };
      error: unknown | null;
    }>;

    signOut(): Promise<{
      error: unknown | null;
    }>;

    resetPasswordForEmail(
      email: string,
      options?: {
        redirectTo?: string;
      },
    ): Promise<{
      data: unknown;
      error: unknown | null;
    }>;

    updateUser(attributes: {
      email?: string;
      password?: string;
      data?: Record<string, unknown>;
    }): Promise<{
      data: {
        user: {
          id: string;
          email?: string | null;
        } | null;
      };
      error: unknown | null;
    }>;
  }
}