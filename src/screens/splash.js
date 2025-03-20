import React, { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase';
import { useAppState } from '../services/stateService';
import { useApiService } from '../services/apiService';
import { getCurrentUser } from '../constants';

function SplashScreen({ navigation }) {
  const state = useAppState();
  const api = useApiService();

  useEffect(() => {
    // Start authentication process
    api.authenticate(
      function(response) {
        // In Expo, we need a different approach for notifications
        // requestNotificationPermissions() would go here
        
        // For now, proceed to check authentication
        setTimeout(() => { 
          checkUserAuthenticated(); 
        }, 500);
      },
      null
    );
  }, []);

  const checkUserAuthenticated = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigation.replace('Login');
      return;
    }

    console.log(currentUser);

    // Check to make sure user wasn't deleted
    // With Firebase Web SDK, reload is a method call without callbacks
    currentUser.reload()
      .then(() => {
        // User still exists, get user data
        getUser(currentUser.uid);
      })
      .catch(function(error) {
        console.log(error);
        // User probably deleted
        navigation.replace('Login');
      });
  };

  const getUser = (uid) => {
    // Updated for Firebase Web SDK
    const userRef = doc(firestore, 'users', uid);
    
    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          console.log(docSnap.data());
          
          state.update(
            'user',
            docSnap.data(),
            function() {
              navigation.replace('Home');
            }
          );
        } else {
          console.log("No user document found!");
          navigation.replace('Login');
        }
      })
      .catch(function(error) {
        console.log(error);
        navigation.replace('Login');
      });
  };

  // Note: Firebase Cloud Messaging requires additional setup with Expo
  // This is a placeholder for that functionality
  async function requestNotificationPermissions() {
    try {
      // For Expo, you would use Expo's notification permissions API
      // const { status } = await Notifications.requestPermissionsAsync();
      // if (status === 'granted') {
      //   const token = await Notifications.getExpoPushTokenAsync();
      //   state.update('fcmToken', token.data);
      // }
      
      // For now, we'll just return a resolved promise
      return Promise.resolve();
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      return Promise.resolve();
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/HalftoneSwash.png')} style={styles.backgroundImage} />
      <Image source={require('../assets/images/goturbo-logo-rev.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  backgroundImage: {
    position: 'absolute'
  },
  logo: {
    marginTop: -75
  }
});

export default SplashScreen;