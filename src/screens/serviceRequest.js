import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

import { useAppState } from '../services/stateService';
import { useApiService } from '../services/apiService';
import {
  COLORS,
  LOADING,
  FULL_NAME,
  CALL_BACK_PHONE,
  TRACTOR_ID,
  ISSUE,
  ISSUE_OTHER,
} from '../constants';
import { getCurrentUser, formatPhoneNumber, stringHasValue, getToday } from '../constants';

import GTLabel from '../components/gtLabel';
import GTButton from '../components/gtButton';
import GTText from '../components/gtText';
import GTCheckbox from '../components/gtCheckbox';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import { showToast } from '../utils/toast';
import { firestore } from '../services/firebase';

function ServiceRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const state = useAppState();
  const api = useApiService();

  const [tractorIndex, setTractorIndex] = useState(new IndexPath(0));
  const [tractors, setTractors] = useState([]);
  const [modalRequestSuccessful, setModalRequestSuccessful] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [otherIssueSelected, setOtherIssueSelected] = useState(false);
  const [serviceRequest, setServiceRequest] = useState({
    full_name: null,
    call_back_phone: null,
    tractor_id: null,
    issue: null,
    issue_other: null,
  });

  const update = (key, value) => {
    setServiceRequest({ ...serviceRequest, [key]: value });
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  const issues = [
    'CEL (Check Engine Light) on',
    'SEL (Stop Engine light) on',
    'Unit in De-rate (Least Severe- 15 MPH limit)',
    'Unit in De-rate (Most Severe- 5 MPH limit)',
    'No Start (Engine Cranks but won\'t start)',
    'No Spin No Start (Engine won\'t turn over)',
    'Dead Batteries',
    'Service/Emergency air lines',
    '7 way pigtail',
    'Oil leak',
    'Coolant Leak',
    'Air Leak',
    'Transmission Leak',
    'Hydraulic Leak',
    'Heat/AC Inop.',
    'Headlights/ Clearance Lights/ Work lights/ Strobe light Inop.',
    'Windshield/door glass',
    'Windshield Wipers',
    'Horn (Electric or Air)',
    'Accidental Damage',
    'Other',
  ];

  useEffect(() => {
    const searchGroups = [];
    const userGroups = state.getUserGroups();
    if (userGroups && userGroups.length > 0) {
      userGroups.forEach((group) => {
        searchGroups.push({ id: group });
      });
    }
    const currentUser = state.getUser();
    if (currentUser) {
      update(FULL_NAME, currentUser.full_name);
      update(CALL_BACK_PHONE, currentUser.phone_number);
    }
    // Fetch available tractors (devices) for the user's groups
    api.getDevicesByGroups(searchGroups, (response) => {
      if (response && response.length > 0) {
        setTractors(response);
        if (!route.params) {
          update(TRACTOR_ID, response[0]?.name || '');
        } else {
          const device = route.params;
          for (let i = 0; i < response.length; i++) {
            const tractor = response[i];
            if (tractor.id === device.device.device.id) {
              setTractorIndex(new IndexPath(i));
              update(TRACTOR_ID, tractor.name);
              break;
            }
          }
        }
      } else {
        // No tractor data available, clear any tractor id
        setTractors([]);
        update(TRACTOR_ID, '');
      }
    });
  }, [route]);

  const renderTractors = () => {
    if (!tractors || tractors.length === 0) return null;
    return tractors.map((tractor, i) => (
      <SelectItem key={i} title={tractor.name} size="small" />
    ));
  };

  const setSelectedTractor = (index) => {
    setTractorIndex(index);
    update(TRACTOR_ID, tractors[index.row]?.name);
  };

  const getSelectedTractor = () => {
    return tractors.length > 0 ? tractors[tractorIndex.row]?.name : '';
  };

  const onIssueCheckChange = (checked, checkedIndex) => {
    let updatedIssues = [...selectedIssues];
    const isOther = checkedIndex === issues.length - 1;
    if (checked) {
      updatedIssues.push(checkedIndex);
    } else {
      updatedIssues = updatedIssues.filter((idx) => idx !== checkedIndex);
    }
    if (isOther) {
      setOtherIssueSelected(checked);
    }
    setSelectedIssues(updatedIssues);
  };

  const onSubmitPressed = async () => {
    const phoneNumber = formatPhoneNumber(serviceRequest.call_back_phone);
    // If tractor data is available, validate tractor_id; otherwise skip it
    if (
      !stringHasValue(serviceRequest.full_name) ||
      !stringHasValue(serviceRequest.call_back_phone) ||
      (tractors.length > 0 && !stringHasValue(serviceRequest.tractor_id))
    ) {
      showToast('Please fill out entire form prior to submission.', 'LONG');
      return;
    }
    if (selectedIssues.length === 0) {
      showToast('Please fill out entire form prior to submission.', 'LONG');
      return;
    }
    const otherIssue = selectedIssues.find((index) => index === (issues.length - 1));
    if (otherIssue && !stringHasValue(serviceRequest.issue_other)) {
      showToast('Please fill out entire form prior to submission.', 'LONG');
      return;
    }
    if (phoneNumber.length === 0) {
      showToast('The phone number appears to be invalid, please double check and try again.', 'LONG');
      return;
    }
    const selectedIssuesText = selectedIssues.map((idx) => issues[idx]).join(', ');
    // Set the ISSUE field on the service request
    serviceRequest[ISSUE] = selectedIssuesText;

    try {
      // Use Firestore web SDK to create a new service request document
      await setDoc(doc(collection(firestore, 'serviceRequests')), {
        ...serviceRequest,
        uid: getCurrentUser().uid,
        date_time: getToday().unix(),
      });
      setModalRequestSuccessful(true);
    } catch (error) {
      console.log(error);
      showToast('There was a problem submitting your service request, please try again.', 'LONG');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image source={require('../assets/images/background.png')} style={styles.backgroundImage} />
        <View style={styles.overlay} />
      </View>
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={onBackPress}>
          <Image source={require('../assets/images/arrow_back_ios_white_32dp.png')} />
        </Pressable>
        <Image source={require('../assets/images/goturbo-logo-rev.png')} style={styles.logo} />
      </View>
      <View style={styles.userInfoContainer}>
        <GTLabel label="Service Request" labelStyle={styles.titleLabel} />
        <GTLabel label={state.getUser()?.customer_name || ''} labelStyle={styles.customerName} />
      </View>
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 50, android: 50 })}
      >
        <ScrollView>
          <View style={styles.inputContainer}>
            <GTLabel label="Full Name" />
            <GTText
              viewStyle={styles.textInputView}
              props={{ placeholder: 'Full Name' }}
              textInputStyle={styles.textInput}
              value={serviceRequest.full_name}
              onChangeText={(text) => update(FULL_NAME, text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <GTLabel label="Call Back Phone" />
            <GTText
              viewStyle={styles.textInputView}
              props={{ placeholder: 'Call Back Phone', keyboardType: 'number-pad', returnKeyType: 'done' }}
              textInputStyle={styles.textInput}
              value={serviceRequest.call_back_phone}
              onChangeText={(text) => update(CALL_BACK_PHONE, text)}
            />
          </View>
          {tractors.length > 0 ? (
            <View style={styles.inputContainer}>
              <GTLabel label="Select Tractor ID" />
              <Select
                size="small"
                style={styles.select}
                placeholder="select ..."
                selectedIndex={tractorIndex}
                onSelect={(index) => setSelectedTractor(index)}
                value={getSelectedTractor()}
              >
                {renderTractors()}
              </Select>
              <View style={styles.divider} />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <GTLabel label="No tractors available" />
            </View>
          )}
          <View style={styles.inputContainer}>
            <GTLabel label="Select Issue(s)" labelStyle={styles.issueLabel} />
            {issues.map((issue, index) => (
              <GTCheckbox key={index} label={issue} onChange={(checked) => onIssueCheckChange(checked, index)} />
            ))}
          </View>
          {otherIssueSelected && (
            <View style={styles.inputContainer}>
              <GTLabel label="Other" />
              <GTText
                viewStyle={[styles.textInputView, { height: 100 }]}
                props={{ placeholder: 'Other', multiline: true }}
                textInputStyle={[styles.textInput, { textAlignVertical: 'top', paddingTop: 10, paddingBottom: 10 }]}
                value={serviceRequest.issue_other}
                onChangeText={(text) => update(ISSUE_OTHER, text)}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <GTButton
        label="SUBMIT"
        buttonStyle={[styles.submitButton, { backgroundColor: COLORS.GRAY }]}
        labelStyle={{ fontSize: 14 }}
        onPress={onSubmitPressed}
      />
      <DialogOKCancel
        visible={modalRequestSuccessful}
        message="Service request successfully submitted."
        onOKPress={onBackPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundContainer: { height: '100%', position: 'absolute', justifyContent: 'flex-end' },
  backgroundImage: { height: '100%' },
  overlay: { height: '100%', width: '100%', backgroundColor: '#000000', opacity: 0.6, position: 'absolute' },
  headerContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
  backButton: { left: 20, position: 'absolute', height: 50, width: 50, alignItems: 'center', justifyContent: 'center' },
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
  formContainer: { flex: 1, width: '100%', alignItems: 'center', paddingTop: 20 },
  inputContainer: { width: 350, marginBottom: 20 },
  textInputView: { width: '100%', backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0 },
  textInput: { paddingLeft: 5 },
  select: { width: 350 },
  divider: { height: 1, backgroundColor: COLORS.WHITE },
  issueLabel: { marginBottom: 10 },
  submitButton: { width: '100%' },
});

export default ServiceRequestScreen;
