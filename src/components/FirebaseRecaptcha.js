import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import app from '../services/firebase';

const FirebaseRecaptcha = forwardRef(({ onVerify }, ref) => {
  const recaptchaVerifier = useRef(null);

  // Expose the getVerifier method to parent
  useImperativeHandle(ref, () => ({
    getVerifier: () => recaptchaVerifier.current
  }));

  return (
    <View style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
        onVerify={onVerify}
      />
    </View>
  );
});

export default FirebaseRecaptcha;