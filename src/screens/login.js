import { Image, KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
import React, { useState } from 'react';
import { useAppState } from '../services/stateService';
import GTButton from '../components/gtButton';
import { COLORS, LOADING } from '../constants';
import GTLabel from '../components/gtLabel';
import GTText from '../components/gtText';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase';
import { showToast } from '../utils/toast';

function LoginScreen({ navigation }) {
  const state = useAppState();
  const [user, setUser] = useState({ 
    email: '',
    password: '',
  });

  const update = (key, value) => { 
    setUser({ ...user, [key]: value }); 
  };

  const handleLogin = async () => {
    if (!user.email || !user.password) {
      showToast('Email and password are required.', 'LONG');
      return;
    }

    state.update(LOADING, true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
      
      // Get user profile from firestore
      const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        state.update('user', userData, () => {
          navigation.replace('Home');
        });
      } else {
        showToast('User profile not found. Please contact support.', 'LONG');
      }
      
      state.update(LOADING, false);
    } catch (error) {
      state.update(LOADING, false);
      showToast(error.message, 'LONG');
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../assets/images/goturbo-logo-rev.png')} 
          style={{ height: 90, resizeMode: 'contain' }}
        />
      </View>
      <KeyboardAvoidingView 
        style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: '85%' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <GTLabel 
          label={'LOGIN TO ACCOUNT'} 
          labelStyle={{ fontFamily: 'DINCondensed-Bold', fontSize: 32, marginBottom: 40 }}
        />
        
        <GTText 
          viewStyle={{ width: '100%' }} 
          props={{ placeholder: 'Email Address' }} 
          value={user.email} 
          onChangeText={text => update('email', text)}
        />
        
        <GTText 
          viewStyle={{ width: '100%', marginTop: 20 }} 
          props={{ placeholder: 'Password', secureTextEntry: true }} 
          value={user.password} 
          onChangeText={text => update('password', text)}
        />

        <GTButton 
          label={'LOGIN'} 
          buttonStyle={{ width: '100%', backgroundColor: COLORS.GRAY, marginTop: 30 }} 
          onPress={handleLogin} 
        />
        
        <GTLabel 
          label={'By entering this account you agree to our\nTerms of Service and Privacy Policy'} 
          labelStyle={{ fontSize: 12, textAlign: 'center', marginTop: 20 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;