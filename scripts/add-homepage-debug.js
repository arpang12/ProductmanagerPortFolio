// Add debugging to HomePage component to see what's happening with projects data
import fs from 'fs';

const homePagePath = 'pages/HomePage.tsx';

// Read the current HomePage content
const homePageContent = fs.readFileSync(homePagePath, 'utf8');

// Add debug logging after the useEffect that fetches data
const debugCode = `
    // 🔍 DEBUG: Log data state changes
    useEffect(() => {
        console.log('🔍 HomePage Debug - Data State:');
        console.log('- projects:', projects?.length || 0, projects);
        console.log('- filteredProjects:', filteredProjects?.length || 0, filteredProjects);
        console.log('- myJourney:', myJourney ? 'Has data' : 'No data', myJourney);
        console.log('- myStory:', myStory ? 'Has data' : 'No data', myStory);
        console.log('- publicData:', getPublicPortfolioData?.());
    }, [projects, filteredProjects, myJourney, myStory]);`;

// Find the location to insert debug code (after the first useEffect)
const insertAfter = 'window.removeEventListener(\'publicPortfolioDataLoaded\', handleDataLoaded);';
const insertIndex = homePageContent.indexOf(insertAfter);

if (insertIndex === -1) {
    console.log('❌ Could not find insertion point in HomePage.tsx');
    console.log('Please manually add this debug code to HomePage.tsx:');
    console.log(debugCode);
} else {
    // Insert the debug code
    const beforeInsert = homePageContent.substring(0, insertIndex + insertAfter.length);
    const afterInsert = homePageContent.substring(insertIndex + insertAfter.length);
    
    const newContent = beforeInsert + '\n' + debugCode + '\n' + afterInsert;
    
    // Write the updated content
    fs.writeFileSync(homePagePath, newContent);
    console.log('✅ Added debug logging to HomePage.tsx');
    console.log('');
    console.log('🧪 Now test the page again:');
    console.log('1. Go to http://localhost:3002/u/admin');
    console.log('2. Open browser console (F12)');
    console.log('3. Look for "🔍 HomePage Debug - Data State:" messages');
    console.log('4. Check if projects array has data');
}

console.log('');
console.log('📋 What to look for in console:');
console.log('✅ Good: projects: 1 [array with project data]');
console.log('❌ Bad: projects: 0 [] (empty array)');
console.log('❌ Bad: projects: undefined or null');
console.log('');
console.log('If projects array is empty, the issue is in data fetching.');
console.log('If projects array has data, the issue is in rendering.');