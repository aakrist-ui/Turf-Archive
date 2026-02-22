import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import ArenaCard, { Arena } from '../components/ArenaCard';
import { arenaService } from '../services/arenaService';

const FILTERS = ['All', 'Nearby', 'Top Rated', 'Budget'];

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [filtered, setFiltered] = useState<Arena[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArenas = useCallback(async () => {
    try {
      setError(null);
      const data = await arenaService.getAllArenas();
      setArenas(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load arenas. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArenas();
  }, [fetchArenas]);

  // Search + filter logic
  useEffect(() => {
    let result = [...arenas];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q),
      );
    }

    if (activeFilter === 'Top Rated') {
      result = result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (activeFilter === 'Budget') {
      result = result.sort((a, b) => a.price - b.price);
    }

    setFiltered(result);
  }, [search, activeFilter, arenas]);

  const handleArenaPress = (arena: Arena) => {
    navigation.navigate('ArenaDetails', { arenaId: arena._id, arena });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArenas();
  };

  const renderHeader = () => (
    <View>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Find Your Game ⚡</Text>
          <Text style={styles.subtitle}>Book a futsal arena near you</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search arenas or locations..."
          placeholderTextColor="#666688"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === f && styles.chipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Label */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {activeFilter === 'All' ? 'All Arenas' : activeFilter}
        </Text>
        <Text style={styles.sectionCount}>{filtered.length} found</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Loading arenas...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchArenas}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ArenaCard arena={item} onPress={handleArenaPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyText}>No arenas found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00E5FF"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  listContent: {
    paddingBottom: 100,
  },

  // Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#9E9EB8',
    fontSize: 13,
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  notifIcon: {
    fontSize: 18,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    color: '#666688',
    fontSize: 14,
    paddingHorizontal: 4,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1C1C2E',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  chipActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  chipText: {
    color: '#9E9EB8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0D0D1A',
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Loading / Error
  loadingText: {
    color: '#9E9EB8',
    fontSize: 14,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 36,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#0D0D1A',
    fontWeight: '800',
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#9E9EB8',
    fontSize: 13,
  },
});

export default HomeScreen;