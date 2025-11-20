import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function applyRLSFix() {
  console.log('🔧 Applying RLS Fix...\n');
  
  try {
    // Read the SQL fix file
    const sqlFix = fs.readFileSync('FIX_RLS_PROFILE_CREATION_NOW.sql', 'utf8');
    
    // Split into individual statements (rough approach)
    const statements = sqlFix
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Login first to get proper permissions
    console.log('1. Logging in...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('SELECT') && statement.includes('pg_policies')) {
        console.log(`\n${i + 1}. Checking policies...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log('Note: Policy check failed (expected in some cases)');
        } else {
          console.log('✅ Policy check completed');
        }
      } else if (statement.includes('ALTER TABLE') || statement.includes('DROP POLICY') || statement.includes('CREATE POLICY') || statement.includes('GRANT')) {
        console.log(`\n${i + 1}. Executing: ${statement.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Failed: ${error.message}`);
        } else {
          console.log('✅ Success');
        }
      }
    }
    
    console.log('\n🎉 RLS fix application completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.log('\n💡 Alternative approach: Apply the SQL fix manually in Supabase Dashboard');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of FIX_RLS_PROFILE_CREATION_NOW.sql');
    console.log('4. Execute the SQL statements');
  }
}

applyRLSFix().catch(console.error);