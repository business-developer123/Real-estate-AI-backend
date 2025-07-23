import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

export const supabase = createClient(
    "https://fxxshejdaobjljkdtgio.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHNoZWpkYW9iamxqa2R0Z2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzQxMzUsImV4cCI6MjA2ODU1MDEzNX0.xhmx5wyhT3KdXRGBa7BBYlsfuwF_HtfaQkqLZPgqpxk   "
);
