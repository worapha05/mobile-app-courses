import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

/**
 * แสดงการจัด layout แบบ mobile-first:
 * - column เป็นค่าเริ่มต้น
 * - แถวสถิติใช้ row + flex
 * - badge มุมการ์ดใช้ absolute
 * - เงาแยก iOS (shadow*) / Android (elevation)
 */
export function LayoutsStylingScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.heading}>Flexbox Lab</Text>
        <Text style={styles.hint}>
          ความกว้างจอ {Math.round(width)}px · layout {isCompact ? 'compact' : 'comfortable'}
        </Text>

        <View style={[styles.heroCard, platformShadow]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
          <Text style={styles.heroTitle}>ออเดอร์วันนี้</Text>
          <Text style={styles.heroBody}>จัดแถวด้วย flexDirection: row</Text>

          <View style={[styles.statsRow, isCompact && styles.statsStack]}>
            <Stat label="คิว" value="12" />
            <Stat label="เสร็จ" value="48" />
            <Stat label="ยกเลิก" value="2" />
          </View>
        </View>

        <View style={styles.split}>
          <View style={[styles.panel, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.panelTitle}>flex: 1</Text>
            <Text style={styles.panelBody}>กินพื้นที่เท่า ๆ กัน</Text>
          </View>
          <View style={[styles.panel, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.panelTitle}>flex: 1</Text>
            <Text style={styles.panelBody}>แม้ข้อความยาวต่างกัน</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** แยก shadow ตามแพลตฟอร์ม — อย่าคาดหวังว่า elevation จะเหมือน shadow* */
const platformShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 5 },
    default: {},
  }) ?? {};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  page: { flex: 1, padding: 20, gap: 16 },
  heading: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  hint: { color: '#64748b', marginBottom: 4 },
  heroCard: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  heroBody: { color: '#6b7280' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statsStack: { flexDirection: 'column' },
  stat: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statLabel: { color: '#64748b', marginTop: 2 },
  split: { flexDirection: 'row', gap: 12 },
  panel: { flex: 1, borderRadius: 16, padding: 16, minHeight: 110 },
  panelTitle: { fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  panelBody: { color: '#475569', lineHeight: 20 },
});
