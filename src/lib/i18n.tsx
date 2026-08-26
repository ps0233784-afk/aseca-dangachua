import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'od' | 'hi' | 'sat' | 'olc';

type Dict = Record<string, string>;

// NOTE: Ol Chiki mode uses the same Santali strings (Roman script) and applies
// the Ol Chiki typeface to display; the architecture is ready for full Ol Chiki
// content to be supplied by administrators.
const dicts: Record<Lang, Dict> = {
  en: {},
  od: {},
  hi: {},
  sat: {},
  olc: {},
};

function define(lang: Lang, entries: Record<string, string>) {
  dicts[lang] = entries;
}

// ---------------- English ----------------
define('en', {
  nav_home: 'Home', nav_about: 'About', nav_managing: 'Managing Body', nav_schools: 'Our Schools',
  nav_academics: 'Academics', nav_culture: 'Santali Culture', nav_notices: 'Notices', nav_events: 'Events',
  nav_gallery: 'Gallery', nav_results: 'Results', nav_contact: 'Contact',
  login_student: 'Student/Parent Login', login_erp: 'ERP Login',
  hero_title: 'Empowering Education, Preserving Culture, Building the Future',
  hero_sub: 'BRANCH ASECA DANGACHUA connects education, Santali heritage and community development through a modern network of schools.',
  hero_explore: 'Explore Our Schools', hero_result: 'Check Result',
  badge_line: 'Education • Culture • Community',
  stat_schools: 'Schools', stat_students: 'Students', stat_teachers: 'Teachers', stat_community: 'Growing Community',
  about_title: 'Education Rooted in Culture',
  about_quality: 'Quality Education', about_heritage: 'Cultural Heritage', about_community: 'Community Development',
  managing_title: 'Managing Body', managing_viewall: 'View All 11 Members',
  schools_title: 'Our Schools', schools_search: 'Search schools by name, village or block…', schools_view: 'View School',
  culture_title: 'Santali Culture & Education',
  stats_title: 'Our Growing Impact', stats_years: 'Years of Service', stats_staff: 'Staff',
  notices_title: 'Notices & Events', notices_view: 'View', events_upcoming: 'Upcoming Events',
  achievements_title: 'Achievements',
  gallery_title: 'Gallery',
  results_title: 'Check Your Result', results_placeholder: 'Enter Roll Number / Student ID / Admission Number',
  results_search: 'Search Result',
  cta_title: 'Together We Educate. Together We Preserve. Together We Grow.',
  cta_explore: 'Explore Schools', cta_contact: 'Contact Us',
  footer_about: 'Organization', footer_quick: 'Quick Links', footer_schools: 'Our Schools',
  footer_services: 'Student Services', footer_contact: 'Contact', footer_privacy: 'Privacy Policy', footer_terms: 'Terms',
  lang_en: 'English', lang_od: 'Odia', lang_hi: 'Hindi', lang_sat: 'Santali', lang_olc: 'Ol Chiki',
  // ERP common
  dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers & Staff', academics: 'Academics',
  attendance: 'Attendance', exams: 'Exams & Results', report_cards: 'Report Cards', timetable: 'Timetable',
  fees: 'Fees', hostel: 'Hostel', library: 'Library', notices: 'Notices', events: 'Events',
  gallery_admin: 'Gallery', documents: 'Documents', certificates: 'Certificates', id_cards: 'ID Cards',
  reports: 'Reports', users: 'Users', roles: 'Roles & Permissions', settings: 'Settings', audit: 'Audit Logs',
  search_placeholder: 'Search students, teachers, schools, notices…',
  add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', search: 'Search',
  actions: 'Actions', status: 'Status', name: 'Name', loading: 'Loading…', no_data: 'No data found',
  confirm_delete: 'Are you sure you want to delete this?', yes: 'Yes', no: 'No',
});

