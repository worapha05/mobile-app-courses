import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { mapBooleanPermission, type PermissionStatus } from '../lib/permissionTypes';

export type Coords = { lat: number; lng: number; accuracy: number | null };

export function useForegroundLocation() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAndRead = useCallback(async () => {
    setError(null);
    const perm = await Location.requestForegroundPermissionsAsync();
    const next = mapBooleanPermission(perm.granted, perm.canAskAgain);
    setStatus(next);
    if (next !== 'granted') {
      setError('ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง');
      return null;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    setCoords(value);
    return value;
  }, []);

  useEffect(() => {
    void (async () => {
      const current = await Location.getForegroundPermissionsAsync();
      setStatus(mapBooleanPermission(current.granted, current.canAskAgain));
    })();
  }, []);

  return { status, coords, error, requestAndRead };
}
