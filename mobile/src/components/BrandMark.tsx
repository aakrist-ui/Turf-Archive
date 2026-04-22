import React from 'react';
import { StyleSheet, View } from 'react-native';

const BrandMark: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const shellSize = size;
  const fieldSize = Math.round(size * 0.76);
  const ballSize = Math.round(size * 0.34);
  const stripeHeight = Math.max(6, Math.round(size * 0.08));

  return (
    <View
      style={[
        styles.shell,
        {
          width: shellSize,
          height: shellSize,
          borderRadius: Math.round(size * 0.28),
        },
      ]}
    >
      <View
        style={[
          styles.field,
          {
            width: fieldSize,
            height: fieldSize,
            borderRadius: Math.round(size * 0.2),
          },
        ]}
      >
        <View style={[styles.stripe, { top: Math.round(size * 0.11), height: stripeHeight }]} />
        <View style={[styles.stripe, { top: Math.round(size * 0.25), height: stripeHeight }]} />
        <View style={[styles.stripe, { top: Math.round(size * 0.39), height: stripeHeight }]} />
        <View style={[styles.stripe, { top: Math.round(size * 0.53), height: stripeHeight }]} />

        <View
          style={[
            styles.centerCircle,
            {
              width: Math.round(size * 0.22),
              height: Math.round(size * 0.22),
              borderRadius: Math.round(size * 0.11),
              borderWidth: Math.max(2, Math.round(size * 0.025)),
            },
          ]}
        />

        <View
          style={[
            styles.penaltyBox,
            {
              width: Math.round(size * 0.18),
              height: Math.round(size * 0.3),
              top: Math.round(size * 0.23),
              left: 0,
              borderTopRightRadius: Math.round(size * 0.05),
              borderBottomRightRadius: Math.round(size * 0.05),
              borderWidth: Math.max(2, Math.round(size * 0.02)),
            },
          ]}
        />
        <View
          style={[
            styles.penaltyBox,
            {
              width: Math.round(size * 0.18),
              height: Math.round(size * 0.3),
              top: Math.round(size * 0.23),
              right: 0,
              borderTopLeftRadius: Math.round(size * 0.05),
              borderBottomLeftRadius: Math.round(size * 0.05),
              borderWidth: Math.max(2, Math.round(size * 0.02)),
            },
          ]}
        />

        <View
          style={[
            styles.ball,
            {
              width: ballSize,
              height: ballSize,
              borderRadius: Math.round(ballSize / 2),
              bottom: Math.round(size * 0.08),
              right: Math.round(size * 0.08),
              borderWidth: Math.max(2, Math.round(size * 0.02)),
            },
          ]}
        >
          <View
            style={[
              styles.ballCore,
              {
                width: Math.round(ballSize * 0.34),
                height: Math.round(ballSize * 0.34),
                borderRadius: Math.round(ballSize * 0.17),
              },
            ]}
          />
          <View style={[styles.ballPatch, { width: Math.round(ballSize * 0.18), height: Math.max(2, Math.round(ballSize * 0.05)), top: Math.round(ballSize * 0.18) }]} />
          <View style={[styles.ballPatch, { width: Math.round(ballSize * 0.18), height: Math.max(2, Math.round(ballSize * 0.05)), bottom: Math.round(ballSize * 0.18) }]} />
          <View style={[styles.ballPatchVertical, { height: Math.round(ballSize * 0.18), width: Math.max(2, Math.round(ballSize * 0.05)), left: Math.round(ballSize * 0.18) }]} />
          <View style={[styles.ballPatchVertical, { height: Math.round(ballSize * 0.18), width: Math.max(2, Math.round(ballSize * 0.05)), right: Math.round(ballSize * 0.18) }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#12212B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D3548',
  },
  field: {
    backgroundColor: '#1F7A43',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#2E9856',
  },
  centerCircle: {
    position: 'absolute',
    borderColor: '#EAF7EE',
  },
  penaltyBox: {
    position: 'absolute',
    borderColor: '#EAF7EE',
    backgroundColor: 'transparent',
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#FFF8EC',
    borderColor: '#12212B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballCore: {
    backgroundColor: '#12212B',
  },
  ballPatch: {
    position: 'absolute',
    backgroundColor: '#12212B',
    alignSelf: 'center',
    borderRadius: 999,
  },
  ballPatchVertical: {
    position: 'absolute',
    backgroundColor: '#12212B',
    alignSelf: 'center',
    borderRadius: 999,
  },
});

export default BrandMark;
