/**
 * DEVTOOLS BACK BUTTON VERIFICATION
 * 
 * Copy and paste this entire script into Chrome DevTools Console
 * when viewing a case study page to verify the back button.
 */

console.clear();
console.log('%c🔍 BACK BUTTON VERIFICATION SCRIPT', 'font-size: 16px; font-weight: bold; color: #4CAF50');
console.log('%c━'.repeat(50), 'color: #4CAF50');

// Find the back button
const backButton = document.querySelector('button[class*="fixed"][class*="top-24"]');

if (!backButton) {
  console.log('%c❌ FAILED: Back button not found!', 'font-size: 14px; color: #f44336; font-weight: bold');
  console.log('\n%c📋 Troubleshooting:', 'font-weight: bold');
  console.log('  1. Make sure you are on a case study page (/case-study/...)');
  console.log('  2. Check if the latest code is deployed');
  console.log('  3. Try hard refresh (Ctrl+Shift+R)');
  console.log('  4. Check console for JavaScript errors');
  console.log('\n%c💡 Current URL:', 'font-weight: bold', window.location.href);
} else {
  console.log('%c✅ SUCCESS: Back button found!', 'font-size: 14px; color: #4CAF50; font-weight: bold');
  
  // Get computed styles
  const styles = window.getComputedStyle(backButton);
  const rect = backButton.getBoundingClientRect();
  
  // Display button information
  console.log('\n%c📊 Button Properties:', 'font-weight: bold; font-size: 13px');
  console.table({
    'Text Content': backButton.textContent.trim(),
    'Position': styles.position,
    'Z-Index': styles.zIndex,
    'Top': styles.top,
    'Left': styles.left,
    'Display': styles.display,
    'Visibility': styles.visibility,
    'Opacity': styles.opacity,
    'Background': styles.backgroundColor,
    'Width': `${rect.width.toFixed(2)}px`,
    'Height': `${rect.height.toFixed(2)}px`
  });
  
  // Critical checks
  console.log('\n%c🧪 Critical Checks:', 'font-weight: bold; font-size: 13px');
  
  const checks = [
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
      expected: 'visible & not none',
      actual: `${styles.visibility}, ${styles.display}`
    },
    {
      name: 'Fully Opaque',
      pass: parseFloat(styles.opacity) === 1,
      expected: '1',
      actual: styles.opacity
    },
    {
      name: 'Contains "Back"',
      pass: backButton.textContent.toLowerCase().includes('back'),
      expected: 'Contains "back"',
      actual: backButton.textContent.trim()
    },
    {
      name: 'In Viewport',
      pass: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
      expected: 'Within viewport',
      actual: rect.top >= 0 && rect.left >= 0 ? 'Yes' : 'No'
    }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    const icon = check.pass ? '✅' : '❌';
    const color = check.pass ? '#4CAF50' : '#f44336';
    console.log(`%c${icon} ${check.name}`, `color: ${color}; font-weight: bold`, `→ ${check.actual}`);
    if (!check.pass) {
      console.log(`   %cExpected: ${check.expected}`, 'color: #ff9800');
      allPassed = false;
    }
  });
  
  // Template detection
  console.log('\n%c🎨 Template Detection:', 'font-weight: bold; font-size: 13px');
  const bodyClasses = document.body.className;
  let detectedTemplate = 'Default';
  
  if (bodyClasses.includes('ghibli') || document.querySelector('[class*="ghibli"]')) {
    detectedTemplate = 'Ghibli';
  } else if (bodyClasses.includes('modern') || document.querySelector('[class*="modern"]')) {
    detectedTemplate = 'Modern';
  }
  
  console.log(`  Current Template: %c${detectedTemplate}`, 'font-weight: bold; color: #2196F3');
  
  // Highlight the button
  console.log('\n%c💡 Highlighting button for 3 seconds...', 'font-style: italic');
  backButton.style.outline = '4px solid #ff0000';
  backButton.style.outlineOffset = '2px';
  backButton.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
  
  setTimeout(() => {
    backButton.style.outline = '';
    backButton.style.outlineOffset = '';
    backButton.style.boxShadow = '';
    console.log('%c✨ Highlight removed', 'font-style: italic; color: #999');
  }, 3000);
  
  // Final result
  console.log('\n%c' + '━'.repeat(50), 'color: #4CAF50');
  if (allPassed) {
    console.log('%c✅ ALL CHECKS PASSED!', 'font-size: 16px; font-weight: bold; color: #4CAF50');
    console.log('%cThe back button is properly implemented and functional.', 'color: #4CAF50');
  } else {
    console.log('%c⚠️ SOME CHECKS FAILED', 'font-size: 16px; font-weight: bold; color: #ff9800');
    console.log('%cReview the failed checks above for details.', 'color: #ff9800');
  }
  console.log('%c' + '━'.repeat(50), 'color: #4CAF50');
  
  // Test click functionality
  console.log('\n%c🎯 Click Test:', 'font-weight: bold; font-size: 13px');
  console.log('  Click the highlighted button to test navigation.');
  console.log('  It should return you to the homepage.');
}

// Add helper function to window
window.checkBackButton = function() {
  eval(document.currentScript?.textContent || checkBackButton.toString());
};

console.log('\n%c💡 TIP: Run checkBackButton() to re-run this test anytime', 'font-style: italic; color: #2196F3');
