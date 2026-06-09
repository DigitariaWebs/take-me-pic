/**
 * Mock data used by every screen. Shaped so the data layer can be
 * swapped to Firestore / a real backend later by replacing the
 * exported helpers with a fetcher.
 */

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  age: number;
  city: string;
  languages: string[];
  avatar: string;
  cover?: string;
  bio: string;
  karma: number;
  rating: number;
  photosCount: number;
  memberSince: string;
  verified: boolean;
  followers?: number;
  following?: number;
  spots?: number;
};

export type Spot = {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  bestTime: string;
  hero: string;
  thumbs: string[];
  tips: { user: User; text: string; relative: string }[];
};

export type Post = {
  id: string;
  author: User;
  city: string;
  relative: string;
  image: string;
  caption: string;
  hearts: number;
  comments: { author: User; text: string; relative: string; hearts?: number }[];
  badge?: string;
};

export type Notification = {
  id: string;
  kind: 'karma' | 'request' | 'community' | 'badge' | 'spot';
  body: string;
  meta?: string;
  time: string;
  avatar?: string;
  emphasis?: 'gold' | 'red' | 'normal';
};

const pravatar = (n: number) => `https://i.pravatar.cc/300?img=${n}`;
const picsum = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const me: User = {
  id: 'me',
  firstName: 'Claire',
  lastName: 'Bernard',
  username: '@claire.bernard',
  age: 29,
  city: 'Paris',
  languages: ['🇫🇷', '🇬🇧', '🇪🇸'],
  avatar: pravatar(47),
  bio: 'photographe amateure,\nParis ↔ Lisbonne, fan\nde lumières du matin ☼',
  karma: 1088,
  rating: 4.9,
  photosCount: 87,
  memberSince: 'avril 2024',
  verified: true,
  followers: 412,
  following: 88,
  spots: 7,
};

export const leo: User = {
  id: 'leo',
  firstName: 'Léo',
  lastName: 'Margaux',
  username: '@leo.m',
  age: 28,
  city: 'Paris',
  languages: ['🇫🇷', '🇬🇧', '🇪🇸'],
  avatar: pravatar(12),
  bio: '« Photographe de rue depuis 10 ans. Toujours partant pour un beau cadre ! »',
  karma: 1240,
  rating: 4.9,
  photosCount: 142,
  memberSince: 'mai 2023',
  verified: true,
  followers: 980,
  following: 220,
  spots: 14,
};

export const ines: User = {
  id: 'ines',
  firstName: 'Inès',
  lastName: 'Rahmouni',
  username: '@ines.rahmouni',
  age: 31,
  city: 'Marrakech',
  languages: ['🇲🇦', '🇫🇷', '🇬🇧'],
  avatar: pravatar(22),
  cover: picsum('cover-ines'),
  bio: 'Photographe de voyage. Je collectionne les couchers de soleil ✿',
  karma: 3420,
  rating: 4.95,
  photosCount: 312,
  memberSince: 'janvier 2023',
  verified: true,
  followers: 2800,
  following: 312,
  spots: 24,
};

export const sami: User = {
  id: 'sami',
  firstName: 'Sami',
  lastName: 'Belkacem',
  username: '@sami_lens',
  age: 30,
  city: 'Lisbonne',
  languages: ['🇵🇹', '🇫🇷'],
  avatar: pravatar(33),
  bio: 'Lumière, rues, sourires.',
  karma: 2180,
  rating: 4.85,
  photosCount: 188,
  memberSince: 'juin 2024',
  verified: true,
};

export const marc: User = {
  id: 'marc',
  firstName: 'Marc',
  lastName: 'Olivier',
  username: '@marc.travels',
  age: 34,
  city: 'Lyon',
  languages: ['🇫🇷', '🇬🇧'],
  avatar: pravatar(51),
  bio: 'Voyageur du dimanche.',
  karma: 1890,
  rating: 4.7,
  photosCount: 96,
  memberSince: 'mars 2024',
  verified: true,
};

