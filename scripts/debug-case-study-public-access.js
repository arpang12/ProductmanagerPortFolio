// Debug why case studies aren't showing on public homepage
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Use anon key to simulate public access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPublicAccess() {
    console.log('🔍 Debugging Case Study Public Access\n');
    console.log('='.repeat(70));
    
    console.log('\n1️⃣  Testing exact query from getProjects()...\n');
    
    const { data, error } = await supabase
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
    
    if (error) {
        console.log('❌ ERROR:', error.message);
        console.log('   Code:', error.code);
        console.log('   Details:', error.details);
        console.log('   Hint:', error.hint);
        
        console.log('\n🔧 This is likely an RLS policy issue!');
        console.log('   The query works but RLS is blocking public access.');
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('⚠️  Query succeeded but returned no data');
        console.log('\n2️⃣  Checking if case studies exist at all...\n');
        
        const { data: allCS, error: allError } = await supabase
            .from('case_studies')
            .select('case_study_id, title, is_published, org_id');
        
        if (allError) {
            console.log('❌ ERROR:', allError.message);
            return;
        }
        
        console.log(`Found ${allCS?.length || 0} case studies:`);
        allCS?.forEach(cs => {
            console.log(`  - ${cs.title}`);
            console.log(`    Published: ${cs.is_published}`);
            console.log(`    Org ID: ${cs.org_id}`);
        });
        
        console.log('\n3️⃣  Checking user profile public status...\n');
        
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('org_id, username, is_portfolio_public');
        
        console.log('User profiles:');
        profiles?.forEach(p => {
            console.log(`  - Username: ${p.username}`);
            console.log(`    Org ID: ${p.org_id}`);
            console.log(`    Public: ${p.is_portfolio_public}`);
            
            // Check if this org has case studies
            const hasCS = allCS?.some(cs => cs.org_id === p.org_id);
            console.log(`    Has case studies: ${hasCS}`);
        });
        
        console.log('\n4️⃣  Checking RLS policy on case_studies...\n');
        
        const { data: policies, error: policyError } = await supabase
            .rpc('exec_sql', { 
                sql: `SELECT policyname, cmd, qual 
                      FROM pg_policies 
                      WHERE tablename = 'case_studies' 
                      AND cmd = 'SELECT'` 
            });
        
        if (policyError) {
            console.log('⚠️  Cannot check policies (requires admin access)');
        } else {
            console.log('Policies:', policies);
        }
        
        console.log('\n🔍 ROOT CAUSE ANALYSIS:');
        console.log('='.repeat(70));
        
        if (allCS && allCS.length > 0) {
            const publishedCS = allCS.filter(cs => cs.is_published);
            if (publishedCS.length === 0) {
                console.log('❌ No published case studies');
                console.log('   Solution: Publish your case studies from admin panel');
            } else {
                const profile = profiles?.[0];
                if (!profile?.is_portfolio_public) {
                    console.log('❌ Portfolio is not public');
                    console.log('   Solution: Set is_portfolio_public = true in user_profiles');
                } else {
                    console.log('❌ RLS policy is blocking access');
                    console.log('   Solution: Run FIX_PUBLIC_PORTFOLIO_RLS.sql');
                    console.log('   The policy should check both:');
                    console.log('     1. is_published = true');
                    console.log('     2. org_id IN (SELECT org_id FROM user_profiles WHERE is_portfolio_public = true)');
                }
            }
        } else {
            console.log('❌ No case studies exist');
            console.log('   Solution: Create case studies from admin panel');
        }
        
        return;
    }
    
    console.log('✅ SUCCESS! Found case studies:');
    data.forEach(cs => {
        console.log(`  - ${cs.title}`);
        console.log(`    ID: ${cs.case_study_id}`);
        console.log(`    Has hero section: ${cs.case_study_sections?.length > 0}`);
    });
    
    console.log('\n🎉 Case studies are accessible publicly!');
}

debugPublicAccess().catch(console.error);
