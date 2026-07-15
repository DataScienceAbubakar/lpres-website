const PROJECTS = [
  {
    id: 1,
    name: "Automatic Weather Stations",
    lga: "Three Senatorial Districts",
    cluster: "Kwara State",
    description: "Kwara L-PRES is combining climate science with modern livestock production through the establishment of three Automatic Weather Stations across Kwara State, one in each senatorial district. The stations generate real-time weather data that is shared with farmers through mobile devices, enabling livestock farmers and herders to make informed decisions, plan grazing activities more effectively, prepare for extreme weather events, and reduce potential losses.",
    status: "Active",
    cover_image: null,
    images: [],
    highlights: ["3 stations, one per senatorial district", "Real-time data via mobile devices", "Supports grazing & extreme weather planning", "Reduces climate-related losses"],
    is_published: true,
    sort_order: 1,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 2,
    name: "Pasture Development",
    lga: "Statewide",
    cluster: "Kwara State",
    description: "Kwara L-PRES is expanding access to improved grazing resources through the establishment of cultivated pasture plots. These pastures provide nutritious forage for livestock, promote sustainable grazing practices, reduce pressure on natural vegetation, and support healthier, more productive animals.",
    status: "Active",
    cover_image: null,
    images: [],
    highlights: ["Cultivated pasture plots established", "Improved forage quality", "Sustainable grazing practices", "Reduced pressure on natural vegetation"],
    is_published: true,
    sort_order: 2,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 3,
    name: "Feedlots",
    lga: "Statewide",
    cluster: "Kwara State",
    description: "The project has established modern feedlots to support intensive livestock finishing and improved productivity. Equipped with reliable water supply systems and drinking troughs, these facilities provide a controlled environment where animals receive adequate nutrition and care, resulting in better weight gain, improved animal health, and higher market value.",
    status: "Active",
    cover_image: null,
    images: [],
    highlights: ["Modern livestock finishing facilities", "Reliable water supply & drinking troughs", "Improved weight gain & animal health", "Higher market value"],
    is_published: true,
    sort_order: 3,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 4,
    name: "Veterinary Diagnostic Centre",
    lga: "Ilorin",
    cluster: "Kwara Central",
    description: "Kwara L-PRES rehabilitated and equipped the State Veterinary Diagnostic Centre with modern facilities to strengthen animal healthcare services across the state. The upgraded facility enhances disease surveillance, improves diagnostic capacity, supports vaccine storage through a functional cold chain system, and contributes to more effective prevention and control of livestock diseases.",
    status: "Completed",
    cover_image: null,
    images: [],
    highlights: ["Rehabilitated & re-equipped facility", "Enhanced disease surveillance", "Functional vaccine cold chain", "Improved diagnostic capacity"],
    is_published: true,
    sort_order: 4,
    created_at: "2026-06-01T08:00:00",
    updated_at: null,
  },
  {
    id: 5,
    name: "Water Troughs",
    lga: "Statewide",
    cluster: "Kwara State",
    description: "To improve access to clean water for livestock, Kwara L-PRES has constructed water troughs at strategic locations across the state. These facilities provide reliable drinking points for animals, reduce the distance travelled in search of water, support healthier livestock, and contribute to more efficient and sustainable livestock production.",
    status: "Active",
    cover_image: null,
    images: [],
    highlights: ["Constructed at strategic locations", "Reliable drinking points for livestock", "Reduced distance travelled for water", "Supports healthier, more productive animals"],
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
