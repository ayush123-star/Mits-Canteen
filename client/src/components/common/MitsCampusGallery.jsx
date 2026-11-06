import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  Building2,
  UtensilsCrossed,
  BookOpen,
  Home,
  TreePine,
  Sparkles,
  ArrowRight,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
  Award,
  Clock
} from 'lucide-react';

const CAMPUS_ITEMS = [
  {
    id: 'main-canteen',
    category: 'canteen',
    title: 'MITS Main Canteen & Dining Hall',
    subtitle: 'Primary Campus Dining Hub & Live Token Counter 1',
    description: 'The heartbeat of campus dining at MITS Gwalior! Features an expansive student dining hall, live TV token calling display, 100% pure vegetarian live kitchen, and express pickup stations.',
    image: '/assets/campus/mits-main-canteen.jpg',
    tag: '⭐ Primary Dining Hub',
    isPrimary: true,
    location: 'Central Campus Core (Opposite Architecture Block)',
    canteenNote: '📍 Main Food Pickup Counter 1 Here',
    actionText: 'Browse Live Food Menu',
    actionLink: '/menu'
  },
  {
    id: 'heritage',
    category: 'heritage',
    title: 'Historic Heritage Administrative Building',
    subtitle: 'Inaugurated by President Dr. Rajendra Prasad & Maharaja Jiwaji Rao Scindia (1957)',
    description: 'The iconic red-brick colonial heritage structure stands as the proud architectural symbol of MITS Gwalior with nearly seven decades of academic excellence.',
    image: '/assets/campus/mits-heritage-building.jpg',
    tag: 'Historic Landmark (1957)',
    location: 'Central Administrative Quad',
    canteenNote: '3 min stroll to Main Canteen',
    actionText: 'Order Ahead for Break',
    actionLink: '/menu'
  },
  {
    id: 'academic',
    category: 'academic',
    title: 'Engineering & Technology Academic Blocks',
    subtitle: 'CSE, IT, ET, AI & DS, Mechanical, Civil & Electrical Complexes',
    description: 'High-tech lecture theatres, supercomputing facilities, and robotics laboratories. Pre-order your hot snacks and beverages right before your lecture concludes.',
    image: '/assets/campus/mits-academic-block.jpg',
    tag: 'Academic Departments',
    location: 'Engineering Department Wings',
    canteenNote: 'Pre-order from lecture & skip queue',
    actionText: 'Order Classroom Snacks',
    actionLink: '/menu'
  },
  {
    id: 'main-gate',
    category: 'heritage',
    title: 'Grand Entrance Gate & Campus Boulevard',
    subtitle: 'Race Course Road, Gola Ka Mandir, Gwalior',
    description: 'The grand monumental entrance welcoming over 5,000+ engineers, scholars, faculty members, and researchers to the sprawling 44.6-acre campus daily.',
    image: '/assets/campus/mits-main-gate.jpg',
    tag: 'Main Gateway',
    location: 'Gola Ka Mandir Gate',
    canteenNote: 'Direct paved walk to Canteen',
    actionText: 'Check Live Canteen Tokens',
    actionLink: '/live-tokens'
  },
  {
    id: 'library',
    category: 'academic',
    title: 'Central Library & Digital Knowledge Consortia',
    subtitle: 'Over 1,00,000 Volumes, Digital Archives & Reading Pods',
    description: 'Automated learning center with international research journals, silent study zones, and campus network connectivity. Perfect spot for afternoon study breaks.',
    image: '/assets/campus/mits-central-library.jpg',
    tag: 'Digital Library',
    location: 'Library Complex Quad',
    canteenNote: 'Quick tea, coffee & snack recharge',
    actionText: 'Study Break Order',
    actionLink: '/menu'
  },
  {
    id: 'hostel',
    category: 'hostel',
    title: 'Student Hostels & Residential Campus',
    subtitle: 'Boys & Girls Residential Halls with Modern Amenities',
    description: 'Safe on-campus residential community with Wi-Fi, recreation zones, and study rooms. Enjoy fresh evening snacks and dinner combos.',
    image: '/assets/campus/mits-hostel.jpg',
    tag: 'Campus Residential',
    location: 'Hostel Enclave',
    canteenNote: 'Evening snacks & group dinner',
    actionText: 'View Evening Menu',
    actionLink: '/menu'
  },
  {
    id: 'gardens',
    category: 'hostel',
    title: 'Lush Botanical Lawns & Shaded Courtyards',
    subtitle: 'Open-Air Relaxation & Student Collaboration Spaces',
    description: 'Sprawling green lawns where students collaborate on technical projects, prepare for exams, and relish freshly grilled sandwiches in the sunshine.',
    image: '/assets/campus/mits-gardens.jpg',
    tag: 'Botanical Gardens',
    location: 'Central Lawn & Scindia Square',
    canteenNote: 'Outdoor dining & quick bites',
    actionText: 'Order Takeaway Tray',
    actionLink: '/menu'
  },
  {
    id: 'events',
    category: 'events',
    title: 'Campus Hackathons, Fests & Technical Convocations',
    subtitle: 'Annual Cultural Festivals, Tech Carnivals & Conventions',
    description: 'From national technical hackathons to vibrant cultural fests and convocations, campus open-air stages and auditoriums buzz with collegiate innovation.',
    image: '/assets/campus/mits-campus-events.jpg',
    tag: 'Annual Campus Events',
    location: 'MITS Open Grounds & Auditorium',
    canteenNote: 'Festival specials & catering',
    actionText: 'Order Combo Platters',
    actionLink: '/menu'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Campus Spaces', icon: Sparkles },
  { id: 'canteen', label: '🍽️ MITS Main Canteen', icon: UtensilsCrossed },
  { id: 'heritage', label: '🏛️ Heritage & Landmarks', icon: Landmark },
  { id: 'academic', label: '📚 Academics & Library', icon: BookOpen },
  { id: 'hostel', label: '🌿 Hostels & Gardens', icon: TreePine },
  { id: 'events', label: '🎉 Events & Hackathons', icon: Building2 },
];

export const MitsCampusGallery = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all'
    ? CAMPUS_ITEMS
    : CAMPUS_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="campus-spaces" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
      {/* Highlighted Outer Container with Radial Glow */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1C263A]/90 via-[#151C30]/90 to-[#0B1020]/95 border-2 border-purple-500/30 p-6 sm:p-10 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl overflow-hidden">
        
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#7955E8]/20 via-[#526DFF]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-10 relative z-10">
          
          {/* Section Header: Highlighted Badge & Bold Typography */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7955E8]/20 via-[#526DFF]/20 to-[#7955E8]/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>MITS GWALIOR &bull; 44.6-ACRE HISTORIC CAMPUS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Explore MITS Campus & Dining Spaces
            </h2>

            <p className="text-sm sm:text-base text-[#AAB3C5] leading-relaxed font-normal">
              Take an interactive visual tour across our historic 1957 heritage grounds. Pre-order from your classrooms and enjoy zero-queue meals at the <strong className="text-purple-300 font-extrabold">MITS Main Canteen & Dining Hall</strong>.
            </p>

            {/* Quick Stat Highlight Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#151C30]/80 border border-purple-500/25 flex items-center gap-2 text-slate-200">
                <Landmark className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold">Established 1957</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-[#151C30]/80 border border-purple-500/25 flex items-center gap-2 text-slate-200">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">MITS Main Canteen Counter 1</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-[#151C30]/80 border border-purple-500/25 flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold">100% Pure Vegetarian Campus</span>
              </div>
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-[#151C30] text-[#AAB3C5] hover:text-white hover:bg-[#1C263A] border border-purple-500/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Campus Photographs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group rounded-3xl overflow-hidden transition-all duration-500 flex flex-col justify-between ${
                  item.isPrimary
                    ? 'bg-[#1C263A] border-2 border-purple-400/60 shadow-2xl shadow-purple-500/30 ring-2 ring-purple-500/20'
                    : 'bg-[#1C263A]/90 border border-purple-500/20 shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20'
                }`}
              >
                {/* Image Box */}
                <div className="relative h-60 overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05] transition-transform duration-700 group-hover:scale-108"
                    onError={(e) => {
                      e.target.src = '/assets/campus/mits-heritage-building.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/30 to-transparent"></div>

                  {/* Top Tag Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                        item.isPrimary
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white border border-purple-300/40'
                          : 'bg-[#0B1020]/90 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Location Info Overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/30 border border-purple-500/40 font-black uppercase text-purple-200 shadow-xs shrink-0">
                      MITS
                    </span>
                  </div>
                </div>

                {/* Description & Canteen Action Box */}
                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-bold text-purple-400/90 mt-1">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-[#AAB3C5] mt-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Canteen Connectivity & Action Footer */}
                  <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300 truncate">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{item.canteenNote}</span>
                    </div>

                    <Link
                      to={item.actionLink || '/menu'}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                        item.isPrimary
                          ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 hover:opacity-95'
                          : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      <span>{item.actionText || 'Order Now'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout Banner */}
          <div className="p-5 rounded-2xl bg-[#151C30]/80 border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-black shadow-md shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  Heading to MITS Main Canteen during your recess?
                </h4>
                <p className="text-xs text-[#AAB3C5]">
                  Place your order ahead to avoid waiting in physical dining lines.
                </p>
              </div>
            </div>

            <Link
              to="/menu"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>Explore Menu Catalog &rarr;</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MitsCampusGallery;
