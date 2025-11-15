import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('🔍 Diagnosing Homepage Projects Issue\n');
  console.log('='.repeat(70));
  
  try {
    // Check 1: Does is_published column exist?
    console.log('\n📋 Step 1: Checking if is_published column exists...');
    const { data: columns, error: colError } = await supabase
      .from('case_studies')
      .select('*')
      .limit(1);
    
    if (colError) {
      console.log('❌ Error querying case_studies:', colError.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      const hasPublished = 'is_published' in columns[0];
      console.log(hasPublished ? '✅ is_published column exists' : '❌ is_published column MISSING');
      
      if (!hasPublished) {
        console.log('\n💡 Solution: Run this SQL in Supabase SQL Editor:');
        console.log('ALTER TABLE case_studies ADD COLUMN is_published BOOLEAN DEFAULT false;');
        console.log('UPDATE case_studies SET is_published = true;');
        return;
      }
    }
    
    // Check 2: How many case studies exist?
    console.log('\n📋 Step 2: Checking total case studies...');
    const { count: totalCount, error: countError } = await supabase
      .from('case_studies')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting:', countError.message);
    } else {
      console.log(`✅ Total case studies: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log('⚠️  No case studies found! Create one in the Admin page.');
        return;
      }
    }
    
    // Check 3: How many are published?
    console.log('\n📋 Step 3: Checking published case studies...');
    const { data: allStudies, error: allError } = await supabase
      .from('case_studies')
      .select('case_study_id, title, is_published, created_at');
    
    if (allError) {
      console.log('❌ Error:', allError.message);
    } else {
      console.log(`\n📊 Case Studies Status:`);
      allStudies.forEach(cs => {
        const status = cs.is_published ? '✅ Published' : '❌ Not Published';
        console.log(`   ${status} - ${cs.title} (${cs.case_study_id})`);
      });
      
      const publishedCount = allStudies.filter(cs => cs.is_published).length;
      console.log(`\n📈 Summary: ${publishedCount} published out of ${allStudies.length} total`);
      
      if (publishedCount === 0) {
        console.log('\n💡 Solution: Run this SQL:');
        console.log('UPDATE case_studies SET is_published = true;');
        return;
      }
    }
    
    // Check 4: Do published studies have hero sections?
    console.log('\n📋 Step 4: Checking hero sections...');
    const { data: withHero, error: heroError } = await supabase
      .from('case_studies')
      .select(`
        case_study_id,
        title,
        is_published,
        case_study_sections!inner(section_id, section_type)
      `)
      .eq('is_published', true)
      .eq('case_study_sections.section_type', 'hero');
    
    if (heroError) {
      console.log('❌ Error:', heroError.message);
    } else {
      console.log(`✅ Published case studies with hero sections: ${withHero.length}`);
      
      if (withHero.length === 0) {
        console.log('⚠️  No published case studies have hero sections!');
        console.log('💡 Solution: Edit your case studies and ensure hero section is enabled.');
        return;
      }
      
      withHero.forEach(cs => {
        console.log(`   ✅ ${cs.title} - has hero section`);
      });
    }
    
    // Check 5: Test the exact query used by getProjects()
    console.log('\n📋 Step 5: Testing getProjects() query...');
    const { data: projects, error: projError } = await supabase
      .from('case_studies')
      .select(`
        case_study_id,
        title,
        hero_image_asset_id,
        is_published,
        assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
        case_study_sections!inner (content)
      `)
      .eq('is_published', true)
      .eq('case_study_sections.section_type', 'hero');
    
    if (projError) {
      console.log('❌ Query Error:', projError.message);
      console.log('   Details:', projError);
      
      if (projError.message.includes('is_published')) {
        console.log('\n💡 The is_published column is missing!');
        console.log('   Run: ALTER TABLE case_studies ADD COLUMN is_published BOOLEAN DEFAULT true;');
      }
    } else {
      console.log(`✅ Query successful! Found ${projects.length} projects`);
      
      if (projects.length === 0) {
        console.log('\n⚠️  Query returned 0 results even though published studies exist!');
        console.log('   This means the hero section filter is too strict.');
      } else {
        console.log('\n🎉 Projects that should appear on homepage:');
        projects.forEach(p => {
          console.log(`   ✅ ${p.title}`);
          console.log(`      - ID: ${p.case_study_id}`);
          console.log(`      - Has image: ${p.hero_image_asset_id ? 'Yes' : 'No'}`);
          console.log(`      - Image URL: ${p.assets?.cloudinary_url || 'None'}`);
        });
      }
    }
    
    // Check 6: RLS Policies
    console.log('\n📋 Step 6: Checking RLS policies...');
    const { data: policies, error: polError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT * FROM pg_policies WHERE tablename = 'case_studies' AND cmd = 'SELECT';` 
      })
      .catch(() => ({ data: null, error: { message: 'Cannot check policies (requires admin)' } }));
    
    if (polError || !policies) {
      console.log('⚠️  Cannot check RLS policies (requires admin access)');
      console.log('   Make sure you have a SELECT policy for published case studies');
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 DIAGNOSIS SUMMARY:\n');
    
    if (projects && projects.length > 0) {
      console.log('✅ Everything looks good! Projects should be visible.');
      console.log('\n💡 If still not showing:');
      console.log('   1. Clear browser cache (Ctrl+Shift+R)');
      console.log('   2. Check browser console for errors (F12)');
      console.log('   3. Verify you\'re not in development mode');
    } else {
      console.log('❌ Issues found. Follow the solutions above.');
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected Error:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  console.log('\n' + '='.repeat(70));
}

diagnose();
