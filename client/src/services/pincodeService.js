// agri-drone-accounts/client/src/services/pincodeService.js

// Production-Ready Pincode to Location Service
// This service uses official APIs for accurate pincode data

// Configuration for different pincode APIs
const API_CONFIG = {
  // Primary API - India Post API (Official Government API)
  indiaPost: {
    baseUrl: 'https://api.postalpincode.in/pincode',
    enabled: true,
    timeout: 5000
  },

  // Secondary API - Postal Pin Code API
  postalApi: {
    baseUrl: 'http://www.postalpincode.in/api/pincode',
    enabled: true,
    timeout: 5000
  },

  // Tertiary API - Zippopotam.us (International but supports India)
  zippopotam: {
    baseUrl: 'http://api.zippopotam.us/IN',
    enabled: true,
    timeout: 5000
  }
};

// Fallback data for critical pincodes (in case all APIs fail)
const fallbackPincodeData = {
  // Major cities - Essential fallback data
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '560001': { city: 'Bangalore', state: 'Karnataka' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '431203': { city: 'Jalna', state: 'Maharashtra' }
};

// Cache for API responses to avoid repeated calls
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Utility function to create timeout promise
const createTimeoutPromise = (timeout) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

// API call functions for different services
const apiServices = {
  // India Post API - Official Government API
  async indiaPost(pincode) {
    const url = `${API_CONFIG.indiaPost.baseUrl}/${pincode}`;
    const response = await Promise.race([
      fetch(url),
      createTimeoutPromise(API_CONFIG.indiaPost.timeout)
    ]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        success: true,
        data: {
          pincode,
          city: postOffice.District || postOffice.Name,
          state: postOffice.State,
          district: postOffice.District,
          area: postOffice.Name
        }
      };
    }

    throw new Error('No data found');
  },

  // Postal API - Alternative service
  async postalApi(pincode) {
    const url = `${API_CONFIG.postalApi.baseUrl}/${pincode}`;
    const response = await Promise.race([
      fetch(url),
      createTimeoutPromise(API_CONFIG.postalApi.timeout)
    ]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
      const postOffice = data.PostOffice[0];
      return {
        success: true,
        data: {
          pincode,
          city: postOffice.District || postOffice.Name,
          state: postOffice.State,
          district: postOffice.District,
          area: postOffice.Name
        }
      };
    }

    throw new Error('No data found');
  },

  // Zippopotam API - International service with India support
  async zippopotam(pincode) {
    const url = `${API_CONFIG.zippopotam.baseUrl}/${pincode}`;
    const response = await Promise.race([
      fetch(url),
      createTimeoutPromise(API_CONFIG.zippopotam.timeout)
    ]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.places && data.places.length > 0) {
      const place = data.places[0];
      return {
        success: true,
        data: {
          pincode,
          city: place['place name'],
          state: place['state'],
          district: place['place name'],
          area: place['place name']
        }
      };
    }

    throw new Error('No data found');
  }
};

export const pincodeService = {
  // Get location details by pincode
  getLocationByPincode: async (pincode) => {
    try {
      // Validate pincode format
      if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        return {
          success: false,
          message: 'Invalid pincode format. Please enter a 6-digit pincode.'
        };
      }

      // Check cache first
      const cacheKey = `pincode_${pincode}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        return {
          success: true,
          data: cachedData.data,
          source: 'cache'
        };
      }

      // Try APIs in order of preference
      const apiOrder = ['indiaPost', 'postalApi', 'zippopotam'];
      let lastError = null;

      for (const apiName of apiOrder) {
        if (!API_CONFIG[apiName]?.enabled) continue;

        try {
          console.log(`Trying ${apiName} API for pincode ${pincode}`);
          const result = await apiServices[apiName](pincode);

          if (result.success) {
            // Cache the successful result
            cache.set(cacheKey, {
              data: result.data,
              timestamp: Date.now()
            });

            return {
              success: true,
              data: result.data,
              source: apiName
            };
          }
        } catch (error) {
          console.warn(`${apiName} API failed for pincode ${pincode}:`, error.message);
          lastError = error;
          continue;
        }
      }

      // If all APIs fail, check fallback data
      const localData = fallbackPincodeData[pincode];
      if (localData) {
        return {
          success: true,
          data: {
            pincode,
            city: localData.city,
            state: localData.state
          },
          source: 'fallback'
        };
      }

      // All methods failed
      return {
        success: false,
        message: 'Location not found for this pincode. Please enter manually.',
        error: lastError?.message
      };

    } catch (error) {
      console.error('Error fetching location by pincode:', error);
      return {
        success: false,
        message: 'Error fetching location details. Please try again.',
        error: error.message
      };
    }
  },

  // Validate pincode format
  validatePincode: (pincode) => {
    return /^\d{6}$/.test(pincode);
  },

  // Get all available states from fallback data
  getAvailableStates: () => {
    const states = new Set();
    Object.values(fallbackPincodeData).forEach(location => {
      states.add(location.state);
    });
    return Array.from(states).sort();
  },

  // Get cities by state from fallback data
  getCitiesByState: (state) => {
    const cities = new Set();
    Object.values(fallbackPincodeData).forEach(location => {
      if (location.state === state) {
        cities.add(location.city);
      }
    });
    return Array.from(cities).sort();
  },

  // Clear cache (useful for testing or manual refresh)
  clearCache: () => {
    cache.clear();
    return { success: true, message: 'Cache cleared successfully' };
  },

  // Get cache statistics
  getCacheStats: () => {
    return {
      size: cache.size,
      entries: Array.from(cache.keys())
    };
  },

  // Test API connectivity
  testApiConnectivity: async () => {
    const results = {};
    const testPincode = '110001'; // Delhi pincode for testing

    for (const [apiName, config] of Object.entries(API_CONFIG)) {
      if (!config.enabled) {
        results[apiName] = { status: 'disabled' };
        continue;
      }

      try {
        const result = await apiServices[apiName](testPincode);
        results[apiName] = {
          status: 'success',
          responseTime: Date.now(),
          data: result.data
        };
      } catch (error) {
        results[apiName] = {
          status: 'failed',
          error: error.message
        };
      }
    }

    return results;
  }
};
