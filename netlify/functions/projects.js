const PROJECTS = [
  {
    id: 1,
    name: "Kwara Cattle Development Centre",
    lga: "Ilorin East",
    cluster: "Kwara Central",
    description: "A modern facility upgrading commercial cattle breeding and fattening for over 2,400 registered farmers across Kwara State, providing quality breeds, veterinary services, and technical extension support for improved productivity.",
    status: "Active",
    cover_image: "/uploads/seed_hero.jpg",
    images: ["/uploads/seed_spc.png"],
    highlights: ["2,400+ farmers registered", "Quality breed distribution", "24/7 veterinary support", "Annual capacity: 5,000 head"],
    is_published: true,
    sort_order: 1,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 2,
    name: "Modern Abattoir & Processing Plant",
    lga: "Ilorin West",
    cluster: "Kwara Central",
    description: "A N250M state-of-the-art facility providing hygienic meat processing and cold storage for local beef producers, connecting smallholder farmers to formal markets across Nigeria with improved food safety standards.",
    status: "Completed",
    cover_image: "/uploads/seed_spc.png",
    images: [],
    highlights: ["N250M investment", "ISO-certified processing", "Cold chain capacity: 50 tonnes", "Links 600+ farmers to markets"],
    is_published: true,
    sort_order: 2,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 3,
    name: "Pastoral Cooperative Grazing Centre",
    lga: "Baruten",
    cluster: "Kwara North",
    description: "Organised cooperative grazing and veterinary centre serving 1,200 beneficiaries across the northern corridor, reducing farmer-herder resource conflicts and improving animal health outcomes through shared infrastructure.",
    status: "Active",
    cover_image: "/uploads/3f91f5451d9743d9bc908498a4d37768.jpg",
    images: [],
    highlights: ["1,200 beneficiaries served", "Conflict reduction programme", "3 boreholes constructed", "Monthly vet outreach days"],
    is_published: true,
    sort_order: 3,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 4,
    name: "Dairy Cold Chain Hub",
    lga: "Offa",
    cluster: "Kwara South",
    description: "A modern cold-chain logistics and milk collection centre empowering 400 dairy-producing families with reliable market access, quality control systems, and value addition capacity that increases household income.",
    status: "Active",
    cover_image: "/uploads/5eade72c30034904b983a020a9995867.jpeg",
    images: [],
    highlights: ["400 dairy families empowered", "3,000L daily processing capacity", "Direct supermarket linkages", "30% income increase recorded"],
    is_published: true,
    sort_order: 4,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 5,
    name: "Kwara Regional Livestock Market",
    lga: "Pategi",
    cluster: "Kwara North",
    description: "A revitalised regional trading centre with modern holding pens, water infrastructure, and direct buyer linkages — improving price discovery and reducing post-purchase losses for over 800 producers weekly.",
    status: "Planned",
    cover_image: "/uploads/8a690bf164b34435b37806ecd0ef55e1.jpg",
    images: [],
    highlights: ["800+ producers weekly", "Digital price discovery system", "Modern holding pens: 2,000 head", "Water infrastructure included"],
    is_published: true,
    sort_order: 5,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
];

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const path = event.path.replace(/^\/api\/projects\/?/, "");
  const id = path ? parseInt(path, 10) : null;

  if (id) {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) return { statusCode: 404, headers, body: JSON.stringify({ detail: "Project not found" }) };
    return { statusCode: 200, headers, body: JSON.stringify(project) };
  }

  return { statusCode: 200, headers, body: JSON.stringify(PROJECTS) };
};
