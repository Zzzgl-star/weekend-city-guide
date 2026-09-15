import type { Checkin, Guide, Team } from '../types'

// 首次打开时注入的演示数据，让页面不空白（之后完全由本地操作产生）
const now = Date.now()
const h = 3600 * 1000

export const SEED_TEAMS: Team[] = [
  {
    id: 't01', activityId: 'a05', meetSlot: 'sat_am', meetPoint: '翠湖公园南门牌坊下',
    note: '周六上午逛市集+喂海鸥，中午可以拼饭！', maxMembers: 6,
    creator: '阿柚', members: ['阿柚', '小林', 'Kayla'], contact: 'wx: youyou_kmg',
    createdAt: now - 26 * h,
  },
  {
    id: 't02', activityId: 'a12', meetSlot: 'sun_pm', meetPoint: '公交 84 路岗头山站',
    note: '看日落局！必备头灯，下山一起吃烧烤。', maxMembers: 6,
    creator: '大鹏', members: ['大鹏', '周周', '小夏', 'MC'], contact: 'wx: dapeng_km',
    createdAt: now - 12 * h,
  },
  {
    id: 't03', activityId: 'a08', meetSlot: 'sat_eve', meetPoint: '南亚风情第壹城 MAO 门口',
    note: '摇滚夜，拼蹦迪搭子，散场吃宵夜。', maxMembers: 4,
    creator: 'Luna', members: ['Luna', '阿杰'], contact: 'wx: luna_rock88',
    createdAt: now - 5 * h,
  },
]

export const SEED_CHECKINS: Checkin[] = [
  {
    id: 'c01', activityId: 'a13', rating: 5,
    note: '红嘴鸥比想象的多！骑车绕了大坝两圈，被海鸥包围了，出片率 100%。',
    author: '阿柚', createdAt: now - 30 * h,
  },
  {
    id: 'c02', activityId: 'a01', rating: 4,
    note: '牛虎铜案太震撼了，免费讲解员讲得很细，两小时不够逛。',
    author: '小林', createdAt: now - 50 * h,
  },
  {
    id: 'c03', activityId: 'a14', rating: 5,
    note: '路人局组到了 12 人狼人杀，主持人超专业，雨天周末的快乐就是它了。',
    author: '大鹏', createdAt: now - 75 * h,
  },
]

export const SEED_GUIDES: Guide[] = [
  {
    id: 'g01', title: '昆明雨天周末完美动线：展览 + 咖啡 + 桌游',
    content:
      '周六下雨别慌，这条纯室内动线亲测不踩雷：\n\n1. 上午去云南省博看青铜展（免费，记得带身份证），星耀路地铁站出来就到；\n2. 中午地铁到文化巷，在文林街吃一碗小锅米线；\n3. 下午上山喝茶的手冲工作坊（68 元），三个产区豆子对比着喝；\n4. 晚上直接留在文化巷桌游星球打狼人杀（40 元），楼下就是地铁站。\n\n全程室内，人均预算 120 以内，两个人也合适，人多更好玩。',
    tags: ['雨天方案', '室内', '人均120'],
    activityId: 'a01', author: '小林', likes: 23, likedByMe: false, createdAt: now - 40 * h,
  },
  {
    id: 'g02', title: '人均 60 玩一天！翠湖-讲武堂-南强街一日线',
    content:
      '预算有限也能玩得很好：\n\n上午翠湖市集 + 讲武堂（全程免费），黄墙拍照超出片；\n中午翠湖周边吃豆花米线（15 元）；\n下午沿青年路散步或去云南美术馆（免费）；\n傍晚南强街夜市，50 块吃到撑。\n\n总花费约 65 元，适合第一次来昆明玩的朋友，走完这条线你就懂昆明了。',
    tags: ['穷游', '经典线路', '人均65'],
    activityId: 'a05', author: '周周', likes: 41, likedByMe: false, createdAt: now - 90 * h,
  },
]
