import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ProductScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { product } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image source={{ uri: product.image }} style={styles.image} />
                <View style={styles.info}>
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.price}>₹{product.price}</Text>
                    <Text style={styles.description}>
                        Premium quality fashion delivered in minutes. This item is available for instant delivery.
                    </Text>

                    <View style={styles.sizes}>
                        {['S', 'M', 'L', 'XL'].map(size => (
                            <TouchableOpacity key={size} style={styles.sizeBox}>
                                <Text>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Cart', { item: product })}
                >
                    <Text style={styles.buttonText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 500, resizeMode: 'cover' },
    info: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    price: { fontSize: 20, marginBottom: 16 },
    description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
    sizes: { flexDirection: 'row', gap: 12 },
    sizeBox: { width: 40, height: 40, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
