const ITEMS = [
  {
    id: 1,
    title: "L-PRES Field Survey — Kwara North",
    description: "Field teams conducting livestock health assessment across the northern corridor communities in Baruten LGA.",
    file_url: "/uploads/seed_hero.jpg",
    thumbnail_url: "/uploads/seed_hero.jpg",
    media_type: "photo",
    category: "Field Work",
    is_published: true,
    sort_order: 1,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 2,
    title: "State Project Coordination Meeting",
    description: "Senior L-PRES officials and LGA coordinators reviewing Q2 implementation targets at the State Project Office.",
    file_url: "/uploads/seed_spc.png",
    thumbnail_url: "/uploads/seed_spc.png",
    media_type: "photo",
    category: "Outreach",
    is_published: true,
    sort_order: 2,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 3,
    title: "Farmer Training — Value Chain Development",
    description: "Extension agents training smallholder farmers on improved livestock management, record keeping, and market linkage strategies.",
    file_url: "/uploads/3f91f5451d9743d9bc908498a4d37768.jpg",
    thumbnail_url: "/uploads/3f91f5451d9743d9bc908498a4d37768.jpg",
    media_type: "photo",
    category: "Training",
    is_published: true,
    sort_order: 3,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 4,
    title: "Kwara State Livestock Map Infographic",
    description: "L-PRES project area coverage and key infrastructure sites mapped across all 16 LGAs of Kwara State.",
    file_url: "/uploads/seed_video.mp4",
    thumbnail_url: "/uploads/seed_spc.png",
    media_type: "video",
    category: "Field Work",
    is_published: true,
    sort_order: 4,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 5,
    title: "Animal Health Campaign — Ilorin East",
    description: "Veterinary team administering vaccines and conducting health screenings during the quarterly animal health outreach programme.",
    file_url: "/uploads/5eade72c30034904b983a020a9995867.jpeg",
    thumbnail_url: "/uploads/5eade72c30034904b983a020a9995867.jpeg",
    media_type: "photo",
    category: "Outreach",
    is_published: true,
    sort_order: 5,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 6,
    title: "Water Point Construction — Edu LGA",
    description: "One of 67 water infrastructure projects completed under L-PRES, serving pastoral communities and reducing resource conflict.",
    file_url: "/uploads/8a690bf164b34435b37806ecd0ef55e1.jpg",
    thumbnail_url: "/uploads/8a690bf164b34435b37806ecd0ef55e1.jpg",
    media_type: "photo",
    category: "Demonstration",
    is_published: true,
    sort_order: 6,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
];

const CATEGORIES = [
  { name: "Field Work", count: 2 },
  { name: "Outreach", count: 2 },
  { name: "Training", count: 1 },
  { name: "Demonstration", count: 1 },
];

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const path = event.path.replace(/^\/api\/gallery\/?/, "");

  if (path === "categories") {
    return { statusCode: 200, headers, body: JSON.stringify(CATEGORIES) };
  }

  const params = event.queryStringParameters || {};
  const type = params.media_type;
  const category = params.category;

  let items = ITEMS.filter((i) => i.is_published);
  if (type) items = items.filter((i) => i.media_type === type);
  if (category) items = items.filter((i) => i.category === category);

  return { statusCode: 200, headers, body: JSON.stringify(items) };
};
