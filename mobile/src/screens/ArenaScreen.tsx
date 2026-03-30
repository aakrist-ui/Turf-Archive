import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

interface Arena {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    neighborhood?: string;
  };
  price: number;
  priceUnit: string;
  rating: number;
  totalRatings: number;
  surfaceType: string;
  capacity: number;
  closingTime: string;
  featuredTags?: string[];
  images: string[];
}

const getHotScore = (arena: Arena) => arena.rating * 30 + Math.min(arena.totalRatings, 500) * 0.2;
const hasRating = (arena: Arena) => arena.rating > 0 && arena.totalRatings > 0;

const ArenasScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'budget' | 'late'>('recommended');

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

  const cities = useMemo(() => ['All', ...new Set(arenas.map((arena) => arena.location.city))], [arenas]);

  const filteredArenas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return arenas
      .filter((arena) => {
        const matchesCity = selectedCity === 'All' || arena.location.city === selectedCity;
        const haystack = [
          arena.name,
          arena.location.address,
          arena.location.neighborhood || '',
          ...(arena.featuredTags || []),
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = normalizedQuery ? haystack.includes(normalizedQuery) : true;
        return matchesCity && matchesSearch;
      })
      .sort((a, b) => {
        if (selectedSort === 'budget') {
          return a.price - b.price || b.rating - a.rating;
        }

        if (selectedSort === 'late') {
          return b.closingTime.localeCompare(a.closingTime) || getHotScore(b) - getHotScore(a);
        }

        return getHotScore(b) - getHotScore(a);
      });
  }, [arenas, searchQuery, selectedCity, selectedSort]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Browse Arenas</Text>
          <NotificationBell navigation={navigation} dark />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by arena, neighborhood, or tag"
          placeholderTextColor="#7B8199"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.filterChip, selectedCity === city && styles.filterChipActive]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.filterChipText, selectedCity === city && styles.filterChipTextActive]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, styles.sortRow]}>
          {[
            { key: 'recommended', label: 'Recommended' },
            { key: 'budget', label: 'Lowest Price' },
            { key: 'late', label: 'Open Late' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortChip, selectedSort === option.key && styles.sortChipActive]}
              onPress={() => setSelectedSort(option.key as 'recommended' | 'budget' | 'late')}
            >
              <Text style={[styles.sortChipText, selectedSort === option.key && styles.sortChipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{filteredArenas.length} arenas matched</Text>
          <Text style={styles.resultsSubtext}>{selectedCity === 'All' ? 'Kathmandu Valley' : selectedCity}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Loading arena catalog...</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {filteredArenas.map((arena) => (
              <TouchableOpacity
                key={arena._id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ArenaDetails', { arenaId: arena._id })}
              >
                <Image
                  source={{ uri: arena.images?.[0] || 'https://placehold.co/600x400/111827/E5E7EB?text=Arena' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{arena.name}</Text>
                    <Text style={styles.cardPrice}>NPR {arena.price}</Text>
                  </View>
                  <Text style={styles.cardMeta}>
                    {arena.location.neighborhood || arena.location.city}, {arena.location.city}
                  </Text>
                  <Text style={styles.cardMeta}>{arena.location.address}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statText}>{arena.surfaceType}</Text>
                    <Text style={styles.statDivider}>|</Text>
                    <Text style={styles.statText}>{arena.capacity} players</Text>
                    <Text style={styles.statDivider}>|</Text>
                    <Text style={styles.statText}>Until {arena.closingTime}</Text>
                    {hasRating(arena) ? (
                      <>
                        <Text style={styles.statDivider}>|</Text>
                        <Text style={styles.statText}>{arena.rating.toFixed(1)} from {arena.totalRatings} reviews</Text>
                      </>
                    ) : null}
                  </View>
                  <View style={styles.tagRow}>
                    {(arena.featuredTags || []).slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    backgroundColor: '#12212B',
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  searchWrap: {
    marginTop: -18,
    paddingHorizontal: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    color: '#12212B',
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  content: {
    flex: 1,
    marginTop: 14,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sortRow: {
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  filterChipActive: {
    backgroundColor: '#12212B',
  },
  filterChipText: {
    color: '#42515C',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#F5F1E8',
  },
  sortChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF8EC',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1DFC0',
  },
  sortChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  sortChipText: {
    color: '#9A4B14',
    fontSize: 13,
    fontWeight: '700',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  resultsBar: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
  },
  resultsText: {
    color: '#12212B',
    fontSize: 18,
    fontWeight: '800',
  },
  resultsSubtext: {
    marginTop: 4,
    color: '#69747D',
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    color: '#5A6572',
    fontSize: 15,
  },
  listWrap: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    color: '#12212B',
    fontSize: 20,
    fontWeight: '800',
  },
  cardPrice: {
    color: '#B45309',
    fontSize: 18,
    fontWeight: '800',
  },
  cardMeta: {
    marginTop: 6,
    color: '#5F6B74',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  statText: {
    color: '#36414A',
    fontSize: 12,
    fontWeight: '700',
  },
  statDivider: {
    color: '#A7AFB6',
    fontSize: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    backgroundColor: '#12212B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#F3E6CC',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 90,
  },
});

export default ArenasScreen;
