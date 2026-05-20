// ============================================================
// Mock Data — Missouri Golf Trail demo data
// ============================================================

import type { Course, TeeTime, Booking, WeatherData, UserProfile } from '@/lib/api';
import type { ChatMessage } from '@/types/chat';

// ── 20 Missouri Courses ─────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    courseId: 'old-kinderhook',
    name: 'Old Kinderhook',
    shortName: 'Old Kinderhook',
    description: 'Tom Weiskopf masterpiece nestled in the rolling hills above the Lake of the Ozarks. Championship layout with dramatic elevation changes and pristine bent grass greens.',
    location: { lat: 37.99, lng: -92.65 },
    address: { street: '678 Old Kinderhook Dr', city: 'Camdenton', state: 'MO', zip: '65020' },
    phone: '(573) 317-3500',
    website: 'https://www.oldkinderhook.com',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 71,
    yardage: { championship: 6855, mens: 6367, ladies: 4952 },
    courseRating: 4.6,
    slopeRating: 136,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR'],
    pricing: { weekday18: { min: 79, max: 99 }, weekend18: { min: 99, max: 139 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'branson-hills',
    name: 'Branson Hills Golf Club',
    shortName: 'Branson Hills',
    description: 'Award-winning Chuck Smith design featuring Ozark mountain views, waterfalls, and challenging yet playable holes for all skill levels.',
    location: { lat: 36.68, lng: -93.30 },
    address: { street: '150 Branson Hills Pkwy', city: 'Branson', state: 'MO', zip: '65616' },
    phone: '(417) 337-2963',
    website: 'https://www.bransonhillsgolf.com',
    region: 'BRANSON',
    holes: 18,
    par: 72,
    yardage: { championship: 7262, mens: 6540, ladies: 5124 },
    courseRating: 4.5,
    slopeRating: 140,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'BAR'],
    pricing: { weekday18: { min: 55, max: 75 }, weekend18: { min: 69, max: 89 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'top-of-the-rock',
    name: 'Top of the Rock',
    shortName: 'Top of the Rock',
    description: 'Jack Nicklaus-designed par-3 masterpiece perched atop a bluff overlooking Table Rock Lake. Home to the Bass Pro Legends of Golf tournament.',
    location: { lat: 36.63, lng: -93.24 },
    address: { street: '150 Top of the Rock Rd', city: 'Ridgedale', state: 'MO', zip: '65739' },
    phone: '(800) 225-6343',
    website: 'https://www.bigcedar.com',
    region: 'BRANSON',
    holes: 18,
    par: 72,
    yardage: { championship: 6873, mens: 6400, ladies: 5100 },
    courseRating: 4.8,
    slopeRating: 142,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR', 'LOCKER_ROOM'],
    pricing: { weekday18: { min: 95, max: 135 }, weekend18: { min: 115, max: 165 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'lodge-of-four-seasons',
    name: 'Lodge of Four Seasons',
    shortName: 'Lodge of Four Seasons',
    description: 'Robert Trent Jones Sr. design with stunning lakeside holes. The Cove and Ridge courses offer 36 holes of championship golf at the lake.',
    location: { lat: 38.12, lng: -92.72 },
    address: { street: '315 Four Seasons Dr', city: 'Lake Ozark', state: 'MO', zip: '65049' },
    phone: '(573) 365-8532',
    website: 'https://www.4seasonsresort.com',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 71,
    yardage: { championship: 6557, mens: 6128, ladies: 4883 },
    courseRating: 4.4,
    slopeRating: 131,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR', 'LOCKER_ROOM'],
    pricing: { weekday18: { min: 59, max: 79 }, weekend18: { min: 79, max: 109 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'thousand-hills',
    name: 'Thousand Hills Golf Resort',
    shortName: 'Thousand Hills',
    description: 'Scenic resort course in the heart of Branson with tight fairways winding through the Ozark hills. Great value for a fun round.',
    location: { lat: 36.65, lng: -93.28 },
    address: { street: '245 S Wildwood Dr', city: 'Branson', state: 'MO', zip: '65616' },
    phone: '(417) 334-4553',
    website: 'https://www.thousandhills.com',
    region: 'BRANSON',
    holes: 18,
    par: 64,
    yardage: { championship: 4091, mens: 3707, ladies: 2900 },
    courseRating: 4.2,
    slopeRating: 110,
    amenities: ['PRO_SHOP', 'LODGING'],
    pricing: { weekday18: { min: 39, max: 49 }, weekend18: { min: 49, max: 69 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'mozingo-lake',
    name: 'Mozingo Lake Golf Course',
    shortName: 'Mozingo Lake',
    description: 'Hidden gem in northwest Missouri. Links-style layout surrounding Mozingo Lake with wide fairways and fast greens. Consistently rated among the best municipal courses in the state.',
    location: { lat: 40.35, lng: -94.88 },
    address: { street: '17070 Mozingo Rd', city: 'Maryville', state: 'MO', zip: '64468' },
    phone: '(660) 562-3864',
    website: 'https://www.mozingolake.com',
    region: 'OTHER',
    holes: 18,
    par: 72,
    yardage: { championship: 7047, mens: 6543, ladies: 5236 },
    courseRating: 4.3,
    slopeRating: 132,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 35, max: 42 }, weekend18: { min: 42, max: 52 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'swope-memorial',
    name: 'Swope Memorial Golf Course',
    shortName: 'Swope Memorial',
    description: 'Historic A.W. Tillinghast design in KC\'s Swope Park. One of the finest municipal courses in America with classic golden-age architecture.',
    location: { lat: 39.03, lng: -94.55 },
    address: { street: '6900 Swope Memorial Dr', city: 'Kansas City', state: 'MO', zip: '64132' },
    phone: '(816) 513-8910',
    website: 'https://www.swopememorialgolf.com',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 72,
    yardage: { championship: 6274, mens: 5870, ladies: 4932 },
    courseRating: 4.1,
    slopeRating: 126,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 35, max: 42 }, weekend18: { min: 42, max: 52 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'shirkey',
    name: 'Shirkey Golf Course',
    shortName: 'Shirkey',
    description: 'Beloved public course in Richmond with a classic layout featuring mature trees and well-maintained fairways. Excellent value and friendly atmosphere.',
    location: { lat: 39.28, lng: -93.97 },
    address: { street: '901 Wollard Blvd', city: 'Richmond', state: 'MO', zip: '64085' },
    phone: '(816) 470-2582',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 71,
    yardage: { championship: 6216, mens: 5810, ladies: 4750 },
    courseRating: 3.9,
    slopeRating: 121,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP'],
    pricing: { weekday18: { min: 35, max: 40 }, weekend18: { min: 40, max: 48 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'normandie',
    name: 'Normandie Golf Club',
    shortName: 'Normandie',
    description: 'The oldest public course west of the Mississippi, established in 1901. Rich history and a challenging layout that has hosted numerous state championships.',
    location: { lat: 38.69, lng: -90.29 },
    address: { street: '7605 St. Charles Rock Rd', city: 'St. Louis', state: 'MO', zip: '63133' },
    phone: '(314) 862-4884',
    website: 'https://www.normandiegolf.com',
    region: 'ST_LOUIS',
    holes: 18,
    par: 71,
    yardage: { championship: 6535, mens: 6100, ladies: 5180 },
    courseRating: 4.0,
    slopeRating: 128,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 38, max: 45 }, weekend18: { min: 45, max: 55 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'bear-creek-valley',
    name: 'Bear Creek Valley Golf Club',
    shortName: 'Bear Creek Valley',
    description: 'Stunning Ozarks course set in a natural valley with creek crossings, native grasses, and panoramic views. A true hidden gem worth the drive.',
    location: { lat: 37.84, lng: -93.77 },
    address: { street: '910 SE Hwy 82', city: 'Osceola', state: 'MO', zip: '64776' },
    phone: '(417) 646-3100',
    region: 'OTHER',
    holes: 18,
    par: 72,
    yardage: { championship: 6658, mens: 6190, ladies: 5002 },
    courseRating: 4.3,
    slopeRating: 130,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 38, max: 45 }, weekend18: { min: 45, max: 58 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'deer-chase',
    name: 'Deer Chase Golf Club',
    shortName: 'Deer Chase',
    description: 'Beautiful Lake of the Ozarks course carved through dense forest with challenging doglegs and elevated tee shots over ravines.',
    location: { lat: 38.03, lng: -92.68 },
    address: { street: '770 Deer Chase Rd', city: 'Linn Creek', state: 'MO', zip: '65052' },
    phone: '(573) 346-6117',
    website: 'https://www.deerchasegolf.com',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 71,
    yardage: { championship: 6350, mens: 5920, ladies: 4815 },
    courseRating: 4.2,
    slopeRating: 129,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'BAR'],
    pricing: { weekday18: { min: 45, max: 55 }, weekend18: { min: 55, max: 72 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'country-creek',
    name: 'Country Creek Golf Club',
    shortName: 'Country Creek',
    description: 'Well-maintained public course just south of KC with rolling terrain, strategic bunkering, and water on several holes.',
    location: { lat: 38.81, lng: -94.27 },
    address: { street: '18099 E State Route 2', city: 'Pleasant Hill', state: 'MO', zip: '64080' },
    phone: '(816) 540-5225',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 72,
    yardage: { championship: 6890, mens: 6410, ladies: 5200 },
    courseRating: 4.0,
    slopeRating: 127,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 39, max: 48 }, weekend18: { min: 48, max: 60 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'eagle-knoll',
    name: 'Eagle Knoll Golf Club',
    shortName: 'Eagle Knoll',
    description: 'Challenging course near Jefferson City with heavily wooded holes and dramatic blufftop views of the Missouri River valley.',
    location: { lat: 38.60, lng: -92.20 },
    address: { street: '1025 Eagle Knoll Dr', city: 'Hartsburg', state: 'MO', zip: '65039' },
    phone: '(573) 761-4653',
    region: 'OTHER',
    holes: 18,
    par: 72,
    yardage: { championship: 6845, mens: 6380, ladies: 5090 },
    courseRating: 4.1,
    slopeRating: 133,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 42, max: 50 }, weekend18: { min: 50, max: 62 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'hidden-lakes',
    name: 'Hidden Lakes Golf Course',
    shortName: 'Hidden Lakes',
    description: 'Warrensburg\'s premier public course featuring multiple lakes, a links-style front nine, and a tree-lined back nine.',
    location: { lat: 38.76, lng: -93.73 },
    address: { street: '1001 Hidden Lakes Dr', city: 'Warrensburg', state: 'MO', zip: '64093' },
    phone: '(660) 747-5990',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 71,
    yardage: { championship: 6482, mens: 6050, ladies: 4920 },
    courseRating: 3.9,
    slopeRating: 124,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP'],
    pricing: { weekday18: { min: 35, max: 40 }, weekend18: { min: 40, max: 50 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'paradise-pointe',
    name: 'Paradise Pointe Golf Complex',
    shortName: 'Paradise Pointe',
    description: 'Two 18-hole courses north of KC — The Pointe and The Outlaw. Outstanding conditioning and variety make this a must-play destination.',
    location: { lat: 39.39, lng: -94.58 },
    address: { street: '18212 Golf Course Rd', city: 'Smithville', state: 'MO', zip: '64089' },
    phone: '(816) 532-4100',
    website: 'https://www.paradisepointegolf.com',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 72,
    yardage: { championship: 7045, mens: 6570, ladies: 5320 },
    courseRating: 4.3,
    slopeRating: 134,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'BAR'],
    pricing: { weekday18: { min: 45, max: 55 }, weekend18: { min: 55, max: 72 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'rivercut',
    name: 'Rivercut Golf Course',
    shortName: 'Rivercut',
    description: 'Springfield\'s top-rated municipal course along the James River. Excellent layout with strategic water hazards and scenic holes.',
    location: { lat: 37.15, lng: -93.35 },
    address: { street: '2850 W Farm Rd 190', city: 'Springfield', state: 'MO', zip: '65810' },
    phone: '(417) 891-1645',
    region: 'SPRINGFIELD',
    holes: 18,
    par: 72,
    yardage: { championship: 6938, mens: 6480, ladies: 5250 },
    courseRating: 4.2,
    slopeRating: 130,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 38, max: 45 }, weekend18: { min: 45, max: 55 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'osage-national',
    name: 'Osage National Golf Resort',
    shortName: 'Osage National',
    description: 'Arnold Palmer-designed resort course at the Lake of the Ozarks. 27 holes of championship golf with rolling Ozark terrain and lake views.',
    location: { lat: 38.10, lng: -92.66 },
    address: { street: '400 Osage Hills Rd', city: 'Lake Ozark', state: 'MO', zip: '65049' },
    phone: '(573) 365-1950',
    website: 'https://www.osagenational.com',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 72,
    yardage: { championship: 7150, mens: 6680, ladies: 5400 },
    courseRating: 4.5,
    slopeRating: 138,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR'],
    pricing: { weekday18: { min: 65, max: 85 }, weekend18: { min: 85, max: 110 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'tapawingo',
    name: 'Tapawingo National Golf Club',
    shortName: 'Tapawingo',
    description: 'Gary Kern design featuring Ozark-style terrain surprisingly close to St. Louis. Beautiful water features and excellent conditioning year-round.',
    location: { lat: 38.58, lng: -90.67 },
    address: { street: '13001 Gary Player Dr', city: 'St. Louis', state: 'MO', zip: '63127' },
    phone: '(636) 349-3100',
    website: 'https://www.tapawingonational.com',
    region: 'ST_LOUIS',
    holes: 18,
    par: 72,
    yardage: { championship: 6962, mens: 6500, ladies: 5300 },
    courseRating: 4.4,
    slopeRating: 135,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'BAR', 'LOCKER_ROOM'],
    pricing: { weekday18: { min: 55, max: 72 }, weekend18: { min: 72, max: 95 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'hawk-ridge',
    name: 'Heritage of Hawk Ridge',
    shortName: 'Hawk Ridge',
    description: 'Prestigious daily-fee course in Lake St. Louis featuring dramatic elevation changes, native grasses, and resort-quality conditioning.',
    location: { lat: 38.78, lng: -90.79 },
    address: { street: '1 Hawk Ridge Trail', city: 'Lake St. Louis', state: 'MO', zip: '63367' },
    phone: '(636) 625-5500',
    website: 'https://www.heritageofhawkridge.com',
    region: 'ST_LOUIS',
    holes: 18,
    par: 71,
    yardage: { championship: 6902, mens: 6440, ladies: 5180 },
    courseRating: 4.3,
    slopeRating: 137,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'BAR'],
    pricing: { weekday18: { min: 55, max: 70 }, weekend18: { min: 70, max: 90 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
  {
    courseId: 'shoal-creek',
    name: 'Shoal Creek Golf Course',
    shortName: 'Shoal Creek',
    description: 'KC\'s crown jewel municipal course. Steve Wolfard design with tournament-quality conditions, water on 10 holes, and excellent practice facilities.',
    location: { lat: 39.18, lng: -94.58 },
    address: { street: '8905 Shoal Creek Pkwy', city: 'Kansas City', state: 'MO', zip: '64157' },
    phone: '(816) 407-7242',
    website: 'https://www.shoalcreekgolf.com',
    region: 'KANSAS_CITY',
    holes: 18,
    par: 71,
    yardage: { championship: 6905, mens: 6430, ladies: 5190 },
    courseRating: 4.4,
    slopeRating: 135,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'BAR'],
    pricing: { weekday18: { min: 42, max: 52 }, weekend18: { min: 52, max: 68 }, cartFee18: 0 },
    imageUrls: ['https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop'],
    status: 'ACTIVE',
  },
];

// ── Demo User Profile ────────────────────────────────────────

export const DEMO_USER: UserProfile = {
  userId: 'demo-user-001',
  email: 'golfer@mogolftrail.com',
  firstName: 'Mike',
  lastName: 'Reynolds',
  phone: '+18165551234',
  ghinNumber: '2847593',
  handicapIndex: 14.2,
  preferences: {
    favoriteCoursesIds: ['top-of-the-rock', 'old-kinderhook', 'shoal-creek'],
    defaultPartySize: 2,
    defaultHoles: 18,
    cartPreference: 'cart',
    pacePreference: 'normal',
    notifications: { email: true, sms: true, push: false },
  },
  paymentMethods: [
    {
      id: 'pm-1',
      type: 'visa',
      last4: '4242',
      expMonth: 8,
      expYear: 2028,
      isDefault: true,
    },
    {
      id: 'pm-2',
      type: 'mastercard',
      last4: '5555',
      expMonth: 3,
      expYear: 2027,
      isDefault: false,
    },
  ],
};

// ── 10 Sample Members ────────────────────────────────────────

export const MOCK_MEMBERS = [
  { id: 'member-001', name: 'Mike Reynolds', handicap: 14.2, homeCourse: 'Shoal Creek', pacePreference: 'normal', cartPreference: 'cart', dietary: 'none' },
  { id: 'member-002', name: 'Sarah Thompson', handicap: 8.6, homeCourse: 'Old Kinderhook', pacePreference: 'fast', cartPreference: 'walking', dietary: 'vegetarian' },
  { id: 'member-003', name: 'Dave Martinez', handicap: 22.1, homeCourse: 'Swope Memorial', pacePreference: 'relaxed', cartPreference: 'cart', dietary: 'none' },
  { id: 'member-004', name: 'Jennifer Chen', handicap: 11.4, homeCourse: 'Tapawingo', pacePreference: 'normal', cartPreference: 'cart', dietary: 'gluten-free' },
  { id: 'member-005', name: 'Tom Bradley', handicap: 5.3, homeCourse: 'Top of the Rock', pacePreference: 'fast', cartPreference: 'walking', dietary: 'none' },
  { id: 'member-006', name: 'Lisa Wang', handicap: 18.7, homeCourse: 'Normandie', pacePreference: 'relaxed', cartPreference: 'cart', dietary: 'none' },
  { id: 'member-007', name: 'Chris Nelson', handicap: 9.8, homeCourse: 'Paradise Pointe', pacePreference: 'fast', cartPreference: 'walking', dietary: 'keto' },
  { id: 'member-008', name: 'Karen Sullivan', handicap: 16.5, homeCourse: 'Hawk Ridge', pacePreference: 'normal', cartPreference: 'cart', dietary: 'none' },
  { id: 'member-009', name: 'Robert Jackson', handicap: 3.1, homeCourse: 'Osage National', pacePreference: 'fast', cartPreference: 'walking', dietary: 'none' },
  { id: 'member-010', name: 'Emily Foster', handicap: 20.4, homeCourse: 'Branson Hills', pacePreference: 'relaxed', cartPreference: 'cart', dietary: 'dairy-free' },
];

// ── Tee Time Generation ──────────────────────────────────────

export function generateTeeTimes(courseId: string, date: string): TeeTime[] {
  const teeTimes: TeeTime[] = [];
  const d = new Date(date + 'T00:00:00');
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const course = MOCK_COURSES.find((c) => c.courseId === courseId);
  if (!course) return [];

  const basePrice = course.pricing.weekday18.min;
  const weekendAdder = isWeekend ? 15 : 0;

  // Seed from courseId + date for deterministic results
  let seed = 0;
  for (let i = 0; i < courseId.length; i++) seed += courseId.charCodeAt(i);
  for (let i = 0; i < date.length; i++) seed += date.charCodeAt(i);
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 100) / 100;
  };

  // Generate from 6:30 AM to 4:00 PM
  for (let hour = 6; hour <= 16; hour++) {
    const minuteStarts = hour === 6 ? [30] : [0, 8, 16, 24, 32, 40, 48, 56];
    for (const minute of minuteStarts) {
      if (hour === 16 && minute > 0) break;

      const r = rand();
      // Skip some slots randomly (more skips on weekends = busier)
      if (isWeekend && r < 0.35) continue;
      if (!isWeekend && r < 0.15) continue;

      const totalSpots = 4;
      const availableSpots = isWeekend
        ? Math.max(0, Math.floor(rand() * 3))
        : Math.min(4, Math.floor(rand() * 4) + 1);

      // Pricing: early bird discount, prime time premium, twilight discount
      let priceModifier = 0;
      if (hour < 8) priceModifier = -10; // early bird
      else if (hour >= 9 && hour <= 12) priceModifier = 15; // prime time
      else if (hour >= 15) priceModifier = -15; // twilight

      teeTimes.push({
        courseId,
        date,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        availableSpots,
        totalSpots,
        price: Math.max(35, basePrice + weekendAdder + priceModifier),
        cartIncluded: true,
        holes: 18,
      });
    }
  }

  return teeTimes;
}

// ── 5 Sample Bookings ────────────────────────────────────────

function getUpcomingDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    bookingId: 'BK-001',
    courseId: 'top-of-the-rock',
    courseName: 'Top of the Rock',
    date: getUpcomingDate(3),
    time: '09:20',
    partySize: 2,
    holes: 18,
    cartPreference: 'cart',
    status: 'CONFIRMED',
    totalCost: 270,
    confirmationCode: 'MGT-TR9K2P',
    createdAt: getPastDate(5),
  },
  {
    bookingId: 'BK-002',
    courseId: 'shoal-creek',
    courseName: 'Shoal Creek Golf Course',
    date: getUpcomingDate(7),
    time: '08:40',
    partySize: 4,
    holes: 18,
    cartPreference: 'cart',
    status: 'CONFIRMED',
    totalCost: 208,
    confirmationCode: 'MGT-SC4H7N',
    createdAt: getPastDate(2),
  },
  {
    bookingId: 'BK-003',
    courseId: 'old-kinderhook',
    courseName: 'Old Kinderhook',
    date: getUpcomingDate(14),
    time: '10:00',
    partySize: 2,
    holes: 18,
    cartPreference: 'cart',
    status: 'PENDING',
    totalCost: 198,
    confirmationCode: 'MGT-OK3M8R',
    createdAt: getPastDate(1),
  },
  {
    bookingId: 'BK-004',
    courseId: 'branson-hills',
    courseName: 'Branson Hills Golf Club',
    date: getPastDate(10),
    time: '09:00',
    partySize: 4,
    holes: 18,
    cartPreference: 'cart',
    status: 'COMPLETED',
    totalCost: 300,
    confirmationCode: 'MGT-BH2K5T',
    createdAt: getPastDate(20),
  },
  {
    bookingId: 'BK-005',
    courseId: 'swope-memorial',
    courseName: 'Swope Memorial Golf Course',
    date: getPastDate(30),
    time: '07:30',
    partySize: 2,
    holes: 18,
    cartPreference: 'walking',
    status: 'CANCELLED',
    totalCost: 84,
    confirmationCode: 'MGT-SM6J3W',
    createdAt: getPastDate(35),
  },
];

// ── Chat Conversation History ────────────────────────────────

export const DEMO_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'demo-1',
    role: 'assistant',
    content: "Hey! 👋 I'm your Missouri Golf Trail concierge. I can find tee times, plan trips, book rounds, and recommend the best courses across the Show-Me State. What are you looking for?",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    quickReplies: [
      'Find me a tee time this Saturday near Branson',
      'Plan a golf trip',
      "What's the best course near KC?",
    ],
  },
  {
    id: 'demo-2',
    role: 'user',
    content: 'Find me a tee time this Saturday near Branson',
    timestamp: new Date(Date.now() - 540000).toISOString(),
  },
  {
    id: 'demo-3',
    role: 'assistant',
    content: "Great choice! Branson has some of the best golf in Missouri. Here are 3 options for this Saturday:",
    timestamp: new Date(Date.now() - 480000).toISOString(),
    richContent: {
      type: 'course_options',
      courses: [
        {
          courseId: 'top-of-the-rock',
          name: 'Top of the Rock',
          time: '9:20 AM',
          date: 'Saturday',
          price: 135,
          rating: 4.8,
          highlight: 'Jack Nicklaus design — stunning lake views',
          cartIncluded: true,
        },
        {
          courseId: 'branson-hills',
          name: 'Branson Hills Golf Club',
          time: '8:48 AM',
          date: 'Saturday',
          price: 75,
          rating: 4.5,
          highlight: 'Best value in Branson — mountain views',
          cartIncluded: true,
        },
        {
          courseId: 'thousand-hills',
          name: 'Thousand Hills Golf Resort',
          time: '10:08 AM',
          date: 'Saturday',
          price: 59,
          rating: 4.2,
          highlight: 'Resort course — great for a casual round',
          cartIncluded: true,
        },
      ],
    },
    quickReplies: ['Book the 9:20 at Top of the Rock for 2', 'Show me Sunday times', 'Different area'],
  },
  {
    id: 'demo-4',
    role: 'user',
    content: 'Book the 9:20 at Top of the Rock for 2',
    timestamp: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: 'demo-5',
    role: 'assistant',
    content: "Perfect! I've got your tee time locked in. Here are the details:",
    timestamp: new Date(Date.now() - 360000).toISOString(),
    richContent: {
      type: 'booking_confirmation',
      booking: {
        bookingId: 'BK-DEMO-001',
        courseName: 'Top of the Rock',
        date: 'Saturday',
        time: '9:20 AM',
        players: 2,
        holes: 18,
        totalCharged: 270,
        confirmationCode: 'MGT-TR9K2P',
        cartIncluded: true,
      },
    },
    quickReplies: ['Cart please', 'Walking', 'Any good BBQ nearby?'],
  },
  {
    id: 'demo-6',
    role: 'user',
    content: 'Cart please. Also any good BBQ nearby?',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'demo-7',
    role: 'assistant',
    content: "Cart is confirmed! 🛒\n\nAs for BBQ near Top of the Rock, you're in luck — the Branson area has some great spots:\n\n🍖 **Danna's BBQ & Burger Shop** — 15 min away in Branson. Legendary burnt ends and pulled pork. Cash only!\n\n🍖 **Gettin' Basted** — 20 min in Branson. Competition-style BBQ with amazing sauce selection. Great ribs.\n\n🍖 **Billy Gail's Cafe** — Not BBQ, but 5 min from the course and serves the biggest pancakes in Missouri. Perfect for pre-round fuel.\n\nWant me to help with anything else for your round?",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    quickReplies: ['Plan a full weekend trip', 'Show me more courses', "That's all, thanks!"],
  },
];

// ── Trip Plan Templates ──────────────────────────────────────

export const MOCK_TRIP_PLANS = [
  {
    id: 'branson-weekend',
    name: 'Branson Golf Weekend',
    description: '3 rounds at Branson\'s finest courses over 2 nights',
    emoji: '🏔️',
    region: 'BRANSON',
    courses: [
      { courseId: 'top-of-the-rock', name: 'Top of the Rock', teeTime: '09:00', day: 'Friday', price: 135 },
      { courseId: 'branson-hills', name: 'Branson Hills Golf Club', teeTime: '08:30', day: 'Saturday', price: 75 },
      { courseId: 'thousand-hills', name: 'Thousand Hills Golf Resort', teeTime: '09:15', day: 'Sunday', price: 59 },
    ],
    hotel: { name: 'Chateau on the Lake', pricePerNight: 159, nights: 2 },
    routeWaypoints: [
      { name: 'Springfield, MO (Start)', lat: 37.22, lng: -93.29, type: 'start' },
      { name: 'Top of the Rock', lat: 36.63, lng: -93.24, type: 'course' },
      { name: 'Chateau on the Lake', lat: 36.67, lng: -93.26, type: 'hotel' },
      { name: 'Branson Hills Golf Club', lat: 36.68, lng: -93.30, type: 'course' },
      { name: 'Thousand Hills Golf Resort', lat: 36.65, lng: -93.28, type: 'course' },
      { name: 'Springfield, MO (Return)', lat: 37.22, lng: -93.29, type: 'end' },
    ],
    driveTimeTotal: '2h 45m',
    interestingStops: [
      { name: 'Bass Pro Shops Outdoor World', type: 'attraction', distance: '5 min from hotel' },
      { name: 'Silver Dollar City', type: 'attraction', distance: '15 min from hotel' },
      { name: 'Danna\'s BBQ & Burger Shop', type: 'restaurant', distance: 'In Branson' },
    ],
    totalCostPerPerson: 899,
    players: 4,
  },
  {
    id: 'kc-corporate',
    name: 'KC Corporate Outing',
    description: 'Premium course + dinner for your team',
    emoji: '💼',
    region: 'KC',
    courses: [
      { courseId: 'shoal-creek', name: 'Shoal Creek Golf Course', teeTime: '09:00', day: 'Thursday', price: 52 },
    ],
    hotel: null,
    routeWaypoints: [
      { name: 'Downtown KC', lat: 39.10, lng: -94.58, type: 'start' },
      { name: 'Shoal Creek Golf Course', lat: 39.18, lng: -94.58, type: 'course' },
      { name: 'Jack Stack Barbecue', lat: 39.09, lng: -94.58, type: 'restaurant' },
      { name: 'Downtown KC', lat: 39.10, lng: -94.58, type: 'end' },
    ],
    driveTimeTotal: '45m',
    interestingStops: [
      { name: 'Jack Stack Barbecue — Freight House', type: 'restaurant', distance: '20 min from course' },
      { name: 'Boulevard Brewing Co.', type: 'brewery', distance: '25 min from course' },
    ],
    totalCostPerPerson: 299,
    players: 8,
  },
  {
    id: 'ozarks-buddy',
    name: 'Ozarks Buddy Trip',
    description: '36+ holes, lakeside lodging, zero responsibilities',
    emoji: '🍻',
    region: 'LAKE_OZARKS',
    courses: [
      { courseId: 'old-kinderhook', name: 'Old Kinderhook', teeTime: '08:30', day: 'Friday', price: 99 },
      { courseId: 'osage-national', name: 'Osage National Golf Resort', teeTime: '09:00', day: 'Saturday', price: 85 },
    ],
    hotel: { name: 'Old Kinderhook Resort', pricePerNight: 179, nights: 2 },
    routeWaypoints: [
      { name: 'St. Louis, MO (Start)', lat: 38.63, lng: -90.20, type: 'start' },
      { name: 'Old Kinderhook', lat: 37.99, lng: -92.65, type: 'course' },
      { name: 'Old Kinderhook Resort', lat: 37.99, lng: -92.66, type: 'hotel' },
      { name: 'Osage National Golf Resort', lat: 38.10, lng: -92.66, type: 'course' },
      { name: 'Bridal Cave', lat: 38.00, lng: -92.60, type: 'attraction' },
      { name: 'St. Louis, MO (Return)', lat: 38.63, lng: -90.20, type: 'end' },
    ],
    driveTimeTotal: '5h 30m',
    interestingStops: [
      { name: 'Ha Ha Tonka State Park', type: 'attraction', distance: '20 min from resort' },
      { name: 'Bridal Cave', type: 'attraction', distance: '10 min from resort' },
      { name: 'JB Hooks Restaurant', type: 'restaurant', distance: 'Lakefront dining' },
      { name: 'Shawnee Bluff Winery', type: 'winery', distance: '15 min from resort' },
    ],
    totalCostPerPerson: 649,
    players: 4,
  },
];

// ── Weather Data ─────────────────────────────────────────────

export function generateWeather(courseId: string, _date?: string): WeatherData {
  const course = MOCK_COURSES.find((c) => c.courseId === courseId);
  const locationName = course ? `${course.address.city}, MO` : 'Missouri';

  // Spring weather for Missouri
  const baseTemp = 65 + Math.floor(Math.random() * 15);
  const conditions = ['Partly Cloudy', 'Sunny', 'Mostly Sunny', 'Scattered Clouds'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  const today = new Date();
  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayConditions = ['Sunny', 'Partly Cloudy', 'Mostly Sunny', 'Cloudy', 'Scattered Showers'];
    forecast.push({
      date: d.toISOString().split('T')[0],
      high: baseTemp + Math.floor(Math.random() * 8) - 2,
      low: baseTemp - 15 + Math.floor(Math.random() * 5),
      condition: dayConditions[Math.floor(Math.random() * dayConditions.length)],
      icon: 'sun',
      precipitation: Math.floor(Math.random() * 30),
      windSpeed: 5 + Math.floor(Math.random() * 12),
    });
  }

  return {
    location: locationName,
    current: {
      temp: baseTemp,
      feelsLike: baseTemp - 2,
      humidity: 45 + Math.floor(Math.random() * 25),
      windSpeed: 8 + Math.floor(Math.random() * 10),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      condition,
      icon: 'sun',
      uvIndex: 5 + Math.floor(Math.random() * 4),
    },
    forecast,
    golfability: 70 + Math.floor(Math.random() * 25),
  };
}

// ── Mock Route Data ──────────────────────────────────────────

export function generateRouteData(tripPlan: any) {
  const waypoints = tripPlan.courses?.map((c: any, i: number) => ({
    index: i,
    name: c.name,
    address: c.address || `${c.name}, Missouri`,
    location: c.location || { latitude: 37 + Math.random(), longitude: -93 + Math.random() },
    type: 'course',
    teeTime: c.teeTime,
    arrivalTime: c.teeTime,
  })) || [];

  if (tripPlan.hotel) {
    waypoints.push({
      index: waypoints.length,
      name: tripPlan.hotel.name || tripPlan.hotel.address,
      address: tripPlan.hotel.address || tripPlan.hotel.name,
      location: { latitude: 37.5, longitude: -93.0 },
      type: 'hotel',
    });
  }

  if (tripPlan.startLocation) {
    waypoints.unshift({
      index: 0,
      name: tripPlan.startLocation.name || tripPlan.startLocation.address,
      address: tripPlan.startLocation.address || '',
      location: tripPlan.startLocation.location || { latitude: 37.22, longitude: -93.29 },
      type: 'start',
    });
  }

  const legs = [];
  for (let i = 0; i < Math.max(1, waypoints.length - 1); i++) {
    legs.push({
      startIndex: i,
      endIndex: i + 1,
      distanceMeters: 20000 + Math.floor(Math.random() * 80000),
      durationMinutes: 15 + Math.floor(Math.random() * 60),
      startAddress: waypoints[i]?.address || 'Start',
      endAddress: waypoints[i + 1]?.address || 'End',
      steps: [],
    });
  }

  const totalDistance = legs.reduce((s, l) => s + l.distanceMeters, 0);
  const totalDuration = legs.reduce((s, l) => s + l.durationMinutes, 0);

  return {
    route: {
      tripId: `trip-${Date.now()}`,
      orderedWaypoints: waypoints,
      legs,
      totalDistanceMeters: totalDistance,
      totalDistanceMiles: Math.round(totalDistance / 1609),
      totalDurationMinutes: totalDuration,
      suggestedDepartureTime: '07:00 AM',
      overviewPolyline: '',
      bounds: { northeast: { lat: 39.5, lng: -90.0 }, southwest: { lat: 36.5, lng: -95.0 } },
      warnings: [],
    },
    interestingStops: [
      { name: 'Bass Pro Shops', type: 'attraction', lat: 36.63, lng: -93.24, rating: 4.6, description: 'Outdoor recreation megastore', distance: '5 min detour' },
      { name: 'Lambert\'s Cafe', type: 'restaurant', lat: 36.95, lng: -93.40, rating: 4.4, description: 'Home of the throwed rolls!', distance: '10 min detour' },
      { name: 'Ha Ha Tonka State Park', type: 'park', lat: 38.00, lng: -92.77, rating: 4.7, description: 'Castle ruins and natural bridge', distance: '15 min detour' },
    ],
    demoMode: true,
  };
}
