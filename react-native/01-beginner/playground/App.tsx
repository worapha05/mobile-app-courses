import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ArchitectureConceptsScreen } from './src/beginner/architecture/ArchitectureConceptsScreen';
import { BrewBoardScreen } from './src/beginner/brewboard/screens/BrewBoardScreen';
import { CoreComponentsScreen } from './src/beginner/core/CoreComponentsScreen';
import { FlatListPatternsScreen } from './src/beginner/flatlist/FlatListPatternsScreen';
import { LayoutsStylingScreen } from './src/beginner/layouts/LayoutsStylingScreen';

type DemoId = 'menu' | 'architecture' | 'core' | 'layouts' | 'flatlist' | 'brewboard';

const DEMOS: { id: Exclude<DemoId, 'menu'>; title: string; blurb: string }[] = [
  {
    id: 'architecture',
    title: '01 — Bridge vs JSI',
    blurb: 'จำลองต้นทุนข้ามขอบ JS ↔ Native',
  },
  {
    id: 'core',
    title: '02 — Core Components',
    blurb: 'View / Text / Image / ScrollView',
  },
  {
    id: 'layouts',
    title: '03 — Flexbox & Platform styles',
    blurb: 'Layout มือถือ + absolute badge',
  },
  {
    id: 'flatlist',
    title: '04 — FlatList patterns',
    blurb: 'Virtualized list + pull-to-refresh',
  },
  {
    id: 'brewboard',
    title: 'Lab — BrewBoard',
    blurb: 'เฉลย lab เมนูร้านกาแฟ + cache',
  },
];

export default function App() {
  const [demo, setDemo] = useState<DemoId>('menu');

  if (demo !== 'menu') {
    return (
      <View style={styles.flex}>
        <SafeAreaView style={styles.backBar}>
          <Pressable onPress={() => setDemo('menu')} hitSlop={12}>
            <Text style={styles.backText}>← เมนู Beginner</Text>
          </Pressable>
        </SafeAreaView>
        <View style={styles.flex}>
          {demo === 'architecture' ? <ArchitectureConceptsScreen /> : null}
          {demo === 'core' ? <CoreComponentsScreen /> : null}
          {demo === 'layouts' ? <LayoutsStylingScreen /> : null}
          {demo === 'flatlist' ? <FlatListPatternsScreen /> : null}
          {demo === 'brewboard' ? <BrewBoardScreen /> : null}
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.menu}>
        <Text style={styles.brand}>RN Bootcamp</Text>
        <Text style={styles.heading}>Beginner Playground</Text>
        <Text style={styles.lead}>
          เลือกตัวอย่างด้านล่างเพื่อรันบน Expo Go / Simulator — โค้ดมาจาก 01-beginner/examples และ
          lab/solution
        </Text>

        {DEMOS.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => setDemo(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBlurb}>{item.blurb}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  menu: { padding: 20, gap: 12, paddingBottom: 40 },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  lead: { color: '#64748b', lineHeight: 22, marginBottom: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cardBlurb: { marginTop: 4, color: '#64748b' },
  backBar: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: { color: '#e2e8f0', fontWeight: '700', fontSize: 15 },
});