// ---------------- Odia ----------------
define('od', {
  nav_home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା', nav_about: 'ଆମ ବିଷୟରେ', nav_managing: 'ପରିଚାଳନା ମଣ୍ଡଳୀ', nav_schools: 'ଆମର ବିଦ୍ୟାଳୟ',
  nav_academics: 'ଶିକ୍ଷା', nav_culture: 'ସାନ୍ତାଳି ସଂସ୍କୃତି', nav_notices: 'ବିଜ୍ଞପ୍ତି', nav_events: 'କାର୍ଯ୍ୟକ୍ରମ',
  nav_gallery: 'ଗ୍ୟାଲେରୀ', nav_results: 'ଫଳାଫଳ', nav_contact: 'ଯୋଗାଯୋଗ',
  login_student: 'ଛାତ୍ର/ଅଭିଭାବକ ଲଗଇନ୍', login_erp: 'ERP ଲଗଇନ୍',
  hero_title: 'ଶିକ୍ଷାକୁ ସଶକ୍ତ କରିବା, ସଂସ୍କୃତିକୁ ସଂରକ୍ଷିତ ରଖିବା, ଭବିଷ୍ୟତ ଗଠନ କରିବା',
  hero_sub: 'BRANCH ASECA DANGACHUA ଏକ ଆଧୁନିକ ବିଦ୍ୟାଳୟ ସମୂହ ମାଧ୍ୟମରେ ଶିକ୍ଷା, ସାନ୍ତାଳି ଐତିହ୍ୟ ଏବଂ ସମ୍ପ୍ରଦାୟ ବିକାଶକୁ ସଂଯୋଗ କରେ।',
  hero_explore: 'ଆମର ବିଦ୍ୟାଳୟ ଦେଖନ୍ତୁ', hero_result: 'ଫଳାଫଳ ଦେଖନ୍ତୁ',
  badge_line: 'ଶିକ୍ଷା • ସଂସ୍କୃତି • ସମ୍ପ୍ରଦାୟ',
  stat_schools: 'ବିଦ୍ୟାଳୟ', stat_students: 'ଛାତ୍ରଛାତ୍ରୀ', stat_teachers: 'ଶିକ୍ଷକ', stat_community: 'ବର୍ଦ୍ଧିତ ସମ୍ପ୍ରଦାୟ',
  about_title: 'ସଂସ୍କୃତିରେ ମୂଳିତ ଶିକ୍ଷା',
  about_quality: 'ଉତ୍କୃଷ୍ଟ ଶିକ୍ଷା', about_heritage: 'ସାଂସ୍କୃତିକ ଐତିହ୍ୟ', about_community: 'ସମ୍ପ୍ରଦାୟ ବିକାଶ',
  managing_title: 'ପରିଚାଳନା ମଣ୍ଡଳୀ', managing_viewall: 'ସମସ୍ତ ୧୧ ସଦସ୍ୟ ଦେଖନ୍ତୁ',
  schools_title: 'ଆମର ବିଦ୍ୟାଳୟ', schools_search: 'ନାମ, ଗ୍ରାମ ବା ବ୍ଲକ ଦ୍ୱାରା ବିଦ୍ୟାଳୟ ଖୋଜନ୍ତୁ…', schools_view: 'ବିଦ୍ୟାଳୟ ଦେଖନ୍ତୁ',
  culture_title: 'ସାନ୍ତାଳି ସଂସ୍କୃତି ଓ ଶିକ୍ଷା',
  stats_title: 'ଆମର ବର୍ଦ୍ଧିତ ପ୍ରଭାବ', stats_years: 'ସେବା ବର୍ଷ', stats_staff: 'କର୍ମଚାରୀ',
  notices_title: 'ବିଜ୍ଞପ୍ତି ଓ କାର୍ଯ୍ୟକ୍ରମ', notices_view: 'ଦେଖନ୍ତୁ', events_upcoming: 'ଆଗାମୀ କାର୍ଯ୍ୟକ୍ରମ',
  achievements_title: 'ସଫଳତା',
  gallery_title: 'ଗ୍ୟାଲେରୀ',
  results_title: 'ଆପଣଙ୍କ ଫଳାଫଳ ଦେଖନ୍ତୁ', results_placeholder: 'ରୋଲ ନମ୍ବର / ଛାତ୍ର ID / ପ୍ରବେଶ ନମ୍ବର ଲେଖନ୍ତୁ',
  results_search: 'ଫଳାଫଳ ଖୋଜନ୍ତୁ',
  cta_title: 'ଆମେ ଏକାଠି ଶିକ୍ଷା ଦେବା। ଆମେ ଏକାଠି ସଂରକ୍ଷଣ କରିବା। ଆମେ ଏକାଠି ବଢ଼ିବା।',
  cta_explore: 'ବିଦ୍ୟାଳୟ ଦେଖନ୍ତୁ', cta_contact: 'ଯୋଗାଯୋଗ କରନ୍ତୁ',
  lang_en: 'English', lang_od: 'ଓଡ଼ିଆ', lang_hi: 'ହିନ୍ଦୀ', lang_sat: 'Santali', lang_olc: 'Ol Chiki',
  dashboard: 'ଡ୍ୟାସବୋର୍ଡ', students: 'ଛାତ୍ରଛାତ୍ରୀ', teachers: 'ଶିକ୍ଷକ ଓ କର୍ମଚାରୀ',
});

