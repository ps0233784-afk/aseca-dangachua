export const organization = {
  shortName: 'ASECA Dangachua',
  name: 'BRANCH ASECA DANGACHUA',
  fullName: 'Adivasi Socio-Educational & Cultural Association, Odisha',
  olChikiName: 'ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ',
  tagline: 'Education • Culture • Community',
  registration: 'Regd. No. 77/26 of 2026',
  address: 'At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist.-Kendujhar, PIN-758078, Odisha',
  email: 'info@branchasecadangachua.org',
  phone: '+91 94300 00001',
};

export type PublicSchool = {
  id: string;
  code: string;
  name: string;
  ol_chiki_name?: string;
  village: string;
  po: string;
  ps?: string;
  district: string;
  pin: string;
  state: string;
  principal: string;
  established_year: number;
  type: string;
  medium: string;
  student_count?: number;
  teacher_count?: number;
  smc_count?: number;
};

export const fallbackSchools: PublicSchool[] = [
  {
    id: 'hans-hansli',
    code: 'HH-OIA-026',
    name: 'HANS HANSLI OL-ITUN ASHRA',
    village: 'Dangachua',
    po: 'Bidyadharpur',
    ps: 'Soso',
    district: 'Kendujhar',
    pin: '758078',
    state: 'Odisha',
    principal: 'Bhagaban Murmu',
    established_year: 1998,
    type: 'Ol-Itun Ashra',
    medium: 'Santali',
    student_count: 8,
    teacher_count: 4,
    smc_count: 11,
  },
  {
    id: 'sida-kanhu',
    code: 'SK-OIA-027',
    name: 'SIDA KANHU OL-ITUN ASHRA',
    village: 'Haradabadi',
    po: 'Hadagarh',
    ps: 'Soso',
    district: 'Kendujhar',
    pin: '758023',
    state: 'Odisha',
    principal: 'Dukhabandhu Murmu',
    established_year: 2003,
    type: 'Ol-Itun Ashra',
    medium: 'Santali',
    student_count: 7,
    teacher_count: 1,
    smc_count: 11,
  },
  {
    id: 'marang-buru',
    code: 'MB-OIA-028',
    name: 'MARANG BURU OL-ITUN ASHRA',
    village: 'Binapatia',
    po: 'Bidyadharpur',
    ps: 'Soso',
    district: 'Kendujhar',
    pin: '758078',
    state: 'Odisha',
    principal: 'Kisun Majhi',
    established_year: 2010,
    type: 'Ol-Itun Ashra',
    medium: 'Santali',
    student_count: 8,
    teacher_count: 1,
    smc_count: 11,
  },
];

export const committee = [
  { name: 'Kisun Majhi', role: 'Chairman', initials: 'KM' },
  { name: 'Surendra Murmu', role: 'Secretary', initials: 'SM' },
  { name: 'Surendra Majhi', role: 'Treasurer', initials: 'SM' },
  { name: 'Bhagaban Murmu', role: 'Headmaster', initials: 'BM' },
  { name: 'Shyamsundar Majhi', role: 'Assistant Teacher', initials: 'SM' },
  { name: 'Ramdulari Murmu', role: 'Lady Teacher', initials: 'RM' },
  { name: 'Bhagaban Murmu', role: 'Executive Member', initials: 'BM' },
  { name: 'Khelaram Murmu', role: 'Executive Member', initials: 'KM' },
  { name: 'Ranku Beshra', role: 'Executive Member', initials: 'RB' },
  { name: 'Balaram Marandi', role: 'Executive Member', initials: 'BM' },
  { name: 'Sanjay Murmu', role: 'Executive Member', initials: 'SM' },
];

export const milestones = [
  { year: '1964', text: 'ASECA Odisha registered with a mission to advance Adivasi education and culture.' },
  { year: '1998', text: 'Hans Hansli Ol-Itun Ashra opened its doors in Dangachua.' },
  { year: '2003', text: 'The school network expanded to Haradabadi with Sida Kanhu Ol-Itun Ashra.' },
  { year: '2010', text: 'Marang Buru Ol-Itun Ashra joined the community learning network.' },
  { year: '2026', text: 'The Dangachua branch began its connected digital learning and administration journey.' },
];