export const yasmine: User = {
  id: 'yasmine',
  firstName: 'Yasmine',
  lastName: 'Karam',
  username: '@yasmine.k',
  age: 27,
  city: 'Paris',
  languages: ['🇫🇷', '🇬🇧'],
  avatar: pravatar(44),
  bio: '',
  karma: 912,
  rating: 4.8,
  photosCount: 66,
  memberSince: 'septembre 2024',
  verified: true,
};

export const allUsers = [me, leo, ines, sami, marc, yasmine];

// A richer pool of nearby travellers so the map feels alive and the filters
// (distance / languages / verified / rating) actually have something to bite on.
const NB_FIRST = ['Camille', 'Hugo', 'Nora', 'Thomas', 'Léa', 'Karim', 'Julie', 'Pablo', 'Aya', 'Noah', 'Chloé', 'Youssef'];
const NB_LANGS: string[][] = [
  ['🇫🇷', '🇬🇧'],
  ['🇫🇷', '🇪🇸'],
  ['🇬🇧', '🇲🇦'],
  ['🇫🇷', '🇵🇹'],
  ['🇬🇧'],
  ['🇫🇷', '🇬🇧', '🇪🇸'],
  ['🇲🇦', '🇫🇷'],
  ['🇵🇹', '🇬🇧'],
];

const generatedNearby: User[] = NB_FIRST.map((fn, i) => ({
  id: `nb${i + 1}`,
  firstName: fn,
  lastName: String.fromCharCode(65 + (i * 5) % 26) + '.',
  username: `@${fn.toLowerCase().replace(/[^a-z]/g, '')}`,
  age: 23 + (i * 3) % 22,
  city: 'Paris',
  languages: NB_LANGS[i % NB_LANGS.length],
  avatar: `https://i.pravatar.cc/300?img=${((i * 7) % 69) + 1}`,
  bio: 'Voyageur·se, toujours partant·e pour un beau cadre.',
  karma: 120 + (i * 173) % 2600,
  rating: 4.2 + ((i * 3) % 8) / 10, // 4.2 … 4.9
  photosCount: 6 + (i * 13) % 170,
  memberSince: 'mai 2025',
  verified: i % 3 !== 0, // ~2/3 verified
  followers: (i * 41) % 1200,
  following: (i * 17) % 300,
  spots: (i * 2) % 18,
}));

export const nearby: User[] = [leo, sami, marc, yasmine, ...generatedNearby];

/** Resolve any user by id across the named cast + the generated nearby pool. */
export function findUser(id?: string): User {
  return [...allUsers, ...nearby, ...seekers.map((s) => s.user)].find((u) => u.id === id) ?? ines;
}

/** People who NEED a photo right now (the other side of the marketplace). */
export interface Seeker {
  user: User;
  note: string; // what kind of photo they're after (no emoji)
  people: number; // how many in the shot
}

const SEEKER_NOTES = [
  'cherche un portrait',
  'photo de couple',
  'photo de groupe',
  'un beau cliché solo',
  'devant la fontaine',
  'avec le monument derrière',
  'au coucher du soleil',
  'plan large please',
];

const SEEKER_FIRST = ['Emma', 'Lucas', 'Sofia', 'Adam', 'Lina', 'Mateo', 'Zoé', 'Rayan', 'Manon', 'Eli'];

export const seekers: Seeker[] = SEEKER_FIRST.map((fn, i) => ({
  user: {
    id: `sk${i + 1}`,
    firstName: fn,
    lastName: String.fromCharCode(65 + (i * 7) % 26) + '.',
    username: `@${fn.toLowerCase()}`,
    age: 21 + (i * 4) % 30,
    city: 'Paris',
    languages: [['🇫🇷', '🇬🇧'], ['🇪🇸', '🇬🇧'], ['🇮🇹'], ['🇫🇷'], ['🇩🇪', '🇬🇧']][i % 5],
    avatar: `https://i.pravatar.cc/300?img=${((i * 9) % 64) + 5}`,
    bio: 'En voyage, à la recherche du bon cliché.',
    karma: 60 + (i * 91) % 900,
    rating: 4.3 + ((i * 4) % 7) / 10,
    photosCount: (i * 5) % 40,
    memberSince: 'juin 2025',
    verified: i % 2 === 0,
  },
  note: SEEKER_NOTES[i % SEEKER_NOTES.length],
  people: 1 + (i % 4),
}));

