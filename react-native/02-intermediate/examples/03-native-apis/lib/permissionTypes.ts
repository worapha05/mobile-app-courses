export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export function mapBooleanPermission(
  granted: boolean | undefined,
  canAskAgain?: boolean,
): PermissionStatus {
  if (granted) return 'granted';
  if (canAskAgain === false) return 'denied';
  if (granted === false) return 'denied';
  return 'undetermined';
}
