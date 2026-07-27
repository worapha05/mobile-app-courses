# Beginner Playground

แอป Expo ที่ผูกตัวอย่างระดับ **Beginner** ไว้รันได้ทันที

## รัน

```bash
cd 01-beginner/playground
npm install # ครั้งแรกเท่านั้น
npm start   # หรือ npx expo start
```

จากนั้น:

- สแกน QR ด้วย **Expo Go** บนมือถือ หรือ
- กด `a` (Android emulator) / `i` (iOS simulator)

## มีอะไรบ้าง

เมนูในแอปเปิดได้:

| รายการ             | ที่มา                                  |
| ------------------ | -------------------------------------- |
| Bridge vs JSI      | `../examples/01-architecture-concepts` |
| Core Components    | `../examples/02-core-components`       |
| Flexbox & Platform | `../examples/03-layouts-styling`       |
| FlatList patterns  | `../examples/04-flatlist-patterns`     |
| Lab — BrewBoard    | `../lab/solution`                      |

โค้ดอยู่ที่ `src/beginner/` (คัดลอกมาจากหลักสูตร เพื่อให้ Metro bundle ได้โดยไม่ต้องตั้ง watchFolders)

## หมายเหตุ

- ตัวอย่างที่ดึงรูปจาก Unsplash ต้องมีเน็ต
- Intermediate / Expert ยังไม่ได้ผูกใน playground นี้ — ทำตาม README ใน `../02-intermediate/` และ `../03-expert/`
