import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
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
    neighborhood?: string;
  };
  description?: string;
  price: number;
  priceUnit: string;
  images: string[];
  rating: number;
  totalRatings: number;
  surfaceType: string;
  capacity: number;
  facilities: string[];
  contactPhone?: string;
  openingTime: string;
  closingTime: string;
}

const ArenaDetailsScreen: React.FC<ArenaDetailsScreenProps> = ({ route, navigation }) => {
  const { arenaId } = route.params;
  const [arena, setArena] = useState<Arena | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArenaDetails();
  }, [fetchArenaDetails]);

  const fetchArenaDetails = useCallback(async () => {
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
  }, [arenaId, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading arena details...</Text>
      </View>
    );
  }

  if (!arena) {
    return null;
  }

  const showRating = arena.rating > 0 && arena.totalRatings > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arena Details</Text>
        <NotificationBell navigation={navigation} dark />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: arena.images?.[0] || 'https://placehold.co/600x400/111827/E5E7EB?text=Arena' }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.arenaName}>{arena.name}</Text>
            {showRating ? (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{arena.rating.toFixed(1)}</Text>
                <Text style={styles.scoreMeta}>{arena.totalRatings} reviews</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.locationText}>
            {arena.location.address}
            {arena.location.neighborhood ? ` | ${arena.location.neighborhood}` : ''}
            {` | ${arena.location.city}`}
          </Text>

          <View style={styles.priceBanner}>
            <Text style={styles.priceLabel}>Listed Rate</Text>
            <Text style={styles.priceValue}>
              NPR {arena.price}/{arena.priceUnit}
            </Text>
          </View>

          {arena.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the venue</Text>
              <Text style={styles.sectionText}>{arena.description}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue snapshot</Text>
            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotCard}>
                <Text style={styles.snapshotLabel}>Surface</Text>
                <Text style={styles.snapshotValue}>{arena.surfaceType}</Text>
              </View>
              <View style={styles.snapshotCard}>
                <Text style={styles.snapshotLabel}>Capacity</Text>
                <Text style={styles.snapshotValue}>{arena.capacity} players</Text>
              </View>
              <View style={styles.snapshotCard}>
                <Text style={styles.snapshotLabel}>Opens</Text>
                <Text style={styles.snapshotValue}>{arena.openingTime}</Text>
              </View>
              <View style={styles.snapshotCard}>
                <Text style={styles.snapshotLabel}>Closes</Text>
                <Text style={styles.snapshotValue}>{arena.closingTime}</Text>
              </View>
            </View>
          </View>

          {arena.facilities?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesGrid}>
                {arena.facilities.map((facility) => (
                  <View key={facility} style={styles.facilityChip}>
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {arena.contactPhone ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{arena.contactPhone}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('BookingScreen', { arenaId: arena._id })}
        >
          <Text style={styles.primaryButtonText}>Book This Arena</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1E8',
  },
  loadingText: {
    marginTop: 14,
    color: '#5A6572',
    fontSize: 15,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#243744',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  body: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  arenaName: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: '#12212B',
  },
  scoreBadge: {
    backgroundColor: '#12212B',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreMeta: {
    color: '#D6DEE5',
    fontSize: 11,
    marginTop: 2,
  },
  locationText: {
    marginTop: 10,
    color: '#5F6B74',
    fontSize: 15,
    lineHeight: 21,
  },
  priceBanner: {
    marginTop: 18,
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1DFC0',
  },
  priceLabel: {
    color: '#9A4B14',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  priceValue: {
    marginTop: 8,
    color: '#12212B',
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#12212B',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionText: {
    color: '#495661',
    fontSize: 15,
    lineHeight: 22,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  snapshotCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  snapshotLabel: {
    color: '#7A8188',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  snapshotValue: {
    marginTop: 8,
    color: '#12212B',
    fontSize: 17,
    fontWeight: '800',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  facilityText: {
    color: '#36414A',
    fontSize: 12,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    color: '#7A8188',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contactValue: {
    color: '#12212B',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 90,
  },
  footer: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6DCC8',
  },
  primaryButton: {
    backgroundColor: '#F97316',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ArenaDetailsScreen;
