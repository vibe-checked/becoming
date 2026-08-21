import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, Text, View } from 'react-native';

/**
 * The cold open. Eight rays bloom out of a single point of light, the core
 * flares, then the wordmark rises — the icon assembling itself rather than
 * being shown. Built from plain views only: no SVG, no Reanimated, nothing
 * that could drag a native rebuild in behind it.
 *
 * Tap anywhere to skip. Total run ~1.9s.
 */
const BG = '#0a0a12';
const CORE = '#E9D5FF';
const RAY = '#A855F7';
const DEEP = '#6D28D9';

export function Ignition({ onDone }: { onDone: () => void }) {
  const { width, height } = Dimensions.get('window');
  const S = Math.min(width * 0.62, 250);

  const bloom = useRef(new Animated.Value(0)).current;   // rays out
  const flare = useRef(new Animated.Value(0)).current;   // core brightness
  const spin = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [gone, setGone] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(fade, { toValue: 0, duration: 340, easing: Easing.in(Easing.quad), useNativeDriver: true })
      .start(() => { setGone(true); onDone(); });
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(flare, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(bloom, { toValue: 1, duration: 780, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(word, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(430),
    ]).start(finish);
  }, []);

  if (gone) return null;

  const RAYS = 8;

  return (
    <Animated.View pointerEvents="box-none" style={{
      position: 'absolute', left: 0, top: 0, width, height, backgroundColor: BG,
      alignItems: 'center', justifyContent: 'center', opacity: fade, zIndex: 9999,
    }}>
      <Pressable style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} onPress={finish} />

      <Animated.View style={{
        width: S, height: S, alignItems: 'center', justifyContent: 'center',
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['-22deg', '0deg'] }) }],
      }}>
        {/* outer halo */}
        <Animated.View style={{
          position: 'absolute', width: S * 0.92, height: S * 0.92, borderRadius: S,
          backgroundColor: DEEP,
          opacity: bloom.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
          transform: [{ scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
        }} />

        {/* the rays */}
        {Array.from({ length: RAYS }, (_, i) => {
          const long = i % 2 === 0;
          const len = S * (long ? 0.46 : 0.30);
          const stagger = i / (RAYS * 2.4);
          const grow = bloom.interpolate({
            inputRange: [stagger, Math.min(1, stagger + 0.55)],
            outputRange: [0, 1], extrapolate: 'clamp',
          });
          return (
            <Animated.View key={i} style={{
              position: 'absolute', width: S, height: S, alignItems: 'center',
              transform: [{ rotate: `${(360 / RAYS) * i}deg` }],
            }}>
              <Animated.View style={{
                width: long ? 4 : 2.5, height: len, borderRadius: 3,
                backgroundColor: long ? RAY : CORE,
                opacity: grow.interpolate({ inputRange: [0, 1], outputRange: [0, long ? 0.95 : 0.6] }),
                transform: [
                  { translateY: grow.interpolate({ inputRange: [0, 1], outputRange: [len / 2, 0] }) },
                  { scaleY: grow },
                ],
              }} />
            </Animated.View>
          );
        })}

        {/* the core */}
        <Animated.View style={{
          width: S * 0.15, height: S * 0.15, borderRadius: S,
          backgroundColor: CORE,
          opacity: flare,
          transform: [{ scale: flare.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.2, 1.25, 1] }) }],
        }} />
      </Animated.View>

      <Animated.View style={{
        alignItems: 'center', marginTop: 26, opacity: word,
        transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}>
        <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: 7, color: '#F5F3FF' }}>BECOMING</Text>
        <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2.6, color: '#8B7BA8', marginTop: 8 }}>
          SEE IT, THEN BE IT
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
