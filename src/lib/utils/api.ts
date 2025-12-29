import { apiClient } from '../api/client';
import { ENV } from '../../config/env';

/**
 * Check API server status
 * Can be called from console: checkApiServer()
 */
export async function checkApiServer(): Promise<void> {
  console.log('🔍 [API Check] Checking server status...');
  console.log('📍 [API Check] Base URL:', ENV.NEXT_PUBLIC_API_URL);

  try {
    const status = await apiClient.checkServerStatus();
    
    if (status.isOnline) {
      console.log('✅ [API Check] Server is ONLINE');
      console.log('  - Base URL:', status.baseUrl);
      console.log('  - Response Time:', `${status.responseTime}ms`);
      console.log('  - Status Code:', status.statusCode);
    } else {
      console.error('❌ [API Check] Server is OFFLINE');
      console.error('  - Base URL:', status.baseUrl);
      console.error('  - Error:', status.error);
      console.error('  - Response Time:', `${status.responseTime}ms`);
      if (status.statusCode) {
        console.error('  - Status Code:', status.statusCode);
      }
      console.error('\n💡 [API Check] Possible causes:');
      console.error('  1. API server is not running');
      console.error('  2. Network connection issue');
      console.error('  3. SSL certificate problem');
      console.error('  4. Firewall blocking the connection');
    }
  } catch (error) {
    console.error('❌ [API Check] Failed to check server:', error);
  }
}

/**
 * Get API configuration info
 */
export function getApiInfo(): void {
  console.log('📋 [API Info] Configuration:');
  console.log('  - Base URL:', ENV.NEXT_PUBLIC_API_URL);
  console.log('  - Timeout:', `${ENV.API_TIMEOUT}ms`);
  console.log('  - Logging:', ENV.ENABLE_LOGGING ? 'Enabled' : 'Disabled');
}

/**
 * Test API server from browser (for manual testing)
 * Provides URLs to test in browser
 */
export function testApiInBrowser(): void {
  const baseUrl = ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  
  console.log('🌐 [Browser Test] Test API server in browser:');
  console.log('  📍 Health endpoint:');
  console.log(`     ${baseUrl}/health`);
  console.log('  📍 Auth endpoint (should return 404 or method not allowed):');
  console.log(`     ${baseUrl}/auth/login`);
  console.log('\n💡 Instructions:');
  console.log('  1. Copy URL above and paste in browser');
  console.log('  2. If you see response → Server is running');
  console.log('  3. If timeout/error → Server is down or network issue');
  console.log('  4. Check Heroku dashboard: https://dashboard.heroku.com/apps');
  console.log(`  5. Heroku app: siu-printing-api-dd69b873f047`);
}

/**
 * Test basic network connectivity
 */
export async function testNetworkConnectivity(): Promise<void> {
  console.log('🌐 [Network Test] Testing connectivity...');
  
  const tests = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Heroku API', url: ENV.NEXT_PUBLIC_API_URL },
  ];

  for (const test of tests) {
    try {
      const startTime = Date.now();
      const timeout = 5000;
      
      // Create AbortController for timeout (React Native compatible)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(test.url, {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ [Network Test] ${test.name}: OK (${responseTime}ms, status: ${response.status})`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
      console.error(`❌ [Network Test] ${test.name}: FAILED - ${errorMessage}`);
      if (isTimeout) {
        console.error(`   ⏱️ Request timed out after 5s`);
      }
    }
  }
}

/**
 * Get diagnostic information for API connection issues
 */
export function getApiDiagnostics(): void {
  const baseUrl = ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  
  console.log('🔧 [API Diagnostics] Troubleshooting guide:');
  console.log('\n1️⃣ Check Heroku App Status:');
  console.log('   - Visit: https://dashboard.heroku.com/apps/siu-printing-api-dd69b873f047');
  console.log('   - Check if app is "Running" or "Idle"');
  console.log('   - Free tier apps sleep after 30min inactivity');
  console.log('   - Wake up app if needed');
  
  console.log('\n2️⃣ Test from Browser:');
  console.log(`   - Open: ${baseUrl}/health`);
  console.log('   - If browser shows response → Server OK, issue is in React Native');
  console.log('   - If browser timeout → Server is down');
  
  console.log('\n3️⃣ Test from Command Line (if available):');
  console.log(`   - curl ${baseUrl}/health`);
  console.log('   - Or: curl -I ${baseUrl}/auth/login');
  
  console.log('\n4️⃣ Check Android Emulator Network:');
  console.log('   - Ensure emulator has internet access');
  console.log('   - Try: ping google.com from emulator shell');
  console.log('   - Check Android Network Security Config');
  
  console.log('\n5️⃣ Common Heroku Issues:');
  console.log('   - App sleeping (free tier) → Takes 10-30s to wake');
  console.log('   - SSL certificate → Heroku uses valid certs');
  console.log('   - CORS → Should not affect health check');
  
  console.log('\n6️⃣ React Native Specific:');
  console.log('   - Android: Check android/app/src/main/AndroidManifest.xml');
  console.log('   - Network security config may block connections');
  console.log('   - Try: adb shell "ping -c 3 google.com"');
}

