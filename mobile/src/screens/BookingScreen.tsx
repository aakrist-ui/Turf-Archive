import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const BookingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>View your booking history</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.placeholderTitle}>No Bookings Yet</Text>
          <Text style={styles.placeholderText}>
            Your upcoming and past bookings will appear here
          </Text>
          
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Book an Arena</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1C1C2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666688',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#666688',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#00E5FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#0D0D1A',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingsScreen;