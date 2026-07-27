import { useCallback, useEffect, useState } from 'react';
import { getCameraPermissionsAsync, requestCameraPermissionsAsync } from 'expo-camera';

export function useCameraPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const refresh = useCallback(async () => {
    const res = await getCameraPermissionsAsync();
    setGranted(res.granted);
    setCanAskAgain(res.canAskAgain);
  }, []);

  const request = useCallback(async () => {
    const res = await requestCameraPermissionsAsync();
    setGranted(res.granted);
    setCanAskAgain(res.canAskAgain);
    return res.granted;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { granted, canAskAgain, request, refresh };
}
