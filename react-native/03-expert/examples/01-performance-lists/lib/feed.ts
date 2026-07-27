export type FeedItem = {
  id: string;
  title: string;
  subtitle: string;
  unread: boolean;
};

/** สร้างข้อมูลจำลองจำนวนมากสำหรับทดสอบ scroll */
export function buildFeed(count = 5_000): FeedItem[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `item-${index + 1}`;
    return {
      id,
      title: `งานตรวจนับ #${index + 1}`,
      subtitle:
        index % 7 === 0
          ? 'โซนเย็น · เร่งด่วน'
          : `โซน ${((index % 12) + 1).toString().padStart(2, '0')}`,
      unread: index % 5 === 0,
    };
  });
}
