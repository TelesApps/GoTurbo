import React, { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase';
import { useAppState } from '../services/stateService';
import { useApiService } from '../services/apiService';
import { LOADING } from '../constants';

function SplashScreen({ navigation }) {
  const state = useAppState();
  const api = useApiService();

  useEffect(() => {
    state.update(LOADING, true);
  
    // Use Firebase's auth state observer
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User already authenticated, getting user data");
        // Get user info from Firestore
        getUser(currentUser.uid);
      } else {
        console.log("No current user, attempting API authentication");
        // Only try API authenticate if no current user
        api.authenticate(
          function (response) {
            console.log("API authentication successful, credentials stored");
            // Direct to login since we don't have a current user
            state.update(LOADING, false);
            navigation.replace('Login');
          },
          function (error) {
            console.log("API authentication error:", error);
            state.update(LOADING, false);
            navigation.replace('Login');
          }
        );
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const getUser = (uid) => {
    state.update(LOADING, true);
    
    // Get user data from Firestore
    const userRef = doc(firestore, 'users', uid);

    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();

          state.update(
            'user',
            userData,
            function () {
              state.update(LOADING, false);
              navigation.replace('Home');
            }
          );
        } else {
          console.log("No user document found!");
          state.update(LOADING, false);
          navigation.replace('Login');
        }
      })
      .catch(function (error) {
        console.log("Error getting user document:", error);
        state.update(LOADING, false);
        navigation.replace('Login');
      });
  };

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