import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, View, StyleSheet } from 'react-native';
import { useAppState } from '../services/stateService';
import { CUSTOMER_NAME, FULL_NAME, getCurrentUser, COLORS, LOADING } from '../constants';
import GTLabel from '../components/gtLabel';
import GTText from '../components/gtText';
import GTButton from '../components/gtButton';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { showToast } from '../utils/toast';

function AccountScreen({ navigation }) {
  const state = useAppState();
  const [user, setUser] = useState({ full_name: null, customer_name: null });
  const [modalSuccessful, setModalSuccessful] = useState(false);

  const update = (key, value) => {
    setUser({ ...user, [key]: value });
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log("No authenticated user found");
        return;
      }

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        console.log("No user document found");
      }
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  const onSavePress = async () => {
    if (!user.full_name || !user.customer_name) {
      showToast('All fields are required.', 'LONG');
      return;
    }

    state.update(LOADING, true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      await setDoc(doc(firestore, 'users', currentUser.uid), user);
      
      state.update(LOADING, false);
      state.update('user', user, function() {
        setModalSuccessful(true);
      });
    } catch (error) {
      console.log(error);
      state.update(LOADING, false);
      showToast('There was a problem updating your account, please try again.', 'LONG');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image source={require('../assets/images/background.png')} style={styles.backgroundImage} />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.headerContainer}>
        <Pressable 
          style={styles.backButton} 
          onPress={onBackPress}
        >
          <Image source={require('../assets/images/arrow_back_ios_white_32dp.png')} />
        </Pressable>
        <Image 
          source={require('../assets/images/goturbo-logo-rev.png')} 
          style={styles.logo} 
        />
      </View>
      
      <View style={styles.titleContainer}>
        <GTLabel 
          label={'Account'} 
          labelStyle={styles.titleText}
        />
        <GTLabel 
          label={state.getUser()?.customer_name || ''} 
          labelStyle={styles.subtitleText}
        />
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <GTLabel label={'Your Full Name'} />
          <GTText 
            viewStyle={styles.textInput} 
            props={{ placeholder: 'Your Full Name' }} 
            textInputStyle={styles.textInputInner} 
            value={user.full_name} 
            onChangeText={text => update(FULL_NAME, text)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <GTLabel label={'Customer Name'} />
          <GTText 
            viewStyle={styles.textInput} 
            props={{ placeholder: 'Customer Name' }} 
            textInputStyle={styles.textInputInner} 
            value={user.customer_name} 
            onChangeText={text => update(CUSTOMER_NAME, text)}
          />
        </View>
      </View>
      
      <GTButton 
        label={'SAVE'} 
        buttonStyle={styles.saveButton} 
        labelStyle={styles.saveButtonText} 
        onPress={onSavePress}
      />

      <DialogOKCancel 
        visible={modalSuccessful} 
        message={'Account successfully updated.'} 
        onOKPress={() => setModalSuccessful(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    height: '100%',
  },
  overlay: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000000',
    opacity: 0.6,
    position: 'absolute',
  },
  headerContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
  backButton: {
    left: 20,
    position: 'absolute',
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 60,
    resizeMode: 'contain',
  },
  titleContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#4A4A4A',
    paddingStart: 30,
  },
  titleText: {
    fontSize: 23,
    fontFamily: 'ProximaNova-Bold',
  },
  subtitleText: {
    marginTop: -3,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    padding: 30,
  },
  inputContainer: {
    width: 300,
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingLeft: 0,
    paddingRight: 0,
  },
  textInputInner: {
    paddingLeft: 5,
  },
  saveButton: {
    width: '100%',
    backgroundColor: COLORS.GRAY,
  },
  saveButtonText: {
    fontSize: 14,
  },
});

export default AccountScreen;