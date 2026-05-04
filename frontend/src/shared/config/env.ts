export const ENV = {
  // Update Gateway URL when available (currently pointing to Auth as fallback)
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3001', 
  AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3001',
  USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3002',
};