// ---------------- Hindi ----------------
define('hi', {
  nav_home: 'होम', nav_about: 'हमारे बारे में', nav_managing: 'प्रबंधन समिति', nav_schools: 'हमारे विद्यालय',
  nav_academics: 'शिक्षा', nav_culture: 'संताली संस्कृति', nav_notices: 'सूचनाएँ', nav_events: 'कार्यक्रम',
  nav_gallery: 'गैलरी', nav_results: 'परिणाम', nav_contact: 'संपर्क',
  login_student: 'छात्र/अभिभावक लॉगिन', login_erp: 'ERP लॉगिन',
  hero_title: 'शिक्षा को सशक्त बनाना, संस्कृति का संरक्षण, भविष्य का निर्माण',
  hero_sub: 'BRANCH ASECA DANGACHUA आधुनिक विद्यालयों के नेटवर्क के माध्यम से शिक्षा, संताली विरासत और सामुदायिक विकास को जोड़ता है।',
  hero_explore: 'हमारे विद्यालय देखें', hero_result: 'परिणाम देखें',
  badge_line: 'शिक्षा • संस्कृति • समुदाय',
  stat_schools: 'विद्यालय', stat_students: 'छात्र', stat_teachers: 'शिक्षक', stat_community: 'बढ़ता समुदाय',
  about_title: 'संस्कृति में निहित शिक्षा',
  about_quality: 'गुणवत्तापूर्ण शिक्षा', about_heritage: 'सांस्कृतिक विरासत', about_community: 'सामुदायिक विकास',
  managing_title: 'प्रबंधन समिति', managing_viewall: 'सभी 11 सदस्य देखें',
  schools_title: 'हमारे विद्यालय', schools_search: 'नाम, गाँव या ब्लॉक से खोजें…', schools_view: 'विद्यालय देखें',
  culture_title: 'संताली संस्कृति एवं शिक्षा',
  stats_title: 'हमारा बढ़ता प्रभाव', stats_years: 'सेवा वर्ष', stats_staff: 'कर्मचारी',
  notices_title: 'सूचनाएँ एवं कार्यक्रम', notices_view: 'देखें', events_upcoming: 'आगामी कार्यक्रम',
  achievements_title: 'उपलब्धियाँ',
  gallery_title: 'गैलरी',
  results_title: 'अपना परिणाम देखें', results_placeholder: 'रोल नंबर / छात्र ID / प्रवेश संख्या लिखें',
  results_search: 'परिणाम खोजें',
  cta_title: 'साथ मिलकर हम शिक्षा देंगे। साथ मिलकर संरक्षण करेंगे। साथ मिलकर आगे बढ़ेंगे।',
  cta_explore: 'विद्यालय देखें', cta_contact: 'संपर्क करें',
  lang_en: 'English', lang_od: 'ଓଡ଼ିଆ', lang_hi: 'हिन्दी', lang_sat: 'Santali', lang_olc: 'Ol Chiki',
  dashboard: 'डैशबोर्ड', students: 'छात्र', teachers: 'शिक्षक एवं कर्मचारी',
});

