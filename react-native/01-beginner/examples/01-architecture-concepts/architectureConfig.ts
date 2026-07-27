/**
 * สรุป config ที่เกี่ยวข้องกับสถาปัตยกรรม
 * นำไปวางใน app.json / app.config.ts ของ project Expo
 */
export const architectureConfigNotes = {
  expo: {
    name: 'ArchitectureDemo',
    slug: 'architecture-demo',
    newArchEnabled: true,
    jsEngine: 'hermes',
    ios: { jsEngine: 'hermes' },
    android: { jsEngine: 'hermes' },
  },
  reminders: [
    'newArchEnabled เปิด Fabric + TurboModules path',
    'Hermes ลด cold start ด้วย bytecode',
    'หลังเปลี่ยน native config ต้องสร้าง Dev Build ใหม่ (Expo Go อาจไม่สะท้อนทุกอย่าง)',
  ],
} as const;
