import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useAppState } from '../services/stateService';
import { useApiService } from '../services/apiService';
import GTLabel from '../components/gtLabel';
import { useIsFocused } from '@react-navigation/native';
import GTButton from '../components/gtButton';
import { findDeviceById, COLORS } from '../constants';
import { Tab, TabView } from '@ui-kitten/components';
import { showToast } from '../utils/toast';

// Define constants outside the component
const CALLOUT_WIDTH = 300;
const CALLOUT_HEIGHT = 300;
const COLUMN_ONE_WIDTH = 220;
const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

function MapScreen({ navigation }) {
    const state = useAppState();
    const api = useApiService();
    const map = useRef(null);
    const isFocused = useIsFocused();
    const [devices, setDevices] = useState([]);
    const [markerRefs, setMarkerRefs] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onBackPress = () => {
        navigation.goBack();
    };

    useEffect(() => {
        // Log the state to debug

        if (!state.credentials) {
            console.log("No credentials available - trying to authenticate");

            // You could optionally try to authenticate here
            api.authenticate(
                function (response) {
                    console.log("Authentication successful from map screen");
                    // Now make the API call for devices
                    fetchDevices();
                },
                function (error) {
                    console.log("Authentication failed from map screen:", error);
                    showToast('Unable to authenticate with the tracking service', 'LONG');
                }
            );
            return;
        }

        // Only run this if we have credentials
        fetchDevices();
    }, [isFocused]);

    const fetchDevices = () => {
        let search_groups = [];

        // Get all devices for all groups
        for (let i = 0; i < state.getUserGroups().length; i++) {
            const group = state.getUserGroups()[i];
            search_groups.push({ 'id': group });
        }

        api.getDevicesStatusInfoByGroups(
            search_groups,
            function (results) {
                // Sort the devices by name
                results.sort((a, b) => {
                    const deviceA = findDeviceById(state.getUserDevices(), a.device.id);
                    const deviceB = findDeviceById(state.getUserDevices(), b.device.id);
                    return (deviceA?.name > deviceB?.name) ? 1 : -1;
                });

                setDevices(results);
            },
            function (error) {
                console.log("Error fetching device status:", error);
                showToast("Could not load device information", "LONG");
            }
        );
    };

    const onCalloutPress = (markerId, id) => {
        if (markerRefs[markerId]) {
            markerRefs[markerId].hideCallout();
        }
        navigation.navigate('ServiceRequest', { device: devices[id] });
    };

    const onMapReady = () => {
        if (!map || !map.current || devices.length === 0) {
            return;
        }

        // Fit the map to show all markers
        map.current.fitToCoordinates(devices, {
            edgePadding: DEFAULT_PADDING,
            animated: true
        });
    };

    const renderTractors = () => {
        let items = [];
        const TITLE_WIDTH = 110;
        const FONT_SIZE = 14;

        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const deviceInfo = findDeviceById(state.getUserDevices(), device.device.id);

            items.push(
                <View key={i}>
                    <View style={styles.tractorRow}>
                        <GTLabel
                            label={'Tractor:'}
                            labelStyle={[styles.tractorLabel, { width: TITLE_WIDTH, fontSize: FONT_SIZE }]}
                        />
                        <GTLabel
                            label={deviceInfo?.name || 'Unknown'}
                            labelStyle={[styles.tractorValue, { flex: 1, fontSize: FONT_SIZE }]}
                        />
                    </View>

                    <View style={styles.tractorRow}>
                        <GTLabel
                            label={'Speed:'}
                            labelStyle={[styles.tractorLabel, { width: TITLE_WIDTH, fontSize: FONT_SIZE }]}
                        />
                        <GTLabel
                            label={device.speed}
                            labelStyle={[styles.tractorValue, { flex: 1, fontSize: FONT_SIZE }]}
                        />
                    </View>

                    <View style={styles.tractorRow}>
                        <GTLabel
                            label={'Driving:'}
                            labelStyle={[styles.tractorLabel, { width: TITLE_WIDTH, fontSize: FONT_SIZE }]}
                        />
                        <GTLabel
                            label={device.isDriving ? 'Yes' : 'No'}
                            labelStyle={[styles.tractorValue, { flex: 1, fontSize: FONT_SIZE }]}
                        />
                    </View>

                    <View style={styles.tractorRow}>
                        <GTLabel
                            label={'Communicating:'}
                            labelStyle={[styles.tractorLabel, { width: TITLE_WIDTH, fontSize: FONT_SIZE }]}
                        />
                        <GTLabel
                            label={device.isDeviceCommunicating ? 'Yes' : 'No'}
                            labelStyle={[styles.tractorValue, { flex: 1, fontSize: FONT_SIZE }]}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <GTButton
                            label={'TURBO SUPPORT'}
                            buttonStyle={styles.supportButton}
                            labelStyle={styles.supportButtonText}
                            onPress={() => onCalloutPress(`id${i}`, i)}
                        />
                    </View>

                    <View style={styles.divider} />
                </View>
            );
        }

        return items;
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    label={'Tractors'}
                    labelStyle={styles.titleText}
                />
                <GTLabel
                    label={state.getUser()?.customer_name || ''}
                    labelStyle={styles.subtitleText}
                />
            </View>

            <View style={styles.content}>
                <TabView
                    selectedIndex={selectedIndex}
                    onSelect={index => setSelectedIndex(index)}
                >
                    <Tab title={'Map'}>
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={map}
                                style={styles.map}
                                onMapReady={onMapReady}
                            >
                                {devices.map((marker, i) => (
                                    <Marker
                                        key={i}
                                        identifier={`id${i}`}
                                        ref={ref => { markerRefs[`id${i}`] = ref; }}
                                        coordinate={marker}
                                        calloutOffset={{ x: 0, y: Platform.select({ ios: 0, android: -125 }) }}
                                        calloutAnchor={{ x: 0.5, y: 6 }}
                                    >
                                        <View>
                                            <Image source={require('../assets/images/gps_fixed_white_24dp.png')} />
                                        </View>
                                        <Callout
                                            style={styles.callout}
                                            tooltip={true}
                                            onPress={() => onCalloutPress(`id${i}`, i)}
                                        >
                                            <View style={styles.calloutOuter}>
                                                <View style={styles.calloutInner}>
                                                    <View style={styles.calloutContent}>
                                                        <View style={styles.calloutHeader}>
                                                            <GTLabel
                                                                labelStyle={styles.calloutHeaderTitle}
                                                                label={'Tractor ID:'}
                                                            />
                                                        </View>
                                                        <View style={styles.calloutHeader}>
                                                            <GTLabel
                                                                labelStyle={styles.calloutHeaderValue}
                                                                label={findDeviceById(state.getUserDevices(), marker.device.id)?.name || 'Unknown'}
                                                            />
                                                        </View>

                                                        <View style={styles.calloutRow}>
                                                            <View style={[styles.calloutColumn, { width: COLUMN_ONE_WIDTH }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutLabel}
                                                                    label={'Speed:'}
                                                                />
                                                            </View>
                                                            <View style={{ width: 10 }} />
                                                            <View style={[styles.calloutColumn, { flex: 1 }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutValue}
                                                                    label={marker.speed}
                                                                />
                                                            </View>
                                                        </View>

                                                        <View style={styles.calloutRow}>
                                                            <View style={[styles.calloutColumn, { width: COLUMN_ONE_WIDTH }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutLabel}
                                                                    label={'Is Driving:'}
                                                                />
                                                            </View>
                                                            <View style={{ width: 10 }} />
                                                            <View style={[styles.calloutColumn, { flex: 1 }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutValue}
                                                                    label={marker.isDriving ? 'Yes' : 'No'}
                                                                />
                                                            </View>
                                                        </View>

                                                        <View style={styles.calloutRow}>
                                                            <View style={[styles.calloutColumn, { width: COLUMN_ONE_WIDTH }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutLabel}
                                                                    label={'Is Device Communicating:'}
                                                                />
                                                            </View>
                                                            <View style={{ width: 10 }} />
                                                            <View style={[styles.calloutColumn, { flex: 1 }]}>
                                                                <GTLabel
                                                                    labelStyle={styles.calloutValue}
                                                                    label={marker.isDeviceCommunicating ? 'Yes' : 'No'}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>

                                                    <View style={styles.calloutButtonContainer}>
                                                        <GTButton
                                                            label={'TURBO SUPPORT'}
                                                            buttonStyle={styles.calloutButton}
                                                            labelStyle={styles.calloutButtonText}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </Callout>
                                    </Marker>
                                ))}
                            </MapView>
                        </View>
                    </Tab>

                    <Tab title={'List'}>
                        <View style={styles.listContainer}>
                            <ScrollView style={styles.scrollView}>
                                {renderTractors()}
                            </ScrollView>
                        </View>
                    </Tab>
                </TabView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        height: 100,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
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
    content: {
        flex: 1,
        width: '100%',
    },
    mapContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    map: {
        height: '100%',
        width: '100%',
    },
    callout: {
        width: CALLOUT_WIDTH,
        height: CALLOUT_HEIGHT,
        backgroundColor: '#ffffff',
    },
    calloutOuter: {
        backgroundColor: '#0000001f',
        width: CALLOUT_WIDTH,
        height: CALLOUT_HEIGHT,
    },
    calloutInner: {
        backgroundColor: '#ffffff',
        width: CALLOUT_WIDTH - 2,
        height: CALLOUT_HEIGHT - 2,
    },
    calloutContent: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    calloutHeader: {
        alignContent: 'center',
        justifyContent: 'center',
    },
    calloutHeaderTitle: {
        color: '#000000',
        textAlign: 'center',
        fontSize: 18,
    },
    calloutHeaderValue: {
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'ProximaNova-Bold',
        fontSize: 18,
    },
    calloutRow: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    calloutColumn: {
        alignContent: 'center',
        justifyContent: 'center',
    },
    calloutLabel: {
        color: '#000000',
        textAlign: 'right',
        fontSize: 18,
    },
    calloutValue: {
        color: '#000000',
        fontFamily: 'ProximaNova-Bold',
        fontSize: 18,
    },
    calloutButtonContainer: {
        padding: 30,
    },
    calloutButton: {
        width: '100%',
        backgroundColor: COLORS.RED,
    },
    calloutButtonText: {
        fontSize: 16,
    },
    listContainer: {
        width: '100%',
        flex: 1,
    },
    scrollView: {
        marginBottom: 75,
    },
    tractorRow: {
        flexDirection: 'row',
    },
    tractorLabel: {
        fontFamily: 'ProximaNova-SemiBold',
    },
    tractorValue: {
        fontFamily: 'ProximaNova',
    },
    buttonContainer: {
        padding: 5,
    },
    supportButton: {
        width: '100%',
        backgroundColor: COLORS.RED,
        height: 30,
    },
    supportButtonText: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.WHITE,
        flex: 1,
        marginTop: 5,
        marginBottom: 10,
    },
});

export default MapScreen;