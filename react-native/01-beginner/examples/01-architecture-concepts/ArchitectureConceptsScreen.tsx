import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type ArchMode = 'bridge' | 'jsi';

/**
 * หน้าจอสอนแนวคิด — ไม่ได้เรียก native module จริง
 * แต่จำลอง “ต้นทุน” ของการส่งข้อความข้ามขอบ JS ↔ Native
 */
export function ArchitectureConceptsScreen() {
  const [mode, setMode] = useState<ArchMode>('bridge');
  const [payloadKb, setPayloadKb] = useState(64);
  const [callsPerSecond, setCallsPerSecond] = useState(30);

  const estimate = useMemo(() => {
    // ตัวเลขสมมติเพื่อสอนแนวคิด ไม่ใช่ benchmark จริง
    const serializeCost = mode === 'bridge' ? payloadKb * 0.02 : payloadKb * 0.004;
    const queueCost = mode === 'bridge' ? callsPerSecond * 0.15 : callsPerSecond * 0.02;
    const total = serializeCost + queueCost;
    return {
      serializeCost,
      queueCost,
      total,
      verdict:
        total > 8
          ? 'เสี่ยงจังหวะ UI — ลดความถี่หรือลดขนาด payload / ใช้ JSI-friendly API'
          : 'ภาระสื่อสารอยู่ในเกณฑ์ที่ยอมรับได้สำหรับเดโมนี้',
    };
  }, [mode, payloadKb, callsPerSecond]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bridge vs JSI</Text>
        <Text style={styles.lead}>
          Bridge ส่งข้อความแบบ serialize (มักเป็น JSON) ผ่านคิวอะซิงโครนัส JSI ให้ JS คุยกับ
          HostObject ฝั่ง native ได้ตรงกว่า ลดต้นทุน copy
        </Text>

        <View style={styles.row}>
          <ModeChip
            label="Legacy Bridge"
            active={mode === 'bridge'}
            onPress={() => setMode('bridge')}
          />
          <ModeChip label="JSI / New Arch" active={mode === 'jsi'} onPress={() => setMode('jsi')} />
        </View>

        <Card title="จำลองภาระข้ามขอบ">
          <Stepper
            label={`Payload ≈ ${payloadKb} KB`}
            onMinus={() => setPayloadKb((v) => Math.max(4, v - 16))}
            onPlus={() => setPayloadKb((v) => Math.min(512, v + 16))}
          />
          <Stepper
            label={`เรียก ≈ ${callsPerSecond} ครั้ง/วินาที`}
            onMinus={() => setCallsPerSecond((v) => Math.max(1, v - 5))}
            onPlus={() => setCallsPerSecond((v) => Math.min(120, v + 5))}
          />
          <Text style={styles.mono}>
            serialize≈{estimate.serializeCost.toFixed(2)} · queue≈
            {estimate.queueCost.toFixed(2)} · total≈{estimate.total.toFixed(2)}
          </Text>
          <Text style={styles.verdict}>{estimate.verdict}</Text>
        </Card>

        <Card title="Checklist New Architecture">
          <Bullet>เปิด newArchEnabled ใน app config</Bullet>
          <Bullet>ใช้ Hermes เป็น JS engine</Bullet>
          <Bullet>ตรวจว่า native modules ที่ใช้รองรับ TurboModules / Fabric</Bullet>
          <Bullet>วัด cold start และ scroll FPS บนเครื่องจริงหลังเปิด</Bullet>
        </Card>

        <Card title="กฎจำง่าย">
          <Bullet>อย่าส่ง base64 รูปขนาดใหญ่ผ่าน Bridge ทุกเฟรม</Bullet>
          <Bullet>งานเลื่อน list / gesture ให้อยู่ฝั่ง native หรือ JSI library</Bullet>
          <Bullet>Business logic หนัก ๆ พิจารณา move ออกจาก JS thread</Bullet>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      role="button"
      aria-selected={active}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Stepper({
  label,
  onMinus,
  onPlus,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.body}>{label}</Text>
      <View style={styles.row}>
        <Pressable onPress={onMinus} style={styles.stepBtn}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Pressable onPress={onPlus} style={styles.stepBtn}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return <Text style={styles.bullet}>• {children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 20, gap: 16 },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '700' },
  lead: { color: '#94a3b8', fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
  },
  chipActive: { backgroundColor: '#38bdf8' },
  chipText: { color: '#cbd5e1', fontWeight: '600' },
  chipTextActive: { color: '#0f172a' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: { color: '#e2e8f0', fontSize: 17, fontWeight: '700' },
  body: { color: '#cbd5e1', fontSize: 15 },
  mono: { color: '#7dd3fc', fontFamily: 'monospace', fontSize: 13 },
  verdict: { color: '#fbbf24', fontSize: 14, lineHeight: 20 },
  bullet: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
  stepper: { gap: 8 },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
});
