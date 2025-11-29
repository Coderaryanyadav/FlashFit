import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PRODUCTS = [
    { id: '1', title: 'Oversized Cotton T-Shirt', price: 999, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
    { id: '2', title: 'Slim Fit Denim Jeans', price: 2499, image: 'https://images.unsplash.com/photo-1542272617-08f086302542?w=800&q=80' },
    { id: '3', title: 'Classic White Sneakers', price: 3999, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' },
    { id: '4', title: 'Bomber Jacket', price: 4999, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80' },
];

export default function HomeScreen() {
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Product', { product: item })}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>FlashFit</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                    <Text style={styles.cartLink}>Cart</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={PRODUCTS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    cartLink: { fontSize: 16, color: '#000' },
    list: { padding: 8 },
    card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
    image: { width: '100%', height: 200, resizeMode: 'cover' },
    info: { padding: 8 },
    title: { fontSize: 14, marginBottom: 4 },
    price: { fontSize: 16, fontWeight: 'bold' },
});
