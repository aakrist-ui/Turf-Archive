import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

interface Arena {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  price: number;
  priceUnit: string;
  rating: number;
  surfaceType: string;
  capacity: number;
}

const ArenasScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    fetchArenas();
  }, []);

  const fetchArenas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/arenas');
      setArenas(response.data.data || []);
    } catch (error: any) {
      console.log('Error fetching arenas:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cities for filter
  const cities = ['All', ...new Set(arenas.map(a => a.location.city))];

  // Filter arenas
  const filteredArenas = arenas.filter(arena => {
    const matchesSearch = arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         arena.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All' || arena.location.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Arenas</Text>
        <Text style={styles.headerSubtitle}>Find and filter futsal arenas</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or address..."
            placeholderTextColor="#666688"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* City Filter */}
     {/* City Filter */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.filterContainer}
  contentContainerStyle={styles.filterContent}
>
  {cities.map((city) => (
    <TouchableOpacity
      key={city}
      style={[
        styles.filterChip,
        selectedCity === city && styles.filterChipActive
      ]}
      onPress={() => setSelectedCity(city)}
    >
      <Text
        style={[
          styles.filterText,
          selectedCity === city && styles.filterTextActive
        ]}
      >
        {city}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>

      {/* Arena List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredArenas.length} arena{filteredArenas.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00E5FF" />
            <Text style={styles.loadingText}>Loading arenas...</Text>
          </View>
        ) : filteredArenas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏟️</Text>
            <Text style={styles.emptyTitle}>No arenas found</Text>
            <Text style={styles.emptyText}>Try a different search or filter</Text>
          </View>
        ) : (
          <View style={styles.arenaList}>
            {filteredArenas.map((arena) => (
              <TouchableOpacity
                key={arena._id}
                style={styles.arenaCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ArenaDetails', { arenaId: arena._id })}
              >
                {/* Arena Icon */}
                <View style={styles.arenaIcon}>
                  <Text style={styles.iconEmoji}>🏟️</Text>
                </View>

                {/* Arena Details */}
                <View style={styles.arenaDetails}>
                  <Text style={styles.arenaName} numberOfLines={1}>
                    {arena.name}
                  </Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText} numberOfLines={1}>
                      {arena.location.address}
                    </Text>
                  </View>

                  <View style={styles.tagsRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{arena.surfaceType}</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{arena.capacity} players</Text>
                    </View>
                  </View>
                </View>

                {/* Price & Rating */}
                <View style={styles.arenaRight}>
                  {arena.rating > 0 && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>⭐ {arena.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  <Text style={styles.priceText}>NPR {arena.price}</Text>
                  <Text style={styles.priceUnit}>{arena.priceUnit}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666688',
    marginTop: 4,
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
  filterContainer: {
    backgroundColor: '#1C1C2E',
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2A2A45',
    borderRadius: 20,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#00E5FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterTextActive: {
    color: '#0D0D1A',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  resultsText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  arenaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A45',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  arenaDetails: {
    flex: 1,
  },
  arenaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666688',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#2A2A45',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#00E5FF',
    fontWeight: '600',
  },
  arenaRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  ratingContainer: {
    backgroundColor: '#2A2A45',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00E5FF',
  },
  priceUnit: {
    fontSize: 11,
    color: '#666688',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ArenasScreen;