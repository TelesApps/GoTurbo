import React, { createContext, useState, useContext } from 'react';
import { Subject } from 'rxjs';
import DialogLoading from '../dialogs/dialogLoading';

// Create a Subject for pub/sub pattern
export const PubSub = new Subject();

// Create the context with default values
const StateContext = createContext({
  loading: false,
  credentials: null,
  user: null,
  groups: [],
  devices: [],
  
  update: () => {},
  getUser: () => {},
  getUserDevices: () => {},
  getUserGroups: () => {}
});

// Create the provider component as a functional component
export function StateProvider({ children }) {
  // Define state with useState hooks
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  
  // Update method that works similar to the class-based setState
  const update = (key, value, callback) => {
    // Use the appropriate setter function based on the key
    switch(key) {
      case 'loading':
        setLoading(value);
        break;
      case 'credentials':
        setCredentials(value);
        break;
      case 'user':
        setUser(value);
        break;
      case 'groups':
        setGroups(value);
        break;
      case 'devices':
        setDevices(value);
        break;
      default:
        console.warn(`No setter found for key: ${key}`);
    }
    
    // Call the callback if provided
    if (callback) {
      callback();
    }
  };
  
  // Getter methods
  const getUser = () => user;
  const getUserDevices = () => devices;
  const getUserGroups = () => groups;
  
  // Create the value object that will be provided by the context
  const contextValue = {
    loading,
    credentials,
    user,
    groups,
    devices,
    
    update,
    getUser,
    getUserDevices,
    getUserGroups
  };
  
  return (
    <StateContext.Provider value={contextValue}>
      <DialogLoading loading={loading} />
      {children}
    </StateContext.Provider>
  );
}

// Custom hook for using the state
export function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}

// Export the context for direct use if needed
export { StateContext };