// ---------------- Santali (Roman script) ----------------
define('sat', {
  nav_home: 'Maina', nav_about: 'Am Do', nav_managing: 'Managing Body', nav_schools: 'Ale Iskul',
  nav_academics: 'Parhao', nav_culture: 'Santal Sanskriti', nav_notices: 'Janau', nav_events: 'Kaj',
  nav_gallery: 'Gallery', nav_results: 'Phalaphal', nav_contact: 'Johar',
  login_student: 'Kuri/Hapan Login', login_erp: 'ERP Login',
  hero_title: 'Parhao Sakti, Sanskriti Rakhai, Bhabishyat Banau',
  hero_sub: 'BRANCH ASECA DANGACHUA adhunik iskul network dwara parhao, Santal parampara ar samaj unnati ke jorai do.',
  hero_explore: 'Ale Iskul Dekhan', hero_result: 'Phalaphal Dekhan',
  badge_line: 'Parhao • Sanskriti • Samaj',
  stat_schools: 'Iskul', stat_students: 'Kuri-Hapan', stat_teachers: 'Guru', stat_community: 'Barhau Samaj',
  about_title: 'Sanskriti Mena Parhao',
  about_quality: 'Bhala Parhao', about_heritage: 'Sanskritik Parampara', about_community: 'Samaj Unnati',
  managing_title: 'Managing Body', managing_viewall: 'Sob 11 Sadasya Dekhan',
  schools_title: 'Ale Iskul', schools_search: 'Nutum, atu ya block dwara khoj…', schools_view: 'Iskul Dekhan',
  culture_title: 'Santal Sanskriti ar Parhao',
  stats_title: 'Ale Barhau Kaj', stats_years: 'Seva Baris', stats_staff: 'Karmachari',
  notices_title: 'Janau ar Kaj', notices_view: 'Dekhan', events_upcoming: 'Aagu Kaj',
  achievements_title: 'Safalta',
  gallery_title: 'Gallery',
  results_title: 'Am Phalaphal Dekhan', results_placeholder: 'Roll No / Student ID / Admission No lekhan',
  results_search: 'Phalaphal Khojan',
  cta_title: 'Mile miley ale parhao doba. Mile miley rakhai doba. Mile miley barhao doba.',
  cta_explore: 'Iskul Dekhan', cta_contact: 'Johar Kojan',
  lang_en: 'English', lang_od: 'ଓଡ଼ିଆ', lang_hi: 'हिन्दी', lang_sat: 'Santali', lang_olc: 'Ol Chiki',
  dashboard: 'Dashboard', students: 'Kuri-Hapan', teachers: 'Guru ar Karmachari',
});
dicts.olc = { ...dicts.sat };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
  fontClass: string;
}

const I18nContext = createContext<I18nCtx>({ lang: 'en', setLang: () => {}, t: (k, f) => f || k, fontClass: '' });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('aseca_lang') as Lang) || 'en');
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('aseca_lang', l);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = useCallback((key: string, fallback?: string) => {
    return dicts[lang]?.[key] || dicts.en[key] || fallback || key;
  }, [lang]);
  const fontClass = lang === 'od' ? 'font-odia' : lang === 'hi' ? 'font-deva' : lang === 'olc' ? 'font-olchiki' : '';
  return <I18nContext.Provider value={{ lang, setLang, t, fontClass }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
