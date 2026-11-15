export interface CampusDetail {
  id: string;
  name: string;
  code: string;
  institutionName: string;
  location: string;
  district: string;
  state: string;
  address: string;
  pincode: string;
  contact: string;
  secondaryContact?: string;
  email: string;
  adminName: string;
  adminTitle: string;
  adminContact: string;
  adminImage?: string;
  founderName?: string;
  founderTitle?: string;
  founderPhoto?: string;
  studentCount: number;
  huffazCount?: string;
  graduatesCount?: string;
  postgraduatesCount?: string;
  established: string;
  image: string;
  galleryImages: string[];
  facilities: string[];
  tagline: string;
  overview: string;
  academicPrograms: string[];
  totalCollection?: string;
  isHeadquarters?: boolean;
}

export const registeredCampuses: CampusDetail[] = [
  {
    id: 'campus_kak',
    name: 'Dalailul Khairath Islamic Foundation Kakkidippuram Main Campus',
    code: 'KAK01',
    institutionName: 'Dalailul Khairath Islamic Foundation (Regd.)',
    location: 'Kakkidippuram, Malappuram',
    district: 'Malappuram',
    state: 'Kerala',
    address: 'Kakkidippuram, P.O. Alamkode, Malappuram Dt., Kerala 679585',
    pincode: '679585',
    contact: '+91 7034149149',
    secondaryContact: '+91 86063 51556',
    email: 'kakkidipuramdkif@gmail.com',
    adminName: "USTHAD ABDUL HAKEEM SA'ADI",
    adminTitle: "Campus Administrator (Fieldwork & Collection)",
    adminContact: '+91 7034149149',
    founderName: "USTHAD ABDUL SALAM SA'ADI KAKKIDIPPURAM",
    founderTitle: 'Founder & General Secretary, Dalailul Khairath Islamic Research Center',
    founderPhoto: '/assets/founder.jpg',
    studentCount: 100,
    huffazCount: '150+',
    graduatesCount: '200+',
    postgraduatesCount: '40+',
    established: '2008',
    image: '/assets/campus-main.jpg',
    galleryImages: [
      '/assets/authentic_student_4.jpg',
      '/assets/authentic_student_1.jpg',
      '/assets/authentic_student_2.jpg',
      '/assets/authentic_student_3.jpg',
    ],
    facilities: [
      'Dalailul Khairath Da‘wah College (AFF – Madheenathunnoor College of Islamic Science)',
      'Shaikhuna Kakkidippuram Muhammad Kutti Musliyar (Anakkara Usthad) Memorial Qur’an Study Center',
      'Marhoom K. P. Moitheen Musliyar Memorial Conference Hall',
      'Shaikh Abdurrahman Bin Bukhari Research Center',
      'Shadhuliyya Masjid & Madrasa, Naripparamba',
      'Relief Cell & Destitute Welfare Support',
      'Islamic Meditation Center',
      'Spiritual Majlis Gatherings',
      'Central Boarding & Catering Facility (100 Students & Staff Daily)',
    ],
    tagline: 'Crafting Futures, Creating Legacies',
    overview:
      'In the blessed land of Kakkidippuram, sanctified by the spiritual presence of Shaikhuna Kakkidippuram Abubakar Musliyar and Abdurrahman Kutti Musliyar, Dalailul Khairath Islamic Foundation was born with the blessings of great scholars. Established in 2008 and serving for over two decades, this esteemed institution currently nurtures nearly 100 residential scholars guided by both classical Islamic theology and contemporary academic science in a disciplined, value-based environment.',
    academicPrograms: [
      'Dalailul Khairath Da‘wah College (AFF – Madheenathunnoor College of Islamic Science)',
      'Tahfeezul Qur’an Intensive (30 Juz Full Memorization with Tajweed)',
      'Shaikh Abdurrahman Bin Bukhari Classical Theological Research',
      'Moral Tarbiyah, Spiritual Majlis & Social Relief Formation',
    ],
    totalCollection: '₹2,50,997',
    isHeadquarters: true,
  },
];

