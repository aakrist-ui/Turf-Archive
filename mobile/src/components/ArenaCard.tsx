import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface Arena {
  _id: string;
  name: string;
  location: string;
  price: number;
  images: string[];
  rating?: number;
}

interface ArenaCardProps {
  arena: Arena;
  onPress: (arena: Arena) => void;
}

const ArenaCard: React.FC<ArenaCardProps> = ({ arena, onPress }) => {
  const imageUri =
    arena.images && arena.images.length > 0
      ? { uri: arena.images[0] }
      : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(arena)}
      activeOpacity={0.85}
    >
      {/* Arena Image */}
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={imageUri} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏟️</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>Rs {arena.price}/hr</Text>
        </View>
      </View>

      {/* Arena Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.arenaName} numberOfLines={1}>
          {arena.name}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {arena.location}
          </Text>
        </View>

        <View style={styles.footer}>
          {arena.rating !== undefined && (
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>{arena.rating.toFixed(1)}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.bookBtn} onPress={() => onPress(arena)}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C2E',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#0D0D1A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceText: {
    color: '#0D0D1A',
    fontWeight: '800',
    fontSize: 13,
  },
  infoContainer: {
    padding: 14,
  },
  arenaName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    color: '#9E9EB8',
    fontSize: 13,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 14,
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 14,
  },
  bookBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: {
    color: '#0D0D1A',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default ArenaCard;