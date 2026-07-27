import * as Location from 'expo-location';
import { useState } from 'react';

export function usePinLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pin() {
    setLoading(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setError('ไม่ได้รับอนุญาตตำแหน่ง');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'อ่านพิกัดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return { coords, error, loading, pin };
}
