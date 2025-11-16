/**
 * Back Button Verification Script
 * 
 * This script helps verify that back buttons are present in all case study templates.
 * Run this in the browser DevTools Console when viewing a case study page.
 */

console.log('🔍 Starting Back Button Verification...\n');

// Check if back button exists
const backButton = document.querySelector('button[class*="fixed"][class*="top-24"]');

if (!backButton) {
  console.error('❌ FAILED: Back button not found!');
  console.log('\n📋 Troubleshooting steps:');
  console.log('1. Make sure you are on a case study page');
  console.log('2. Check if the latest code is deployed');
  console.log('3. Try hard refresh (Ctrl+Shift+R)');
  console.log('4. Check console for JavaScript errors');
} else {
  console.log('✅ PASSED: Back button found!\n');
  
  // Get computed styles
  const styles = window.getComputedStyle(backButton);
  
  // Verification checks
  const checks = {
    'Button Text': backButton.textContent.trim(),
    'Position': styles.position,
    'Z-Index': styles.zIndex,
    'Top Position': styles.top,
    'Left Position': styles.left,
    'Display': styles.display,
    'Visibility': styles.visibility,
    'Opacity': styles.opacity,
  };
  
  console.log('📊 Button Properties:');
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  // Verify critical properties
  console.log('\n🧪 Critical Checks:');
  
  const criticalChecks = [
    {
      name: 'Fixed Position',
      pass: styles.position === 'fixed',
      expected: 'fixed',
      actual: styles.position
    },
    {
      name: 'High Z-Index',
      pass: parseInt(styles.zIndex) >= 50,
      expected: '≥ 50',
      actual: styles.zIndex
    },
    {
      name: 'Visible',
      pass: styles.visibility === 'visible' && styles.display !== 'none',
      expected: 'visible',
      actual: `${styles.visibility}, ${styles.display}`
    },
    {
      name: 'Fully Opaque',
      pass: parseFloat(styles.opacity) === 1,
      expected: '1',
      actual: styles.opacity
    },
    {
      name: 'Contains "Back" Text',
      pass: backButton.textContent.toLowerCase().includes('back'),
      expected: 'Contains "back"',
      actual: backButton.textContent.trim()
    }
  ];
  
  let allPassed = true;
  criticalChecks.forEach(check => {
    const icon = check.pass ? '✅' : '❌';
    console.log(`  ${icon} ${check.name}: ${check.actual}`);
    if (!check.pass) {
      console.log(`     Expected: ${check.expected}`);
      allPassed = false;
    }
  });
  
  // Check button functionality
  console.log('\n🎯 Functionality Checks:');
  
  const hasClickHandler = backButton.onclick !== null || 
                          backButton.getAttribute('onclick') !== null;
  console.log(`  ${hasClickHandler ? '✅' : '⚠️'} Click Handler: ${hasClickHandler ? 'Present' : 'Check React event listeners'}`);
  
  // Highlight the button
  console.log('\n💡 Highlighting button for 3 seconds...');
  backButton.style.outline = '4px solid red';
  backButton.style.outlineOffset = '2px';
  setTimeout(() => {
    backButton.style.outline = '';
    backButton.style.outlineOffset = '';
  }, 3000);
  
  // Final result
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('The back button is properly implemented.');
  } else {
    console.log('⚠️ SOME CHECKS FAILED');
    console.log('Review the failed checks above.');
  }
  console.log('='.repeat(50));
  
  // Template detection
  console.log('\n🎨 Template Detection:');
  const templateIndicators = {
    'Ghibli': document.querySelector('[class*="ghibli"]') !== null,
    'Modern': document.querySelector('[class*="modern"]') !== null,
    'Default': true // fallback
  };
  
  const detectedTemplate = Object.entries(templateIndicators)
    .find(([name, present]) => present && name !== 'Default')?.[0] || 'Default';
  
  console.log(`  Current Template: ${detectedTemplate}`);
}

// Additional helper function
console.log('\n💡 Helper: Run verifyBackButton() anytime to re-check');
window.verifyBackButton = function() {
  console.clear();
  eval(document.currentScript?.textContent || arguments.callee.toString());
};
