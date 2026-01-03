
export type AdErrorType = 'BLOCKER' | 'NETWORK' | 'SKIP' | 'INITIALIZING' | 'UNKNOWN';

export interface AdResult {
  success: boolean;
  error?: string;
  errorType?: AdErrorType;
}

export const showRewardedAd = async (retryCount = 0): Promise<AdResult> => {
  return new Promise((resolve) => {
    // Check for ad SDK
    if (typeof window.show_10331054 === 'function') {
      console.log(`[AdService] Initiating Monetag Ad (Attempt ${retryCount + 1})...`);
      
      window.show_10331054()
        .then(() => {
          console.log("[AdService] Ad completed successfully.");
          resolve({ success: true });
        })
        .catch(async (err: any) => {
          const errorMessage = err?.message || String(err) || "Unknown Error";
          console.error("[AdService] Ad event failed:", errorMessage);
          
          const isNetwork = errorMessage.toLowerCase().includes('network') || 
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('cors') ||
                            errorMessage.toLowerCase().includes('failed to load') ||
                            errorMessage === 'TypeError: Failed to fetch';

          // Increase retries to 2 for network errors (total 3 attempts)
          if (isNetwork && retryCount < 2) {
            const delay = 3000 * (retryCount + 1);
            console.warn(`[AdService] Network error detected. Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            resolve(await showRewardedAd(retryCount + 1));
            return;
          }

          if (isNetwork) {
            resolve({ 
              success: false, 
              errorType: 'NETWORK',
              error: "Connection to ad server failed. If you are using a VPN, Proxy, or Ad-Blocker (like AdGuard), please disable it and try again." 
            });
          } else {
            // Likely user skipped/closed the ad
            resolve({ 
              success: false, 
              errorType: 'SKIP',
              error: "The video advertisement must be completed in full to reveal the secure content link." 
            });
          }
        });
    } else {
      // SDK Detection Logic
      const adScript = document.querySelector('script[src*="libtl.com"]');
      
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log("[AdService] Bypassing ads in local development.");
        resolve({ success: true });
        return;
      }

      if (!adScript) {
        resolve({ 
          success: false, 
          errorType: 'BLOCKER',
          error: "Ad-Blocker detected. Please disable any browser extensions or system-wide ad blockers to continue." 
        });
      } else {
        // Script is there but function isn't ready yet
        if (retryCount < 2) {
           console.log(`[AdService] SDK not ready, waiting... (Attempt ${retryCount + 1})`);
           setTimeout(async () => {
             resolve(await showRewardedAd(retryCount + 1));
           }, 2000);
        } else {
          resolve({ 
            success: false, 
            errorType: 'INITIALIZING',
            error: "The advertisement system is still initializing. Please wait a few seconds and try again." 
          });
        }
      }
    }
  });
};
