import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function CartScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (route.params?.item) {
            setItems(prev => [...prev, route.params.item]);
        }
    }, [route.params?.item]);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Shopping Bag</Text>

            {items.length === 0 ? (
                <View style={styles.empty}>
                    <Text>Your bag is empty</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Image source={{ uri: item.image }} style={styles.image} />
                            <View style={styles.details}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.price}>₹{item.price}</Text>
                            </View>
                        </View>
                    )}
                />
            )}

            <View style={styles.footer}>
                <View style={styles.row}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.button, items.length === 0 && styles.disabled]}
                    disabled={items.length === 0}
                    onPress={() => alert('Razorpay Integration Stub')}
                >
                    <Text style={styles.buttonText}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    item: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    image: { width: 80, height: 80, borderRadius: 4 },
    details: { marginLeft: 16, justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: '500' },
    price: { fontSize: 16, marginTop: 4 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    totalLabel: { fontSize: 18 },
    totalValue: { fontSize: 18, fontWeight: 'bold' },
    button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
    disabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
