import fs from 'fs';

// Read the current API file
const apiContent = fs.readFileSync('services/api.ts', 'utf8');

// Find the end of the verifyDataSymmetry method
const lines = apiContent.split('\n');
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('publicCount') && lines[i].includes('}') && 
      i + 5 < lines.length && 
      lines[i + 1].includes('}') && 
      lines[i + 2].includes('catch') &&
      lines[i + 5].includes('}') &&
      lines[i + 6].includes('}')) {
    endIndex = i + 6;
    break;
  }
}

if (endIndex === -1) {
  console.log('Could not find the end of verifyDataSymmetry method');
  process.exit(1);
}

console.log('Found end of verifyDataSymmetry at line:', endIndex + 1);

// Keep only the content up to the end of verifyDataSymmetry
const cleanContent = lines.slice(0, endIndex + 1).join('\n');

// Add the portfolio methods
const portfolioMethods = `,

  // Portfolio Publishing Methods
  async getPortfolioStatus(): Promise<{
    status: 'draft' | 'published';
    lastPublished?: string;
    version?: number;
    publicUrl?: string;
    username?: string;
  }> {
    if (isDevelopmentMode) {
      return {
        status: 'draft',
        username: 'demo-user',
        publicUrl: \`\${window.location.origin}/u/demo-user\`
      };
    }

    const orgId = await getUserOrgId();
    if (!orgId) throw new Error('User not authenticated');

    // Get profile with portfolio status
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('portfolio_status, username')
      .eq('org_id', orgId)
      .single();

    if (profileError) throw profileError;

    return {
      status: profile.portfolio_status || 'draft',
      username: profile.username,
      publicUrl: profile.username ? \`\${window.location.origin}/u/\${profile.username}\` : undefined
    };
  },

  async publishPortfolio(): Promise<{ success: boolean; message: string; publicUrl?: string }> {
    if (isDevelopmentMode) {
      return {
        success: true,
        message: 'Portfolio published successfully (development mode)',
        publicUrl: \`\${window.location.origin}/u/demo-user\`
      };
    }

    const orgId = await getUserOrgId();
    if (!orgId) throw new Error('User not authenticated');

    // Check if user has username
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('org_id', orgId)
      .single();

    if (!profile?.username) {
      throw new Error('Username required. Please set up your username in Profile Settings first.');
    }

    // Update portfolio status to published
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ portfolio_status: 'published' })
      .eq('org_id', orgId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Portfolio published successfully!',
      publicUrl: \`\${window.location.origin}/u/\${profile.username}\`
    };
  },

  async unpublishPortfolio(): Promise<{ success: boolean; message: string }> {
    if (isDevelopmentMode) {
      return {
        success: true,
        message: 'Portfolio unpublished successfully (development mode)'
      };
    }

    const orgId = await getUserOrgId();
    if (!orgId) throw new Error('User not authenticated');

    // Update portfolio status to draft
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ portfolio_status: 'draft' })
      .eq('org_id', orgId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Portfolio unpublished successfully!'
    };
  }
}`;

// Write the fixed content
fs.writeFileSync('services/api.ts', cleanContent + portfolioMethods);
console.log('✅ API file fixed with portfolio methods added');