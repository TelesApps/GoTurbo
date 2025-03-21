// src/screens/serviceHistory.js

import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StateContext } from '../services/stateService';
import GTLabel from '../components/gtLabel';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { dateFormatterAlt, LOADING, COLORS } from '../constants';
import { Tab, TabView } from '@ui-kitten/components';

const ServiceHistoryScreen = () => {
  const navigation = useNavigation();
  const context = useContext(StateContext);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        context.update(LOADING, true);
        
        const serviceRequestsRef = collection(firestore, 'serviceRequests');
        const querySnapshot = await getDocs(serviceRequestsRef);
        
        let history = [];
        
        querySnapshot.forEach((doc) => {
          const request = doc.data();
          const status_name = !request.status_name ? 'Open' : request.status_name; // Default to open when no status supplied
          
          history.push({
            id: doc.id,
            date_time: request.date_time,
            tractor_id: request.tractor_id,
            issue: request.issue,
            issue_other: request.issue_other,
            status_name: status_name
          });
        });
        
        // Sort by date, newest first
        history.sort((a, b) => (a.date_time < b.date_time) ? 1 : -1);
        
        setServiceRequests(history);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        context.update(LOADING, false);
      }
    };
    
    fetchServiceRequests();
  }, []);

  const renderServiceHistory = (isOpen) => {
    let items = [];

    for (let i = 0; i < serviceRequests.length; i++) {
      const request = serviceRequests[i];
      
      // For Open tab (isOpen = 1), only show open requests
      // For Closed tab (isOpen = 0), only show closed requests
      const requestIsOpen = request.status_name.toUpperCase() === 'OPEN';
      
      if ((isOpen === 1 && requestIsOpen) || (isOpen === 0 && !requestIsOpen)) {
        items.push(
          <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
            <GTLabel 
              label={dateFormatterAlt(request.date_time)} 
              labelStyle={{ width: 75, fontFamily: 'ProximaNova-Regular', fontSize: 14 }} 
            />

            <View style={{ flex: 1 }}>
              <GTLabel 
                text={request.tractor_id} 
                style={{ fontFamily: 'ProximaNova-Regular', fontSize: 14 }} 
              />
              <GTLabel 
                text={request.issue} 
                style={{ fontFamily: 'ProximaNova-Regular', fontSize: 14 }} 
              />
              {request.issue_other && (
                <GTLabel 
                  label={request.issue_other} 
                  labelStyle={{ fontFamily: 'ProximaNova-Regular', fontSize: 14 }}
                />
              )}
              <View 
                style={{ 
                  height: 1, 
                  backgroundColor: COLORS.WHITE, 
                  flex: 1, 
                  marginTop: 5, 
                  marginBottom: 10 
                }}
              />
            </View>
          </View>
        );
      }
    }

    return items;
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ height: '100%', position: 'absolute', justifyContent: 'flex-end' }}>
        <Image 
          source={require('../assets/images/background.png')} 
          style={{ height: '100%' }} 
        />
        <View 
          style={{ 
            height: '100%', 
            width: '100%', 
            backgroundColor: '#000000', 
            opacity: 0.6, 
            position: 'absolute' 
          }} 
        />
      </View>
      
      <View 
        style={{ 
          height: 100, 
          width: '100%', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'row', 
          backgroundColor: '#000000' 
        }}
      >
        <Pressable 
          style={{ 
            left: 20, 
            position: 'absolute', 
            height: 50, 
            width: 50, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }} 
          onPress={onBackPress}
        >
          <Image source={require('../assets/images/arrow_back_ios_white_32dp.png')} />
        </Pressable>
        <Image 
          source={require('../assets/images/goturbo-logo-rev.png')} 
          style={{ height: 60, resizeMode: 'contain' }} 
        />
      </View>
      
      <View 
        style={{ 
          height: 100, 
          width: '100%', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          backgroundColor: '#4A4A4A', 
          paddingStart: 30 
        }}
      >
        <GTLabel 
          label={'Service History'} 
          labelStyle={{ fontSize: 23, fontFamily: 'ProximaNova-Bold' }}
        />
        <GTLabel 
          label={context.getUser()?.customer_name || ''} 
          labelStyle={{ marginTop: -3 }}
        />
      </View>

      <View style={{ flex: 1, width: '100%' }}>
        <TabView 
          selectedIndex={selectedIndex} 
          onSelect={index => setSelectedIndex(index)}
        >
          <Tab title={'Open'}>
            <View style={{ width: '100%', height: '100%', padding: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <GTLabel 
                  label={'Date'} 
                  labelStyle={{ width: 75, fontFamily: 'ProximaNova-Bold', fontSize: 16 }} 
                />
                <GTLabel 
                  label={'Tractor / Service Issue(s)'} 
                  labelStyle={{ flex: 1, fontFamily: 'ProximaNova-Bold', fontSize: 16 }} 
                />
              </View>
              <ScrollView style={{ marginBottom: 75 }}>
                {renderServiceHistory(1)}
              </ScrollView>
            </View>
          </Tab>
          <Tab title={'Closed'}>
            <View style={{ width: '100%', height: '100%', padding: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <GTLabel 
                  text={'Date'} 
                  style={{ width: 75, fontFamily: 'ProximaNova-Bold', fontSize: 16 }} 
                />
                <GTLabel 
                  text={'Tractor / Service Issue(s)'} 
                  style={{ flex: 1, fontFamily: 'ProximaNova-Bold', fontSize: 16 }} 
                />
              </View>
              <ScrollView style={{ marginBottom: 75 }}>
                {renderServiceHistory(0)}
              </ScrollView>
            </View>
          </Tab>
        </TabView>
      </View>
    </SafeAreaView>
  );
};

export default ServiceHistoryScreen;