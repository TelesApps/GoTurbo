import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GTLabel from '../components/gtLabel';
import { PLACEHOLDER } from '../constants';
import { useAppState } from '../services/stateService';

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const state = useAppState();

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // No extra logic required on mount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../assets/images/background.png')}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={onBackPress}>
          <Image source={require('../assets/images/arrow_back_ios_white_32dp.png')} />
        </Pressable>
        <Image
          source={require('../assets/images/goturbo-logo-rev.png')}
          style={styles.logo}
        />
      </View>
      
      <View style={styles.userInfoContainer}>
        <GTLabel label="Privacy" labelStyle={styles.titleLabel} />
        <GTLabel
          label={state.getUser()?.customer_name || ''}
          labelStyle={styles.customerName}
        />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <GTLabel label={PLACEHOLDER} labelStyle={styles.contentLabel} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundContainer: {
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  backgroundImage: { width: '100%', height: '100%' },
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { height: 60, resizeMode: 'contain' },
  userInfoContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#4A4A4A',
    paddingStart: 30,
  },
  titleLabel: { fontSize: 23, fontFamily: 'ProximaNova-Bold' },
  customerName: { marginTop: -3 },
  scrollContainer: { flex: 1, width: '100%' },
  contentContainer: { padding: 30 },
  contentLabel: { fontSize: 18 },
});

export default PrivacyScreen;
