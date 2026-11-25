import type { WishTopic } from '../live/chatter';

export const GAME = {
  title: 'Kho Báu Container Mù',
  subtitle: 'Đấu Giá Cướp Rương · Zuong',
  defaultChannelName: 'kênh mình',

  mc: {
    mcOn: '1',
    mcVoice: 'Nam Minh',
    mcSpeed: '1.15',
    mcExpr: '0.95',
    musicVol: '0.45',
    sfxVol: '1',
    mcVol: '1',
    graphics: 'full',
  } as Record<string, string>,

  voices: ['Nam Minh', 'Hoài My'],

  wishPerUserMs: 10 * 60_000,
  wishGlobalMs: 30_000,
  wishReplies: {
    exam: [(name: string) => `Chúc ${name} thi đâu đậu đó, mở rương nào cũng trúng cực phẩm nha!`],
    health: [(name: string) => `Chúc ${name} và gia đình thật nhiều sức khỏe nha.`],
    love: [(name: string) => `Chúc ${name} sớm gặp được chân ái nha.`],
    family: [(name: string) => `Chúc gia đình ${name} lúc nào cũng sum vầy vui vẻ.`],
    work: [(name: string) => `Chúc ${name} công việc hanh thông, chốt đơn rầm rầm nha.`],
    wealth: [(name: string) => `Chúc ${name} buôn may bán đắt, tài lộc dồi dào, khui rương nổ hũ nha.`],
    peace: [(name: string) => `Chúc ${name} vạn sự bình an, gạt phăng dép tổ ong nha.`],
  } as Record<WishTopic, ((name: string) => string)[]>,
};
