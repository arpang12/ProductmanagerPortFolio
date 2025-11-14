import crypto from 'crypto';

// Test Cloudinary signature generation
function testCloudinarySignature() {
  console.log('🔍 Testing Cloudinary Signature Generation\n');
  
  // Test parameters (similar to what the Edge Function generates)
  const params = {
    folder: 'production/arpan-portfolio',
    public_id: 'production/arpan-portfolio/asset_TEST123',
    resource_type: 'image',
    timestamp: '1761538817',
    transformation: 'c_limit,w_2048,h_2048,q_85,f_auto'
  };
  
  const apiSecret = '3QaG8YL1EssmhKNWmgOedqkFdUc'; // Your Cloudinary API secret
  
  console.log('Parameters to sign:', params);
  
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  console.log('Sorted params string:', sortedParams);
  
  // Create string to sign
  const stringToSign = sortedParams + apiSecret;
  console.log('String to sign:', stringToSign);
  
  // Generate SHA1 signature
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
  console.log('Generated signature:', signature);
  
  // Test with the exact parameters from the error
  console.log('\n🔍 Testing with error parameters:');
  const errorParams = {
    folder: 'production/arpan-portfolio',
    public_id: 'production/arpan-portfolio/asset_MH8MQAAFXXPJZIDNIKH',
    resource_type: 'image',
    timestamp: '1761538817',
    transformation: 'c_limit,w_2048,h_2048,q_85,f_auto'
  };
  
  const errorSortedParams = Object.keys(errorParams)
    .sort()
    .map(key => `${key}=${errorParams[key]}`)
    .join('&');
  
  console.log('Error sorted params:', errorSortedParams);
  
  const errorStringToSign = errorSortedParams + apiSecret;
  console.log('Error string to sign:', errorStringToSign);
  
  const errorSignature = crypto.createHash('sha1').update(errorStringToSign).digest('hex');
  console.log('Correct signature should be:', errorSignature);
  console.log('Error signature was:', 'a4898c472456051a60b7881416b3a535615e9756');
  console.log('Signatures match:', errorSignature === 'a4898c472456051a60b7881416b3a535615e9756');
}

testCloudinarySignature();