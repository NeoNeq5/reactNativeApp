import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eprchltdnctqyylvbyzf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmNobHRkbmN0cXl5bHZieXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMzOTQ0OTcsImV4cCI6MjAzODk3MDQ5N30.xnLs4P7ztQqh9KkDcYLZC8Vi8TVZBuzCtROcN95y3pc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})