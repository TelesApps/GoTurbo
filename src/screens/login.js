import { Image, KeyboardAvoidingView, Platform, SafeAreaView, View, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { useAppState } from '../services/stateService';
import GTButton from '../components/gtButton';
import { COLORS, LOADING, FULL_NAME, CUSTOMER_NAME, PHONE_NUMBER, VERIFICATION_CODE } from '../constants';
import GTLabel from '../components/gtLabel';
import GTText from '../components/gtText';
import { signInWithEmailAndPassword, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase';
import { showToast } from '../utils/toast';
import FirebaseRecaptcha from '../components/FirebaseRecaptcha';

function LoginScreen({ navigation }) {
  const state = useAppState();
  const recaptchaRef = useRef(null);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [user, setUser] = useState({ 
    email: '',
    password: '',
    full_name: '',
    customer_name: '',
    phone_number: '',
    verification_code: ''
  });
  const [confirmationResult, setConfirmationResult] = useState(null);

  const update = (key, value) => { 
    setUser({ ...user, [key]: value }); 
  };

  const handleEmailLogin = async () => {
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

  const onContinuePress = async () => {
    if (!user.full_name || !user.customer_name || !user.phone_number) {
      showToast('All fields are required.', 'LONG');
      return;
    }

    const phone_number = user.phone_number.replace(/\D/g, '');

    if (phone_number.length !== 10) {
      showToast('Invalid phone number, please enter a 10 digit number.', 'LONG');
      return;
    }

    state.update(LOADING, true);

    try {
      // Check if phone number exists in any group
      const querySnapshot = await getDocs(collection(firestore, 'group_phone_numbers'));
      const groups = querySnapshot.docs;
      let is_found = false;

      for (let i = 0; i < groups.length; i++) {
        const phone_numbers = groups[i].data();

        for (const uuid in phone_numbers) {
          const phone_number_record = phone_numbers[uuid];

          if (phone_number_record.phone_number === phone_number && phone_number_record.is_active) {
            is_found = true;
            break;
          }
        }

        if (is_found) break;
      }

      if (!is_found) {
        state.update(LOADING, false);
        showToast('Phone number not found, please contact customer support.', 'LONG');
        return;
      }

      // Start phone number verification
      signInWithPhoneNumber(`+1${phone_number}`);
    } catch (error) {
      state.update(LOADING, false);
      showToast(error.message, 'LONG');
      console.log(error);
    }
  };

  const signInWithPhoneNumber = async (phoneNumber) => {
    try {
      const verifier = recaptchaRef.current.getVerifier();
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        verifier
      );
      
      setConfirmationResult(verificationId);
      state.update(LOADING, false);
    } catch (error) {
      state.update(LOADING, false);
      showToast(error.message, 'LONG');
      console.log(error);
    }
  };

  const onVerifyPress = async () => {
    if (!user.verification_code) {
      showToast('Please enter the verification code.', 'LONG');
      return;
    }

    state.update(LOADING, true);
    
    try {
      // Create credential
      const credential = PhoneAuthProvider.credential(
        confirmationResult,
        user.verification_code
      );
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      const user_record = {
        full_name: user.full_name,
        customer_name: user.customer_name,
        phone_number: user.phone_number
      };

      // Save user data to Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), user_record);
      
      // Update app state
      state.update('user', user_record, () => {
        navigation.replace('Home');
      });
      
      state.update(LOADING, false);
    } catch (error) {
      state.update(LOADING, false);
      
      // Check if code expired
      if (error.message && error.message.includes('expired')) {
        navigation.replace('Splash');
      } else {
        showToast(error.message, 'LONG');
        console.log(error);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
      <FirebaseRecaptcha ref={recaptchaRef} />
      
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
          labelStyle={{ fontFamily: 'DINCondensed-Bold', fontSize: 32, marginBottom: 20 }}
        />
        
        {/* Toggle between login methods */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity 
            style={{ 
              padding: 8, 
              backgroundColor: loginMethod === 'email' ? COLORS.PRIMARY : 'transparent',
              marginRight: 10,
              borderRadius: 5
            }}
            onPress={() => {
              setLoginMethod('email');
              setConfirmationResult(null);
            }}
          >
            <GTLabel 
              label="Email Login" 
              labelStyle={{ color: COLORS.WHITE }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ 
              padding: 8, 
              backgroundColor: loginMethod === 'phone' ? COLORS.PRIMARY : 'transparent',
              borderRadius: 5
            }}
            onPress={() => {
              setLoginMethod('phone');
              setConfirmationResult(null);
            }}
          >
            <GTLabel 
              label="Phone Login" 
              labelStyle={{ color: COLORS.WHITE }}
            />
          </TouchableOpacity>
        </View>
        
        {/* Email Login Form */}
        {loginMethod === 'email' && (
          <>
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
              onPress={handleEmailLogin} 
            />
          </>
        )}
        
        {/* Phone Login Form */}
        {loginMethod === 'phone' && !confirmationResult && (
          <>
            <GTText 
              viewStyle={{ width: '100%' }} 
              props={{ placeholder: 'Your Full Name' }} 
              value={user.full_name} 
              onChangeText={text => update(FULL_NAME, text)}
            />
            
            <GTText 
              viewStyle={{ width: '100%', marginTop: 20 }} 
              props={{ placeholder: 'Customer Name' }} 
              value={user.customer_name} 
              onChangeText={text => update(CUSTOMER_NAME, text)}
            />
            
            <GTText 
              viewStyle={{ width: '100%', marginTop: 20 }} 
              props={{ 
                placeholder: 'Phone Number', 
                keyboardType: 'number-pad', 
                returnKeyType: 'done' 
              }} 
              value={user.phone_number} 
              onChangeText={text => update(PHONE_NUMBER, text)}
            />
            
            <GTButton 
              label={'CONTINUE'} 
              buttonStyle={{ width: '100%', backgroundColor: COLORS.GRAY, marginTop: 30 }} 
              onPress={onContinuePress} 
            />
          </>
        )}
        
        {/* Verification Code Form */}
        {loginMethod === 'phone' && confirmationResult && (
          <>
            <GTLabel 
              label={'ENTER VERIFICATION CODE'} 
              labelStyle={{ fontFamily: 'DINCondensed-Bold', fontSize: 24, marginBottom: 20 }}
            />
            
            <GTText 
              viewStyle={{ width: '100%' }} 
              props={{ 
                placeholder: 'Verification Code', 
                keyboardType: 'number-pad', 
                returnKeyType: 'done' 
              }} 
              value={user.verification_code} 
              onChangeText={text => update(VERIFICATION_CODE, text)}
            />
            
            <GTButton 
              label={'VERIFY'} 
              buttonStyle={{ width: '100%', backgroundColor: COLORS.GRAY, marginTop: 30 }} 
              onPress={onVerifyPress} 
            />
          </>
        )}
        
        <GTLabel 
          label={'By entering this account you agree to our\nTerms of Service and Privacy Policy'} 
          labelStyle={{ fontSize: 12, textAlign: 'center', marginTop: 20 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;