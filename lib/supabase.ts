
// Supabase desativado para testes via LocalStorage
export const isSupabaseConfigured = false;

// Mock do cliente para evitar erros de compilação em imports existentes
export const supabase = {
    from: () => ({
        select: () => ({
            eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
            order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
} as any;
