import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function EarningsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Earnings</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Today</Text>
                <Text style={styles.amount}>₹1,250</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>This Week</Text>
                <Text style={styles.amount}>₹8,400</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 16 },
    label: { fontSize: 16, color: '#666', marginBottom: 8 },
    amount: { fontSize: 32, fontWeight: 'bold' },
});
