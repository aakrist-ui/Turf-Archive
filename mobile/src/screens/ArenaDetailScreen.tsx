import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../services/api';

interface ArenaDetailsScreenProps {
  route: any;
  navigation: any;
}

interface Arena {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  description: string;
  price: number;
  priceUnit: string;
  images: string[];
  rating: number;
  totalRatings: number;
  surfaceType: string;
  capacity: number;
  facilities: string[];
  openingTime: string;
  closingTime: string;
}

const ArenaDetailsScreen: React.FC<ArenaDetailsScreenProps> = ({ route, navigation }) => {
  const { arenaId } = route.params;
  const [arena, setArena] = useState<Arena | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchArenaDetails();
  }, []);

  const fetchArenaDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/arenas/${arenaId}`);
      setArena(response.data.data);
    } catch (error: any) {
      console.log('Error fetching arena:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load arena details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    Alert.alert(
      'Book Arena',
      'Booking feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Loading arena details...</Text>
      </View>
    );
  }

  if (!arena) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arena Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Arena Image */}
        <View style={styles.imageContainer}>
          {arena.images && arena.images.length > 0 ? (
            <Image
              source={{ uri: arena.images[0] }}
              style={styles.arenaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>🏟️</Text>
            </View>
          )}
        </View>

        {/* Arena Info Section */}
        <View style={styles.infoSection}>
          {/* Name and Rating */}
          <View style={styles.titleRow}>
            <Text style={styles.arenaName}>{arena.name}</Text>
            {arena.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {arena.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({arena.totalRatings})</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{arena.location.address}, {arena.location.city}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price:</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>NPR {arena.price}</Text>
              <Text style={styles.priceUnit}>/{arena.priceUnit}</Text>
            </View>
          </View>

          {/* Description */}
          {arena.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{arena.description}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>⚽</Text>
              <Text style={styles.detailValue}>{arena.surfaceType}</Text>
              <Text style={styles.detailLabel}>Surface</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailValue}>{arena.capacity}</Text>
              <Text style={styles.detailLabel}>Capacity</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailValue}>{arena.openingTime}</Text>
              <Text style={styles.detailLabel}>Opens</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>🕘</Text>
              <Text style={styles.detailValue}>{arena.closingTime}</Text>
              <Text style={styles.detailLabel}>Closes</Text>
            </View>
          </View>

          {/* Facilities */}
          {arena.facilities && arena.facilities.length > 0 && (
            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesGrid}>
                {arena.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityChip}>
                    <Text style={styles.facilityText}>✓ {facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Text style={styles.bookButtonSubtext}>NPR {arena.price}/{arena.priceUnit}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666688',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#2A2A45',
  },
  arenaImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  infoSection: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  arenaName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666688',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#a0aec0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A2A45',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#a0aec0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00E5FF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666688',
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#a0aec0',
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  detailCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666688',
  },
  facilitiesSection: {
    marginBottom: 24,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  facilityChip: {
    backgroundColor: '#2A2A45',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  facilityText: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#1C1C2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A45',
  },
  bookButton: {
    backgroundColor: '#00E5FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D1A',
  },
  bookButtonSubtext: {
    fontSize: 13,
    color: '#0D0D1A',
    marginTop: 2,
    opacity: 0.7,
  },
});

export default ArenaDetailsScreen;