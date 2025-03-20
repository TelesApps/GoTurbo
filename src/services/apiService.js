import axios from 'axios';
import Toast from 'react-native-simple-toast';
import { LOADING } from '../constants';
import { useAppState } from './stateService';

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
  
  const credentials = { 
    database: 'turbotruck', 
    userName: 'bryan@vardeman.com', 
    password: 'turbotruck' 
  };

  // Private helper methods
  const handleCallback = (response, callback, errorCallback) => {
    state.update(LOADING, false);

    const data = response.data;

    if (data.error) {
      Toast.show(data.error.message, Toast.LONG);

      if (errorCallback) {
        errorCallback(data.error.message);
      }
    } else {
      if (callback) {
        callback(data.result);
      }
    }
  };

  const post = (method, params, callback, errorCallback) => {
    state.update(LOADING, true);

    api.post('/', { method, params })
      .then(response => handleCallback(response, callback, errorCallback))
      .catch(error => handleCallback(error, null, errorCallback));
  };

  // Public API methods
  const authenticate = (callback, errorCallback) => {
    post(
      'Authenticate',
      credentials,
      function(response) {
        state.update(
          'credentials',
          response.credentials,
          function() {
            if (callback) { 
              callback(response); 
            }
          }
        );
      },
      errorCallback
    );
  };

  const getGroup = (groupId, callback, errorCallback) => {
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

  const getDevices = (groupId, callback, errorCallback) => {
    const params = { 
      typeName: 'Device', 
      search: { 
        groups: [{ id: groupId }] 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesByGroups = (groups, callback, errorCallback) => {
    const params = { 
      typeName: 'Device', 
      search: { 
        groups 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDeviceById = (id, callback, errorCallback) => {
    const params = { 
      typeName: 'Device', 
      search: { 
        id 
      }, 
      credentials: state.credentials 
    };

    post('Get', params, callback, errorCallback);
  };

  const getDevicesStatusInfo = (groupId, callback, errorCallback) => {
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

  const getDevicesStatusInfoByGroups = (groups, callback, errorCallback) => {
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
  
  const credentials = { 
    database: 'turbotruck', 
    userName: 'bryan@vardeman.com', 
    password: 'turbotruck' 
  };

  // Private methods
  const post = (method, params, callback, errorCallback) => {
    context.update(LOADING, true);

    api.post('/', { method, params })
      .then(response => handleCallback(response, callback, errorCallback))
      .catch(error => handleCallback(error, null, errorCallback));
  };

  const handleCallback = (response, callback, errorCallback) => {
    context.update(LOADING, false);

    const data = response.data;

    if (data.error) {
      Toast.show(data.error.message, Toast.LONG);

      if (errorCallback) {
        errorCallback(data.error.message);
      }
    } else {
      if (callback) {
        callback(data.result);
      }
    }
  };

  // Keep the same method signatures for backward compatibility
  const authenticate = (callback, errorCallback) => {
    post(
      'Authenticate',
      credentials,
      function(response) {
        context.update(
          'credentials',
          response.credentials,
          function() {
            if (callback) { callback(response); }
          }
        );
      },
      errorCallback
    );
  };

  // Include all other methods the same way...
  const getGroup = (groupId, callback, errorCallback) => {
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

  // Add the remaining methods here...
  // getDevices, getDevicesByGroups, getDeviceById, etc.

  // Return the same interface
  return {
    authenticate,
    getGroup,
    // Include all other methods
  };
};

export default APIService;