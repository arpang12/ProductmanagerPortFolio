import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMagicToolbox() {
  console.log('🧪 Testing Magic Toolbox Implementation\n');

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Not authenticated. Please log in first.');
      return;
    }

    console.log('✅ Authenticated as:', user.email);

    // Get user's org_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ User profile not found');
      return;
    }

    console.log('✅ Org ID:', profile.org_id);

    // Check if skill_categories table has icon_url column
    console.log('\n📊 Checking database schema...');
    const { data: categories, error: catError } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('org_id', profile.org_id)
      .limit(1);

    if (catError) {
      console.error('❌ Error querying skill_categories:', catError.message);
      console.log('💡 You may need to run the migration: supabase/migrations/003_add_icon_url_to_toolbox.sql');
    } else {
      console.log('✅ skill_categories table accessible');
      if (categories && categories.length > 0) {
        console.log('   Sample category:', categories[0]);
      }
    }

    // Check tools table
    const { data: tools, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .eq('org_id', profile.org_id)
      .limit(1);

    if (toolError) {
      console.error('❌ Error querying tools:', toolError.message);
    } else {
      console.log('✅ tools table accessible');
      if (tools && tools.length > 0) {
        console.log('   Sample tool:', tools[0]);
      }
    }

    // Fetch all categories with skills
    console.log('\n📦 Fetching Magic Toolbox data...');
    const { data: allCategories, error: fetchError } = await supabase
      .from('skill_categories')
      .select(`
        *,
        skills (*)
      `)
      .eq('org_id', profile.org_id)
      .order('order_key');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError.message);
    } else {
      console.log(`✅ Found ${allCategories.length} categories`);
      allCategories.forEach(cat => {
        console.log(`   - ${cat.title}: ${cat.skills?.length || 0} skills`);
      });
    }

    // Fetch all tools
    const { data: allTools, error: toolsFetchError } = await supabase
      .from('tools')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('order_key');

    if (toolsFetchError) {
      console.error('❌ Error fetching tools:', toolsFetchError.message);
    } else {
      console.log(`✅ Found ${allTools.length} tools`);
      allTools.forEach(tool => {
        console.log(`   - ${tool.name} ${tool.icon}`);
      });
    }

    console.log('\n✅ Magic Toolbox test complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. If you see schema errors, run: npm run db:push');
    console.log('   2. Open the admin panel and add categories/tools');
    console.log('   3. Check the homepage to see them displayed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMagicToolbox();
