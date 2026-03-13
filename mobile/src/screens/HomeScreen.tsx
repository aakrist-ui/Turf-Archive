import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Arena {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  price: number;
  priceUnit: string;
  images: string[];
  rating: number;
  surfaceType: string;
  facilities: string[];
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArenas();
  }, []);

  const fetchArenas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/arenas');
      console.log('Arenas fetched:', response.data);
      setArenas(response.data.data || []);
    } catch (error: any) {
      console.log('Error fetching arenas:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArenas();
    setRefreshing(false);
  };

  const filteredArenas = arenas.filter(arena =>
    arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    arena.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderArenaCard = (arena: Arena) => (
    <TouchableOpacity
      key={arena._id}
      style={styles.arenaCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ArenaDetail', { arenaId: arena._id })} 
    >
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
        {/* Rating Badge */}
        {arena.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {arena.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Arena Info */}
      <View style={styles.arenaInfo}>
        <Text style={styles.arenaName} numberOfLines={1}>
          {arena.name}
        </Text>
        
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {arena.location.city}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.surfaceTag}>
            <Text style={styles.surfaceText}>{arena.surfaceType}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>NPR {arena.price}</Text>
            <Text style={styles.priceUnit}>/{arena.priceUnit}</Text>
          </View>
        </View>

        {/* Facilities */}
        {arena.facilities && arena.facilities.length > 0 && (
          <View style={styles.facilitiesRow}>
            {arena.facilities.slice(0, 3).map((facility, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
            {arena.facilities.length > 3 && (
              <Text style={styles.moreFacilities}>
                +{arena.facilities.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search arenas or city..."
            placeholderTextColor="#666688"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00E5FF"
          />
        }
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Arenas</Text>
          <Text style={styles.arenaCount}>
            {filteredArenas.length} arena{filteredArenas.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00E5FF" />
            <Text style={styles.loadingText}>Loading arenas...</Text>
          </View>
        ) : filteredArenas.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏟️</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No arenas found' : 'No arenas available'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search term'
                : 'Check back later for new arenas'}
            </Text>
          </View>
        ) : (
          // Arena List
          <View style={styles.arenaList}>
            {filteredArenas.map(renderArenaCard)}
          </View>
        )}

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacer} />
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
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1C1C2E',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A45',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arenaCount: {
    fontSize: 14,
    color: '#666688',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666688',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666688',
    textAlign: 'center',
  },
  arenaList: {
    paddingHorizontal: 24,
  },
  arenaCard: {
    backgroundColor: '#1C1C2E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
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
    backgroundColor: '#2A2A45',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arenaInfo: {
    padding: 16,
  },
  arenaName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666688',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surfaceTag: {
    backgroundColor: '#2A2A45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  surfaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00E5FF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00E5FF',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666688',
    marginLeft: 4,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  facilityTag: {
    backgroundColor: '#2A2A45',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 4,
  },
  facilityText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  moreFacilities: {
    fontSize: 11,
    color: '#666688',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;