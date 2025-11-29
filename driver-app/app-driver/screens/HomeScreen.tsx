import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, FlatList, Alert, Platform, Image } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Conditionally import MapView to avoid web crashes
let MapView: any, Marker: any;
if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
}

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    useEffect(() => {
        if (!isOnline) {
            setOrders([]);
            return;
        }

        const q = query(collection(db, "orders"), where("status", "==", "placed"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
                // Filter for orders within 5km radius (Mock logic: assuming 'distance' field or random check)
                .filter((order: any) => {
                    // In production, calculate distance between driver location and order.address.coordinates
                    // For now, we simulate this check
                    const mockDistance = order.distance || Math.random() * 10;
                    return mockDistance <= 5;
                });
            setOrders(ordersData);
        });

        return () => unsubscribe();
    }, [isOnline]);

    const toggleSwitch = () => setIsOnline(previousState => !previousState);

    const handleAcceptOrder = async (order: any) => {
        try {
            await updateDoc(doc(db, "orders", order.id), {
                status: "assigned",
                driverId: "DRIVER_123",
                driverName: "John Driver"
            });
            setActiveOrder(order);
            Alert.alert("Success", "Order accepted! Navigate to pickup.");
        } catch (error) {
            Alert.alert("Error", "Failed to accept order.");
        }
    };

    const handleCompleteOrder = async () => {
        if (!activeOrder) return;
        try {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                status: "delivered",
            });
            setActiveOrder(null);
            Alert.alert("Success", "Order Delivered!");
        } catch (error) {
            Alert.alert("Error", "Failed to complete order.");
        }
    }

    const renderMap = () => {
        if (Platform.OS === 'web') {
            return (
                <View style={styles.webMapContainer}>
                    <View style={styles.webMapPlaceholder}>
                        {/* Map Background Pattern */}
                        <View style={[StyleSheet.absoluteFill, { opacity: 0.2, backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' } as any]} />

                        {/* Simulated Roads - SVG not directly supported in RN Web without libs, using Views for lines */}
                        <View style={{ position: 'absolute', width: '100%', height: 2, backgroundColor: '#333', top: '30%', transform: [{ rotate: '10deg' }] }} />
                        <View style={{ position: 'absolute', width: '100%', height: 2, backgroundColor: '#333', top: '70%', transform: [{ rotate: '-5deg' }] }} />
                        <View style={{ position: 'absolute', width: 2, height: '100%', backgroundColor: '#333', left: '40%' }} />

                        {/* Driver Location Pulse */}
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(168, 85, 247, 0.3)', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#A855F7' }} />
                        </View>

                        <Text style={[styles.webMapText, { marginTop: 20 }]}>📍 Live Map View</Text>
                        <Text style={styles.webMapSubText}>
                            {location ? `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}` : "Locating..."}
                        </Text>
                    </View>
                    {activeOrder && (
                        <View style={styles.webRouteLine}>
                            <Text style={styles.webRouteText}>--- 🟣 Navigating to {activeOrder.address?.street} ---</Text>
                            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>Distance: 3.2 km • ETA: 12 mins</Text>
                        </View>
                    )}
                </View>
            );
        }

        return (
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 28.6139,
                    longitude: 77.2090,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        title="You are here"
                    />
                )}
                {activeOrder && activeOrder.address && (
                    <Marker
                        coordinate={{
                            latitude: 28.6200,
                            longitude: 77.2100
                        }}
                        title="Delivery Location"
                        description={activeOrder.address.street}
                        pinColor="blue"
                    />
                )}
            </MapView>
        );
    };

    return (
        <View style={styles.container}>
            {renderMap()}

            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#39FF14" }}
                        thumbColor={isOnline ? "#fff" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isOnline}
                    />
                </View>

                {activeOrder && (
                    <View style={styles.activeOrderCard}>
                        <Text style={styles.activeTitle}>Navigating to Delivery</Text>
                        <Text style={styles.orderSub}>{activeOrder.address?.name}</Text>
                        <Text style={styles.orderSub}>{activeOrder.address?.street}</Text>
                        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteOrder}>
                            <Text style={styles.completeButtonText}>Complete Delivery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isOnline && !activeOrder && orders.length > 0 && (
                    <View style={styles.ordersContainer}>
                        <FlatList
                            data={orders}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={styles.orderCard}>
                                    <Text style={styles.orderTitle}>New Order: ₹{item.totalAmount}</Text>
                                    <Text style={styles.orderSub}>{item.address?.street}</Text>
                                    <View style={styles.orderStats}>
                                        <Text style={styles.stat}>3.5 km</Text>
                                        <Text style={styles.stat}>•</Text>
                                        <Text style={styles.stat}>₹{item.totalAmount}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.acceptButton}
                                        onPress={() => handleAcceptOrder(item)}
                                    >
                                        <Text style={styles.acceptButtonText}>Accept Order</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                )}

                {isOnline && !activeOrder && orders.length === 0 && (
                    <View style={styles.waitingCard}>
                        <Text style={styles.waitingText}>Searching for orders...</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { width: Dimensions.get('window').width, height: '100%' },

    // Web Map Styles
    webMapContainer: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
    webMapPlaceholder: { padding: 20, backgroundColor: 'rgba(30,30,30,0.9)', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    webMapText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    webMapSubText: { fontSize: 14, color: '#aaa' },
    webRouteLine: { marginTop: 20 },
    webRouteText: { color: '#A855F7', fontWeight: 'bold' }, // Purple

    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', pointerEvents: 'box-none' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.9)', margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    statusText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    ordersContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: 10 },
    orderCard: { backgroundColor: '#111', padding: 20, marginHorizontal: 10, borderRadius: 20, width: Dimensions.get('window').width - 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 10, borderWidth: 1, borderColor: '#333' },
    orderTitle: { fontSize: 22, fontWeight: '900', marginBottom: 5, color: '#fff' },
    orderSub: { fontSize: 16, color: '#aaa', marginBottom: 10 },
    orderStats: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    stat: { fontSize: 16, fontWeight: '600', color: '#ccc' },
    acceptButton: { backgroundColor: '#A855F7', padding: 16, borderRadius: 12, alignItems: 'center' }, // Purple
    acceptButtonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
    activeOrderCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#111', padding: 20, borderRadius: 20, elevation: 10, borderWidth: 1, borderColor: '#A855F7' },
    activeTitle: { fontSize: 18, fontWeight: 'bold', color: '#A855F7', marginBottom: 10 },
    completeButton: { backgroundColor: '#A855F7', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    completeButtonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
    waitingCard: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(20,20,20,0.9)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: '#333' },
    waitingText: { color: '#A855F7', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});
