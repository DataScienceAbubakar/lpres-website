/**
 * Netlify Function: /api/marketplace/products
 * Serves marketplace products with Netlify Blobs storage support for Netlify deployments.
 */
let _getStore = null;
try { _getStore = require('@netlify/blobs').getStore; } catch (_) { }

const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SEED_PRODUCTS = [
    {
        _id: "seed-1",
        id: 1,
        name: "Premium Bunaji Bulls (Kwara Central)",
        description: "Healthy, fully vaccinated 3-year-old White Fulani (Bunaji) fattened bulls raised under L-PRES veterinary supervision in Ilorin East. Average live weight 380kg - 420kg.",
        category: "Livestock",
        price: { amount: 650000, currency: "NGN", unit: "per bull" },
        quantity: { available: 15, unit: "bulls" },
        location: { region: "Ilorin East", country: "Nigeria" },
        images: [{ url: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80", alt: "Bunaji Bulls", isPrimary: true }],
        specifications: { isOrganic: true, variety: "White Fulani (Bunaji)", grade: "Grade A Fattened" },
        seller: {
            userId: "seller-1",
            name: "Alhaji Ibrahim Danladi",
            contact: { phone: "+234 803 123 4567", email: "ibrahim.danladi@lpres-farmers.ng", whatsapp: "+234 803 123 4567" }
        },
        status: "active",
        views: 124,
        averageRating: 4.9,
        ratings: [],
        inquiries: [],
        createdAt: new Date().toISOString()
    },
    {
        _id: "seed-2",
        id: 2,
        name: "Fresh Pasteurised Dairy Milk",
        description: "Daily harvested fresh raw and pasteurised cow milk produced at Offa Dairy Cold Chain Hub under strict L-PRES hygiene protocols.",
        category: "Livestock",
        price: { amount: 1200, currency: "NGN", unit: "per Litre" },
        quantity: { available: 250, unit: "Litres" },
        location: { region: "Offa", country: "Nigeria" },
        images: [{ url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80", alt: "Fresh Dairy Milk", isPrimary: true }],
        specifications: { isOrganic: true, variety: "Fresh Holstein-Bunaji Cross", grade: "Premium Grade" },
        seller: {
            userId: "seller-2",
            name: "Offa Women Dairy Cooperative",
            contact: { phone: "+234 805 987 6543", email: "offa.dairy@lpres-coop.ng", whatsapp: "+234 805 987 6543" }
        },
        status: "active",
        views: 89,
        averageRating: 5.0,
        ratings: [],
        inquiries: [],
        createdAt: new Date().toISOString()
    },
    {
        _id: "seed-3",
        id: 3,
        name: "High-Nutrient Stylosanthes Hay Bales",
        description: "Nutritious cultivated leguminous forage pasture hay bales harvested from Baruten Grazing Reserve plots. High protein content suitable for dairy & beef cattle.",
        category: "Feed & Fodder",
        price: { amount: 4500, currency: "NGN", unit: "per bale" },
        quantity: { available: 400, unit: "bales" },
        location: { region: "Baruten", country: "Nigeria" },
        images: [{ url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", alt: "Hay Bales", isPrimary: true }],
        specifications: { isOrganic: true, variety: "Stylosanthes hamata", grade: "Class 1 Feed" },
        seller: {
            userId: "seller-3",
            name: "Baruten Pastoralist Support Union",
            contact: { phone: "+234 812 345 6789", email: "baruten.pasture@lpres-coop.ng", whatsapp: "+234 812 345 6789" }
        },
        status: "active",
        views: 65,
        averageRating: 4.8,
        ratings: [],
        inquiries: [],
        createdAt: new Date().toISOString()
    },
    {
        _id: "seed-4",
        id: 4,
        name: "Hybrid Yellow Maize (Dried Grain)",
        description: "Clean, well-dried 50kg bags of yellow grain maize harvested in Edu LGA. Moisture content < 12%, perfect for livestock feed formulation.",
        category: "Cereals",
        price: { amount: 48000, currency: "NGN", unit: "per 50kg bag" },
        quantity: { available: 120, unit: "bags" },
        location: { region: "Edu", country: "Nigeria" },
        images: [{ url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80", alt: "Yellow Maize", isPrimary: true }],
        specifications: { isOrganic: false, variety: "SAMMAZ 15 Hybrid", grade: "Grade A" },
        seller: {
            userId: "seller-4",
            name: "Mallam Usman Pategi",
            contact: { phone: "+234 814 555 7788", email: "usman.pategi@lpres-farmers.ng", whatsapp: "+234 814 555 7788" }
        },
        status: "active",
        views: 110,
        averageRating: 4.9,
        ratings: [],
        inquiries: [],
        createdAt: new Date().toISOString()
    }
];

async function loadProducts() {
    if (!_getStore) return [...SEED_PRODUCTS];
    try {
        const store = _getStore('marketplace-products');
        const raw = await store.get('products');
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error('Blob load error:', e.message);
    }
    return [...SEED_PRODUCTS];
}

async function saveProducts(products) {
    if (!_getStore) return false;
    try {
        const store = _getStore('marketplace-products');
        await store.set('products', JSON.stringify(products));
        return true;
    } catch (e) {
        console.error('Blob save error:', e.message);
        return false;
    }
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }

    const method = event.httpMethod;
    const path = event.path.replace(/^\/api\/marketplace\/?/, '').replace(/\/$/, '');

    try {
        if (method === 'GET') {
            const products = await loadProducts();
            return {
                statusCode: 200,
                headers: HEADERS,
                body: JSON.stringify({ success: true, data: { products } })
            };
        }

        if (method === 'POST' && (path === 'products' || path === '')) {
            const body = JSON.parse(event.body || '{}');
            const products = await loadProducts();
            const newProduct = {
                _id: "prod-" + Date.now(),
                id: Date.now(),
                name: body.name || "Untitled Product",
                description: body.description || "",
                category: body.category || "General",
                price: typeof body.price === 'string' ? JSON.parse(body.price) : (body.price || { amount: 0, currency: "NGN", unit: "unit" }),
                quantity: typeof body.quantity === 'string' ? JSON.parse(body.quantity) : (body.quantity || { available: 1, unit: "unit" }),
                location: typeof body.location === 'string' ? JSON.parse(body.location) : (body.location || { region: "Kwara State", country: "Nigeria" }),
                images: body.images || [{ url: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80", alt: body.name, isPrimary: true }],
                specifications: typeof body.specifications === 'string' ? JSON.parse(body.specifications) : (body.specifications || { isOrganic: false }),
                seller: typeof body.seller === 'string' ? JSON.parse(body.seller) : (body.seller || { userId: "user-1", name: "Kwara Farmer", contact: { phone: "", email: "" } }),
                status: "active",
                views: 1,
                averageRating: 5.0,
                ratings: [],
                inquiries: [],
                createdAt: new Date().toISOString()
            };

            products.unshift(newProduct);
            await saveProducts(products);
            return {
                statusCode: 200,
                headers: HEADERS,
                body: JSON.stringify({ success: true, data: { product: newProduct } })
            };
        }

        if (method === 'DELETE') {
            const match = path.match(/products\/(.+)$/);
            if (match) {
                const prodId = match[1];
                let products = await loadProducts();
                products = products.filter(p => p._id !== prodId && p.id !== Number(prodId));
                await saveProducts(products);
                return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
            }
        }

        return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
    } catch (err) {
        console.error('Marketplace function error:', err);
        return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ detail: err.message }) };
    }
};
