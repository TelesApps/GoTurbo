import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, View, StyleSheet } from 'react-native';
import { useAppState } from '../services/stateService';
import { useApiService } from '../services/apiService';
import { COLORS, LOADING } from '../constants';
import GTLabel from '../components/gtLabel';
import GTButton from '../components/gtButton';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase';

function HomeScreen({ navigation }) {
  const state = useAppState();
  const api = useApiService();
  const [user, setUser] = useState(null);

  useEffect(() => {
    state.update(LOADING, true);
    
    // Get current user from state
    setUser(state.getUser());

    getGroups(function(groups_found) {
      getDevices(
        groups_found,
        function() {
          state.update(LOADING, false);
        }
      );
    });
  }, []);

  const getGroups = async (callback) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'group_phone_numbers'));
      const results = querySnapshot.docs;
      let groups_found = [];

      // NOTE: For email login, we need to adapt this logic as we don't have phone numbers
      // This is a simplified version that gets all groups for now
      for (let i = 0; i < results.length; i++) {
        const phone_numbers = results[i].data();

        for (const uuid in phone_numbers) {
          const phone_number_record = phone_numbers[uuid];
          
          // Check if this user has access to this group
          // For email login, we need to adapt this check
          if (phone_number_record.is_active && state.getUser() && 
              (phone_number_record.email === state.getUser().email || 
               phone_number_record.phone_number === state.getUser().phone_number)) {
            groups_found.push(results[i].id);
          }
        }
      }

      state.update('groups', groups_found);
      callback(groups_found);
    } catch (error) {
      state.update(LOADING, false);
      console.log(error);
    }
  };

  const getDevices = (groups_found, callback) => {
    let search_groups = [];

    // Get all devices for all groups
    for (let i = 0; i < groups_found.length; i++) {
      const group = groups_found[i];
      search_groups.push({ 'id': group });
    }

    api.getDevicesByGroups(search_groups, function(response) {
      state.update('devices', response);
      callback();
    });
  };

  const onTractorsPress = () => { 
    navigation.navigate('Map'); 
  };
  
  const onServiceHistoryPress = () => { 
    navigation.navigate('ServiceHistory'); 
  };
  
  const onAccountPress = () => { 
    navigation.navigate('Account'); 
  };
  
  const onContactSupportPress = () => { 
    navigation.navigate('ServiceRequest'); 
  };
  
  const onLogoutPress = async () => { 
    try {
      await signOut(auth);
      navigation.replace('Splash');
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image source={require('../assets/images/background.png')} style={styles.backgroundImage} />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/images/goturbo-logo-rev.png')} 
          style={styles.logo} 
        />
      </View>
      
      <View style={styles.userInfoContainer}>
        <GTLabel 
          label={state.getUser()?.full_name || ''} 
          labelStyle={styles.userName}
        />
        <GTLabel 
          label={state.getUser()?.customer_name || ''} 
          labelStyle={styles.customerName}
        />
      </View>
      
      <View style={styles.menuContainer}>
        <MenuOption 
          icon={require('../assets/images/awesome-truck-moving.png')} 
          label="Tractors" 
          onPress={onTractorsPress} 
        />
        
        <MenuOption 
          icon={require('../assets/images/pending_actions_white_24dp.png')} 
          label="Service History" 
          onPress={onServiceHistoryPress} 
        />
        
        <MenuOption 
          icon={require('../assets/images/person_white_24dp.png')} 
          label="Account" 
          onPress={onAccountPress} 
        />
        
        <MenuOption 
          icon={require('../assets/images/policy_white_24dp.png')} 
          label="Logout" 
          onPress={onLogoutPress} 
        />
      </View>
      
      <GTButton 
        label={'NEW SERVICE REQUEST'} 
        buttonStyle={styles.serviceRequestButton} 
        labelStyle={styles.serviceRequestButtonText} 
        onPress={onContactSupportPress} 
      />
    </SafeAreaView>
  );
}

// Component for menu options
function MenuOption({ icon, label, onPress }) {
  return (
    <Pressable style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionContent}>
        <View style={styles.iconContainer}>
          <Image source={icon} />
        </View>
        <GTLabel label={label} labelStyle={styles.menuOptionText} />
      </View>
      <View style={styles.divider} />
    </Pressable>
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
  logo: {
    height: 60,
    resizeMode: 'contain',
  },
  userInfoContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#4A4A4A',
    paddingStart: 30,
  },
  userName: {
    fontSize: 23,
    fontFamily: 'ProximaNova-Bold',
  },
  customerName: {
    marginTop: -3,
  },
  menuContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  menuOption: {
    width: '80%',
    height: 60,
  },
  menuOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionText: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: 18,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.WHITE,
  },
  serviceRequestButton: {
    width: '100%',
    backgroundColor: COLORS.GRAY,
  },
  serviceRequestButtonText: {
    fontSize: 14,
  },
});

export default HomeScreen;