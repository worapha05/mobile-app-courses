import { CameraView } from 'expo-camera';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCameraPermission } from '../../hooks/useCameraPermission';

export default function ScanScreen() {
  const camera = useCameraPermission();

  if (camera.granted === null) {
    return (
      <View style={styles.center}>
        <Text>กำลังตรวจสิทธิ์กล้อง…</Text>
      </View>
    );
  }

  if (!camera.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>ต้องการกล้องเพื่อสแกนบาร์โค้ดสินค้า</Text>
        <Text style={styles.body}>
          เราจะเปิดกล้องเฉพาะตอนคุณอยู่ในแท็บนี้ และไม่บันทึกวิดีโอโดยไม่บอกกล่าว
        </Text>
        <Pressable style={styles.btn} onPress={() => void camera.request()}>
          <Text style={styles.btnText}>อนุญาตกล้อง</Text>
        </Pressable>
        {!camera.canAskAgain ? (
          <Pressable onPress={() => void Linking.openSettings()}>
            <Text style={styles.link}>เปิด Settings ของเครื่อง</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView style={styles.camera} facing="back" />
      <Text style={styles.hint}>จัดกรอบบาร์โค้ดให้อยู่ตรงกลาง (เดโมยังไม่ถอดรหัส)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  hint: { color: '#e2e8f0', textAlign: 'center', padding: 12 },
  center: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  body: { color: '#64748b', lineHeight: 22 },
  btn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
  link: { color: '#0369a1', fontWeight: '700', textAlign: 'center' },
});
