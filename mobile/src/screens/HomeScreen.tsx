import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
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
  description?: string;
  location: {
    address: string;
    city: string;
    neighborhood?: string;
  };
  price: number;
  priceUnit: string;
  images: string[];
  rating: number;
  totalRatings: number;
  surfaceType: string;
  facilities: string[];
  featuredTags?: string[];
  openingTime: string;
  closingTime: string;
}

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isArenaOpenNow = (arena: Arena) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= getMinutes(arena.openingTime) && currentMinutes < getMinutes(arena.closingTime);
};

const getHotScore = (arena: Arena) => arena.rating * 30 + Math.min(arena.totalRatings, 500) * 0.2;
const hasRating = (arena: Arena) => arena.rating > 0 && arena.totalRatings > 0;

const formatClosingTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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

  const filteredArenas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return arenas;
    }

    return arenas.filter((arena) => {
      const haystack = [
        arena.name,
        arena.location.city,
        arena.location.neighborhood || '',
        arena.location.address,
        ...(arena.featuredTags || []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [arenas, searchQuery]);

  const hotNowArenas = useMemo(
    () => filteredArenas.filter(isArenaOpenNow).sort((a, b) => getHotScore(b) - getHotScore(a)).slice(0, 5),
    [filteredArenas],
  );

  const budgetArenas = useMemo(
    () => filteredArenas.filter((arena) => arena.price < 1300).sort((a, b) => a.price - b.price || getHotScore(b) - getHotScore(a)).slice(0, 5),
    [filteredArenas],
  );

  const lateNightArenas = useMemo(
    () => filteredArenas.filter((arena) => getMinutes(arena.closingTime) >= 21 * 60).sort((a, b) => getHotScore(b) - getHotScore(a)).slice(0, 5),
    [filteredArenas],
  );

  const notices = useMemo(() => {
    if (!arenas.length) {
      return [];
    }

    const cheapest = [...arenas].sort((a, b) => a.price - b.price)[0];
    const openNowCount = arenas.filter(isArenaOpenNow).length;
    const lateNightCount = arenas.filter((arena) => getMinutes(arena.closingTime) >= 21 * 60).length;
    const cityCount = new Set(arenas.map((arena) => arena.location.city)).size;

    return [
      {
        title: 'Open Now',
        text: `${openNowCount} venues are currently open across Kathmandu Valley.`,
      },
      {
        title: 'Lowest Rate',
        text: `${cheapest.name} starts from NPR ${cheapest.price}/${cheapest.priceUnit}.`,
      },
      {
        title: 'Open Late',
        text: `${lateNightCount} arenas stay open until 9 PM or later.`,
      },
      {
        title: 'Across The Valley',
        text: `${arenas.length} venues are listed across ${cityCount} cities.`,
      },
    ];
  }, [arenas]);

  const renderCompactArenaCard = (arena: Arena, accent: 'teal' | 'amber') => (
    <TouchableOpacity
      key={arena._id}
      style={styles.highlightCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ArenaDetails', { arenaId: arena._id })}
    >
      <Image
        source={{ uri: arena.images?.[0] || 'https://placehold.co/600x400/111827/E5E7EB?text=Arena' }}
        style={styles.highlightImage}
        resizeMode="cover"
      />
      <View style={styles.highlightBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.highlightName} numberOfLines={1}>
            {arena.name}
          </Text>
          {hasRating(arena) ? (
            <View style={[styles.scorePill, accent === 'amber' ? styles.scorePillAmber : styles.scorePillTeal]}>
              <Text style={styles.scoreText}>{arena.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.highlightMeta} numberOfLines={1}>
          {arena.location.neighborhood || arena.location.city}, {arena.location.city}
        </Text>
        <Text style={styles.highlightMeta}>
          NPR {arena.price}/{arena.priceUnit}
        </Text>
        <View style={styles.tagsRow}>
          {(arena.featuredTags || []).slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFullArenaCard = (arena: Arena) => (
    <TouchableOpacity
      key={arena._id}
      style={styles.arenaCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ArenaDetails', { arenaId: arena._id })}
    >
      <Image
        source={{ uri: arena.images?.[0] || 'https://placehold.co/600x400/111827/E5E7EB?text=Arena' }}
        style={styles.arenaImage}
        resizeMode="cover"
      />
      <View style={styles.arenaOverlay}>
        {hasRating(arena) ? (
          <View style={styles.ratingPill}>
            <Text style={styles.ratingPillText}>
              {arena.rating.toFixed(1)} | {arena.totalRatings} reviews
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.arenaInfo}>
        <View style={styles.rowBetween}>
          <Text style={styles.arenaName}>{arena.name}</Text>
          <Text style={styles.arenaPrice}>NPR {arena.price}</Text>
        </View>
        <Text style={styles.arenaSubline}>
          {arena.location.address} | {arena.surfaceType}
        </Text>
        <Text style={styles.arenaSubline}>
          Open {arena.openingTime} to {formatClosingTime(arena.closingTime)}
        </Text>
        <View style={styles.tagsRow}>
          {(arena.featuredTags || []).slice(0, 3).map((tag) => (
            <View key={tag} style={styles.facilityChip}>
              <Text style={styles.facilityChipText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Home</Text>
          <NotificationBell navigation={navigation} dark />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by arena, area, or city"
          placeholderTextColor="#7B8199"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Loading Kathmandu Valley arenas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notices</Text>
                <Text style={styles.sectionMeta}>Today</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                {notices.map((notice) => (
                  <View key={notice.title} style={styles.noticeCard}>
                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                    <Text style={styles.noticeText}>{notice.text}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>What&apos;s Hot Now</Text>
                <Text style={styles.sectionMeta}>{hotNowArenas.length} open now</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                {hotNowArenas.map((arena) => renderCompactArenaCard(arena, 'teal'))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Budget-Friendly Picks</Text>
                <Text style={styles.sectionMeta}>Under NPR 1300</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                {budgetArenas.map((arena) => renderCompactArenaCard(arena, 'amber'))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Late-Night Arenas</Text>
                <Text style={styles.sectionMeta}>9 PM onward closings</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                {lateNightArenas.map((arena) => renderCompactArenaCard(arena, 'teal'))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Arenas</Text>
                <Text style={styles.sectionMeta}>{filteredArenas.length} listed</Text>
              </View>
              {filteredArenas.map(renderFullArenaCard)}
            </View>
          </>
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
    marginBottom: 8,
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
  },
  loadingContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: '#5A6572',
    fontSize: 15,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#12212B',
  },
  sectionMeta: {
    color: '#6F7B85',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  horizontalContent: {
    paddingHorizontal: 20,
  },
  noticeCard: {
    width: 220,
    backgroundColor: '#FFF8EC',
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0DFC0',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A04A12',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#36414A',
  },
  highlightCard: {
    width: 255,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  highlightImage: {
    width: '100%',
    height: 132,
  },
  highlightBody: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  highlightName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#12212B',
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scorePillTeal: {
    backgroundColor: '#D7F3EA',
  },
  scorePillAmber: {
    backgroundColor: '#FCE7C8',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12212B',
  },
  highlightMeta: {
    color: '#5F6B74',
    fontSize: 13,
    marginTop: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    backgroundColor: '#EFF3F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#42515C',
  },
  arenaCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DCC8',
  },
  arenaImage: {
    width: '100%',
    height: 180,
  },
  arenaOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  ratingPill: {
    backgroundColor: 'rgba(18, 33, 43, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  ratingPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  arenaInfo: {
    padding: 16,
  },
  arenaName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#12212B',
    marginRight: 12,
  },
  arenaPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
  },
  arenaSubline: {
    marginTop: 7,
    color: '#5F6B74',
    fontSize: 14,
    lineHeight: 20,
  },
  facilityChip: {
    backgroundColor: '#12212B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  facilityChipText: {
    color: '#F3E6CC',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 90,
  },
});

export default HomeScreen;