// A full community feed — emoji-free copy (the iOS simulator can't render colour
// emoji), varied authors / cities / captions / comments.
const POST_AUTHORS: User[] = [ines, leo, sami, marc, yasmine, me, ...nearby.slice(4, 12)];
const POST_CITIES = ['Marrakech', 'Lisbonne', 'Paris', 'Barcelone', 'Rome', 'Tokyo', 'Porto', 'Séville', 'Istanbul', 'Amsterdam'];
const POST_CAPTIONS = [
  'Coucher de soleil magique sur la place. Le meilleur angle est sur la terrasse du café.',
  "L'heure dorée n'a jamais aussi bien porté son nom.",
  'Petit matin sur les toits, personne dehors, juste la lumière.',
  'Trouvé ce mur incroyable en me perdant dans les ruelles.',
  'Plan large avec la façade derrière, exactement comme on voulait.',
  "Merci à l'inconnu qui a pris cette photo — le souvenir parfait.",
  'La vieille ville au lever du jour, un vrai décor de carte postale.',
  'Pavés mouillés après la pluie : ma combinaison de lumière préférée.',
  'Vue imprenable depuis le pont, venez avant la foule.',
  'Un café, un carnet, et cette ruelle pour moi tout seul.',
  'La mer au bout de chaque rue, je ne m\'en lasse pas.',
  'Contre-jour assumé, le halo fait tout le travail.',
];
const POST_BADGES = ['★ SPOT', '★ COUP DE CŒUR', '★ LEVER', '★ COUCHER', undefined, undefined, '★ ARCHI', undefined];
const COMMENT_TEXTS = [
  'Magnifique ! Tu utilisais quel objectif ?',
  "J'y vais la semaine prochaine, merci pour le tip !",
  'Ajouté à mes spots.',
  'La lumière est folle.',
  'Quel cadrage parfait.',
  'Ça donne tellement envie de voyager.',
  'Tu étais là à quelle heure ?',
  'Superbe, bravo !',
];
const POST_RELATIVES = ['il y a 12 min', 'il y a 45 min', 'il y a 2 h', 'il y a 5 h', 'hier', 'il y a 2 j', 'il y a 3 j'];

export const posts: Post[] = Array.from({ length: 18 }, (_, i) => {
  const author = POST_AUTHORS[i % POST_AUTHORS.length];
  const nComments = (i * 3) % 5;
  const comments = Array.from({ length: nComments }, (_, c) => ({
    author: POST_AUTHORS[(i + c + 1) % POST_AUTHORS.length],
    text: COMMENT_TEXTS[(i + c) % COMMENT_TEXTS.length],
    relative: POST_RELATIVES[(i + c) % POST_RELATIVES.length],
    hearts: c % 2 === 0 ? (c * 2) % 7 : undefined,
  }));
  return {
    id: `p${i + 1}`,
    author,
    city: POST_CITIES[i % POST_CITIES.length],
    relative: POST_RELATIVES[i % POST_RELATIVES.length],
    image: picsum(`feed${i + 1}`),
    caption: POST_CAPTIONS[i % POST_CAPTIONS.length],
    hearts: 40 + ((i * 137) % 2400),
    badge: POST_BADGES[i % POST_BADGES.length],
    comments,
  };
});

export const getPost = (id: string): Post => posts.find((p) => p.id === id) ?? posts[0];

export const spots: Spot[] = [
  {
    id: 'pont-des-arts',
    name: 'Pont des Arts',
    city: 'Paris 1ᵉʳ',
    rating: 4.8,
    reviews: 312,
    bestTime: '🌇 MEILLEUR · 19H',
    hero: picsum('pontdesarts'),
    thumbs: [picsum('an1'), picsum('an2'), picsum('an3')],
    tips: [
      { user: ines, relative: 'il y a 3 j', text: '« Viens 20 min avant pour éviter la foule. Lumière dorée garantie ✿ »' },
      { user: sami, relative: 'il y a 1 sem', text: '« Évite les week-ends, trop de monde. Mardi matin parfait 🌞 »' },
    ],
  },
];

