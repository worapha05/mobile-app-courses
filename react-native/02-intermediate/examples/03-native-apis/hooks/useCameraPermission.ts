import { useCallback, useEffect, useState } from 'react';
import { getCameraPermissionsAsync, requestCameraPermissionsAsync } from 'expo-camera';

import { mapBooleanPermission, type PermissionStatus } from '../lib/permissionTypes';

/**
 * ใช้ named exports ของ expo-camera (SDK 51+)
 * ไม่พึ่ง class Camera แบบ legacy ที่ถูกถอดออกแล้ว
 */
export function useCameraPermission() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const refresh = useCallback(async () => {
    const current = await getCameraPermissionsAsync();
    setStatus(mapBooleanPermission(current.granted, current.canAskAgain));
  }, []);

  const request = useCallback(async () => {
    const result = await requestCameraPermissionsAsync();
    const next = mapBooleanPermission(result.granted, result.canAskAgain);
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, request, refresh };
}
