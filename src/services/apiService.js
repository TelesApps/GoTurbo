import axios from 'axios';
import { showToast } from '../utils/toast';
import { LOADING } from '../constants';
import { useAppState } from './stateService';
import { firestore } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Create a hook-based API service
export function useApiService() {
  const state = useAppState();
  
  const BASE_URL = 'https://my243.geotab.com/apiv1';
  
  // Create axios instance with configuration
  const api = axios.create({ 
    baseURL: BASE_URL, 
    timeout: 10000, 
    headers: { 
      'content-type': 'application/json', 
      'cache-control': 'no-cache' 
    } 
  });
  
  // Initialize empty credentials
  let credentials = { 
    database: '', 
    userName: '', 
    password: '' 
  };
  
  // Function to fetch credentials from Firestore
  const fetchCredentials = async () => {
    try {
      const credentialDoc = await getDoc(doc(firestore, 'app', 'app-credential'));
      if (credentialDoc.exists()) {
        const data = credentialDoc.data();
        credentials.database = data.database;
        credentials.userName = data.userName;
        credentials.password = data.password;
        console.log("Credentials fetched from Firestore");
        return true;
      } else {
        console.error("Credentials document not found in Firestore");
        return false;
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      return false;
    }
  };

  // Private helper methods
  const handleCallback = (response, callback, errorCallback) => {
    state.update(LOADING, false);

    try {
      // Make sure data exists and has the expected structure
      const data = response?.data;
      
      if (!data) {
        showToast('Network error or invalid response', 'LONG');
        if (errorCallback) errorCallback('Network error');
        return;
      }

      if (data.error) {
        showToast(data.error.message || 'An error occurred', 'LONG');
        if (errorCallback) errorCallback(data.error.message);
      } else {
        if (callback) callback(data.result);
      }
    } catch (err) {
      console.error('Error in API callback handler:', err);
      showToast('An unexpected error occurred', 'LONG');
      if (errorCallback) errorCallback('Unexpected error');
    }
  };

  const post = (method, params, callback, errorCallback) => {
    state.update(LOADING, true);

    api.post('/', { method, params })
      .then(response => handleCallback(response, callback, errorCallback))
      .catch(error => handleCallback(error, null, errorCallback));
  };

  // Public API methods
  const authenticate = async (callback, errorCallback) => {
    // Ensure credentials are loaded first
    if (!credentials.database || !credentials.userName || !credentials.password) {
      const success = await fetchCredentials();
      if (!success) {
        showToast('Unable to load API credentials', 'LONG');
        if (errorCallback) errorCallback('Credential loading failed');
        return;
      }
    }
    
    post(
      'Authenticate',
      credentials,
      function(response) {
        // Make sure this is properly updating state with the credentials
        state.update(
          'credentials',
          response.credentials,
          function() {
            console.log("Credentials stored in state:", response.credentials);
            if (callback) { 
              callback(response); 
            }
          }
        );
      },
      errorCallback
    );
  };

  const getGroup = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching group");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Group', 
            search: { 
              includeAllTrees: false, 
              id: groupId 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Group', 
      search: { 
        includeAllTrees: false, 
        id: groupId 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevices = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching devices");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              groups: [{ id: groupId }] 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        groups: [{ id: groupId }] 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesByGroups = async (groups, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching devices");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              groups 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        groups 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDeviceById = async (id, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              id 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        id 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesStatusInfo = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device status info");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'DeviceStatusInfo', 
            search: { 
              deviceSearch: { 
                groups: [{ id: groupId }] 
              } 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'DeviceStatusInfo', 
      search: { 
        deviceSearch: { 
          groups: [{ id: groupId }] 
        } 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesStatusInfoByGroups = async (groups, callback, errorCallback) => {
    // Check for credentials
    if (!state.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device status info");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'DeviceStatusInfo', 
            search: { 
              deviceSearch: { 
                groups 
              } 
            }, 
            credentials: state.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'DeviceStatusInfo', 
      search: { 
        deviceSearch: { 
          groups 
        } 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  return {
    authenticate,
    getGroup,
    getDevices,
    getDevicesByGroups,
    getDeviceById,
    getDevicesStatusInfo,
    getDevicesStatusInfoByGroups
  };
}

// For backward compatibility
const APIService = (context) => {
  // This function signature is kept for compatibility with existing code
  const BASE_URL = 'https://my243.geotab.com/apiv1';
  
  const api = axios.create({ 
    baseURL: BASE_URL, 
    timeout: 10000, 
    headers: { 
      'content-type': 'application/json', 
      'cache-control': 'no-cache' 
    } 
  });
  
  // Initialize empty credentials
  let credentials = { 
    database: '', 
    userName: '', 
    password: '' 
  };
  
  // Function to fetch credentials from Firestore
  const fetchCredentials = async () => {
    try {
      const credentialDoc = await getDoc(doc(firestore, 'app', 'app-credential'));
      if (credentialDoc.exists()) {
        const data = credentialDoc.data();
        credentials.database = data.database;
        credentials.userName = data.userName;
        credentials.password = data.password;
        console.log("Credentials fetched from Firestore");
        return true;
      } else {
        console.error("Credentials document not found in Firestore");
        return false;
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      return false;
    }
  };

  // Private methods
  const handleCallback = (response, callback, errorCallback) => {
    context.update(LOADING, false);

    try {
      // Make sure data exists and has the expected structure
      const data = response?.data;
      
      if (!data) {
        showToast('Network error or invalid response', 'LONG');
        if (errorCallback) errorCallback('Network error');
        return;
      }

      if (data.error) {
        showToast(data.error.message || 'An error occurred', 'LONG');
        if (errorCallback) errorCallback(data.error.message);
      } else {
        if (callback) callback(data.result);
      }
    } catch (err) {
      console.error('Error in API callback handler:', err);
      showToast('An unexpected error occurred', 'LONG');
      if (errorCallback) errorCallback('Unexpected error');
    }
  };

  const post = (method, params, callback, errorCallback) => {
    context.update(LOADING, true);

    api.post('/', { method, params })
      .then(response => handleCallback(response, callback, errorCallback))
      .catch(error => handleCallback(error, null, errorCallback));
  };

  // Keep the same method signatures for backward compatibility
  const authenticate = async (callback, errorCallback) => {
    // Ensure credentials are loaded first
    if (!credentials.database || !credentials.userName || !credentials.password) {
      const success = await fetchCredentials();
      if (!success) {
        showToast('Unable to load API credentials', 'LONG');
        if (errorCallback) errorCallback('Credential loading failed');
        return;
      }
    }
    
    post(
      'Authenticate',
      credentials,
      function(response) {
        // Make sure this is properly updating state with the credentials
        context.update(
          'credentials',
          response.credentials,
          function() {
            console.log("Credentials stored in context:", response.credentials);
            if (callback) { 
              callback(response); 
            }
          }
        );
      },
      errorCallback
    );
  };

  const getGroup = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching group");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Group', 
            search: { 
              includeAllTrees: false, 
              id: groupId 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Group', 
      search: { 
        includeAllTrees: false, 
        id: groupId 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevices = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching devices");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              groups: [{ id: groupId }] 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        groups: [{ id: groupId }] 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesByGroups = async (groups, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching devices");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              groups 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        groups 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDeviceById = async (id, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'Device', 
            search: { 
              id 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'Device', 
      search: { 
        id 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesStatusInfo = async (groupId, callback, errorCallback) => {
    // Check for credentials before proceeding
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device status info");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'DeviceStatusInfo', 
            search: { 
              deviceSearch: { 
                groups: [{ id: groupId }] 
              } 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'DeviceStatusInfo', 
      search: { 
        deviceSearch: { 
          groups: [{ id: groupId }] 
        } 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesStatusInfoByGroups = async (groups, callback, errorCallback) => {
    // Check for credentials
    if (!context.credentials) {
      console.log("No credentials available - trying to authenticate");
      
      authenticate(
        function(response) {
          console.log("Authentication successful, now fetching device status info");
          // Now that we're authenticated, retry the original request
          const params = { 
            typeName: 'DeviceStatusInfo', 
            search: { 
              deviceSearch: { 
                groups 
              } 
            }, 
            credentials: context.credentials 
          };

          post('Get', params, callback, errorCallback);
        },
        function(error) {
          console.log("Authentication failed:", error);
          showToast('Unable to authenticate with the tracking service', 'LONG');
          if (errorCallback) errorCallback('Authentication failed');
        }
      );
      return;
    }

    const params = { 
      typeName: 'DeviceStatusInfo', 
      search: { 
        deviceSearch: { 
          groups 
        } 
      }, 
      credentials: context.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  return {
    authenticate,
    getGroup,
    getDevices,
    getDevicesByGroups,
    getDeviceById,
    getDevicesStatusInfo,
    getDevicesStatusInfoByGroups
  };
};

export default APIService;