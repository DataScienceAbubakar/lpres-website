// News is managed via the FastAPI backend in production.
// This function serves sample articles for the static Netlify preview.
const ARTICLES = [
  {
    id: 1,
    title: "L-PRES Kicks Off Statewide Animal Health Campaign Across 16 LGAs",
    body: "<p>The Kwara State Livestock Productivity and Resilience Support Project (L-PRES) has launched a comprehensive animal health campaign targeting livestock farmers across all 16 Local Government Areas of Kwara State.</p><p>The campaign, which commenced in Q1 2026, targets over 250,000 animals for vaccination against Foot and Mouth Disease, Contagious Bovine Pleuropneumonia (CBPP), and Peste des Petits Ruminants (PPR).</p><p>Speaking at the launch, the L-PRES State Project Coordinator emphasised the importance of preventive health management in boosting livestock productivity and reducing economic losses for rural households.</p>",
    featured_image: "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=800&q=80",
    images: [],
    event_date: "2026-03-15",
    published_by: "L-PRES Communications",
    template: 1,
    is_published: true,
    slug: "lpres-statewide-animal-health-campaign",
    excerpt: "L-PRES launches a comprehensive animal health campaign targeting over 250,000 animals across all 16 LGAs of Kwara State.",
    category: "News",
    created_at: "2026-03-15T10:00:00",
    updated_at: null,
  },
  {
    id: 2,
    title: "400 Dairy Farmers Trained on Modern Milk Collection and Cold Chain Practices",
    body: "<p>A five-day intensive training programme on milk collection, hygiene, and cold chain management was completed by 400 dairy farmers in Offa LGA under the L-PRES Dairy Value Chain component.</p><p>The training, conducted in partnership with the Kwara State Dairy Cooperative, equipped farmers with skills in milk quality testing, proper storage techniques, and linkages to processing facilities.</p><p>Participants were also provided with hygiene kits and access to the newly commissioned Dairy Cold Chain Hub, which has capacity to process 3,000 litres of milk daily.</p>",
    featured_image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80",
    images: [],
    event_date: "2026-04-20",
    published_by: "L-PRES Communications",
    template: 1,
    is_published: true,
    slug: "dairy-farmers-cold-chain-training",
    excerpt: "400 dairy farmers in Offa LGA complete five-day training on milk collection and cold chain management under the L-PRES Dairy Value Chain component.",
    category: "Training",
    created_at: "2026-04-20T09:00:00",
    updated_at: null,
  },
  {
    id: 3,
    title: "L-PRES Completes Construction of 12 Water Points Across Northern Kwara",
    body: "<p>Twelve (12) water points have been successfully constructed across Baruten, Kaiama, and Edu Local Government Areas as part of the L-PRES pastoral infrastructure support programme.</p><p>The water infrastructure, completed ahead of the dry season, will serve an estimated 8,000 pastoralists and their livestock, reducing migration-related conflicts and improving animal health outcomes in the northern corridor.</p><p>Each water point is equipped with solar-powered pumps and concrete troughs designed to provide year-round water supply for livestock.</p>",
    featured_image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=80",
    images: [],
    event_date: "2026-05-10",
    published_by: "L-PRES Field Operations",
    template: 1,
    is_published: true,
    slug: "water-points-construction-northern-kwara",
    excerpt: "L-PRES completes 12 solar-powered water points across Baruten, Kaiama, and Edu LGAs, serving an estimated 8,000 pastoralists ahead of the dry season.",
    category: "Field Work",
    created_at: "2026-05-10T11:00:00",
    updated_at: null,
  },
];

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const path = event.path.replace(/^\/api\/news\/?/, "");
  const slug = path && !path.startsWith("admin") ? path : null;

  if (slug) {
    const article = ARTICLES.find((a) => a.slug === slug);
    if (!article) return { statusCode: 404, headers, body: JSON.stringify({ detail: "Not found" }) };
    return { statusCode: 200, headers, body: JSON.stringify(article) };
  }

  return { statusCode: 200, headers, body: JSON.stringify(ARTICLES) };
};