export const itinerarySteps = [
  { time: '8h', title: 'Miradouro do Monte', sub: '🌅 lever de soleil · 25 min', thumb: picsum('lis1'), kind: 'photo' as const, active: true },
  { time: '9h', title: 'Pastéis de Belém', sub: '☕ café + pastéis · 45 min', kind: 'coffee' as const },
  { time: '11h', title: 'Tour de Belém', sub: '📸 façade ouest · 11h pile', thumb: picsum('lis2'), kind: 'photo' as const },
  { time: '15h', title: 'Tram 28', sub: '1h30 · réservable', thumb: picsum('lis3'), kind: 'ticket' as const, price: '🎫 18€' },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    kind: 'karma',
    body: '**Léo M.** t’a noté ★★★★★ — **+15 karma**',
    time: 'il y a 12 min',
    avatar: pravatar(12),
    emphasis: 'gold',
  },
  {
    id: 'n2',
    kind: 'request',
    body: '**Yasmine** demande une photo à 120 m',
    meta: 'expire dans 4 min !',
    time: '',
    emphasis: 'red',
  },
  {
    id: 'n3',
    kind: 'community',
    body: '**Inès** a publié une photo à **Marrakech**',
    time: 'il y a 2 h',
    avatar: pravatar(22),
    emphasis: 'normal',
  },
  {
    id: 'n4',
    kind: 'badge',
    body: '🥇 Tu es dans le **top 3 % de Paris** cette semaine !',
    time: 'hier · 18h40',
    emphasis: 'gold',
  },
  {
    id: 'n5',
    kind: 'community',
    body: '**Marc** a commenté ton spot *Pont des Arts*',
    time: 'hier · 15h12',
    avatar: pravatar(51),
    emphasis: 'normal',
  },
  {
    id: 'n6',
    kind: 'spot',
    body: '3 nouveaux **spots photo** près de chez toi',
    time: 'hier · 9h00',
    emphasis: 'normal',
  },
];

export type ManualSecret = {
  color: 'gold' | 'blue' | 'green' | 'sunset';
  title: string;
  body: string;
  thumb: string;
  big?: boolean;
};

export const manualSecrets: ManualSecret[] = [
  { color: 'gold', title: 'La règle des tiers', body: 'Place le sujet sur une ligne de force, pas au centre.', thumb: picsum('g1a'), big: true },
  { color: 'blue', title: 'Lignes directrices', body: 'Routes, murs, horizon — laisse l’œil voyager.', thumb: picsum('g2') },
  { color: 'green', title: 'Espace négatif', body: 'Laisse respirer. Le vide raconte aussi.', thumb: picsum('g3') },
  { color: 'sunset', title: 'Heure dorée', body: '30 min après lever, avant coucher. Magie garantie ☼', thumb: picsum('g4') },
];

export const galleryPhotos = [
  { uri: picsum('p1'), favorite: true },
  { uri: picsum('p2') },
  { uri: picsum('p3') },
  { uri: picsum('p4') },
  { uri: picsum('p5') },
  { uri: picsum('p6') },
];

export const familyMembers = [
  { name: 'Claire', tag: '(toi)', avatar: pravatar(47), online: true, where: 'Belém · maintenant' },
  { name: 'Antoine', tag: 'mari', avatar: pravatar(8), where: 'avec toi' },
  { name: 'Léa', tag: '12 ans', age: 12, avatar: pravatar(64), where: 'à 220 m', safe: true },
  { name: 'Hugo', tag: '8 ans', age: 8, avatar: pravatar(65), where: 'à 220 m', safe: true },
];

export const leaderboard = [
  { rank: 4, user: leo, score: 1240 },
  { rank: 5, user: me, score: 1088, isMe: true },
  { rank: 6, user: yasmine, score: 912 },
  { rank: 7, user: { ...marc, firstName: 'Thomas', lastName: 'D.', avatar: pravatar(15) }, score: 844 },
];
