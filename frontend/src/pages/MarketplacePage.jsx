import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    Calendar,
    Package,
    Leaf,
    Star,
    Plus,
    Grid,
    List,
    X,
    Upload,
    User,
    Lock,
    LogOut,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import './MarketplacePage.css';

const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim())
    ? import.meta.env.VITE_API_URL.trim()
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://lpress-website.onrender.com');

export default function MarketplacePage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Auth state for Marketplace Marketers / Buyers
    const [mUser, setMUser] = useState(() => {
        try {
            const saved = localStorage.getItem('lpres_m_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLga, setSelectedLga] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authIntentReason, setAuthIntentReason] = useState('');
    const [revealedContacts, setRevealedContacts] = useState({});

    // Auth form
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authName, setAuthName] = useState('');
    const [authPhone, setAuthPhone] = useState('');
    const [authLga, setAuthLga] = useState('Ilorin East');
    const [authError, setAuthError] = useState('');
    const [authSubmitting, setAuthSubmitting] = useState(false);

    // Add/Edit Product State
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Fetch Products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/marketplace/products`);
            if (!res.ok) throw new Error('Failed to fetch marketplace products');
            const data = await res.json();
            if (data.success && data.data?.products) {
                setProducts(data.data.products);
            }
        } catch (err) {
            console.error('Marketplace load error:', err);
            setError('Unable to connect to live marketplace server. Showing local cache.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Sync route with Auth Modal
    useEffect(() => {
        if (location.pathname === '/marketplace/register') {
            setAuthMode('register');
            setAuthIntentReason('create your marketer account');
            setShowAuthModal(true);
        } else if (location.pathname === '/marketplace/login') {
            setAuthMode('login');
            setAuthIntentReason('log in to your marketer account');
            setShowAuthModal(true);
        }
    }, [location.pathname]);

    // Auth Handlers
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSubmitting(true);

        try {
            const endpoint = authMode === 'register'
                ? `${API_BASE}/api/marketplace/auth/register`
                : `${API_BASE}/api/marketplace/auth/login`;

            const payload = authMode === 'register' ? {
                name: authName,
                email: authEmail,
                phone: authPhone,
                password: authPassword,
                lga: authLga
            } : {
                email: authEmail,
                password: authPassword
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Authentication failed');

            if (data.user) {
                localStorage.setItem('lpres_m_user', JSON.stringify(data.user));
                localStorage.setItem('lpres_m_token', data.token || '');
                setMUser(data.user);
                setShowAuthModal(false);
                setAuthEmail('');
                setAuthPassword('');
                setAuthName('');
                setAuthPhone('');
            }
        } catch (err) {
            setAuthError(err.message || 'Auth error');
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('lpres_m_user');
        localStorage.removeItem('lpres_m_token');
        setMUser(null);
        setRevealedContacts({});
    };

    const requireAuthForAction = (reason, callback) => {
        if (!mUser) {
            setAuthIntentReason(reason);
            setAuthError('');
            setShowAuthModal(true);
        } else {
            callback();
        }
    };

    // Image Upload Handlers
    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validImages = files.filter((file) =>
                ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
            );

            if (validImages.length + selectedImages.length > 4) {
                alert('You can upload up to 4 product photos.');
                return;
            }

            setSelectedImages((prev) => [...prev, ...validImages]);

            validImages.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews((prev) => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Add Product Submit
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!mUser) return;
        if (imagePreviews.length === 0) {
            alert('Please upload or provide at least one product photo.');
            return;
        }

        setIsSubmitting(true);

        const form = e.target;
        const newProduct = {
            name: form.name.value,
            description: form.description.value,
            category: form.category.value,
            price: {
                amount: parseFloat(form.price.value) || 0,
                currency: 'NGN',
                unit: form.priceUnit.value
            },
            quantity: {
                available: parseInt(form.quantity.value, 10) || 1,
                unit: form.quantityUnit.value
            },
            location: {
                region: form.region.value || 'Ilorin East',
                country: 'Nigeria'
            },
            specifications: {
                isOrganic: form.organic.checked,
                variety: form.variety.value || '',
                grade: form.grade.value || ''
            },
            images: imagePreviews.map((url, i) => ({ url, alt: form.name.value, isPrimary: i === 0 })),
            seller: {
                userId: mUser._id || mUser.email,
                name: mUser.name,
                contact: {
                    phone: form.phone.value || mUser.phone,
                    email: mUser.email,
                    whatsapp: form.whatsapp.value || form.phone.value || mUser.phone
                }
            }
        };

        try {
            const token = localStorage.getItem('lpres_m_token');
            const res = await fetch(`${API_BASE}/api/marketplace/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newProduct)
            });

            if (!res.ok) throw new Error('Failed to post product');

            const data = await res.json();
            if (data.success && data.data?.product) {
                setProducts((prev) => [data.data.product, ...prev]);
            } else {
                setProducts((prev) => [newProduct, ...prev]);
            }

            setShowAddModal(false);
            setSelectedImages([]);
            setImagePreviews([]);
            form.reset();
        } catch (err) {
            alert('Product posted locally!');
            setProducts((prev) => [newProduct, ...prev]);
            setShowAddModal(false);
            setSelectedImages([]);
            setImagePreviews([]);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete product
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to remove this listing?')) return;
        try {
            await fetch(`${API_BASE}/api/marketplace/products/${id}`, { method: 'DELETE' });
        } catch (_) { }
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    };

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === 'All' || p.category === selectedCategory;
        const matchesLga = !selectedLga || selectedLga === 'All' || p.location?.region?.toLowerCase() === selectedLga.toLowerCase();

        return matchesSearch && matchesCategory && matchesLga;
    });

    const formatPrice = (amount, unit) => {
        return `₦${Number(amount || 0).toLocaleString()} ${unit || ''}`;
    };

    return (
        <div className="marketplace-page">
            {/* Hero Header */}
            <section className="marketplace-hero">
                <div className="container">
                    <div className="marketplace-hero__content">
                        <div className="marketplace-hero__badge">
                            <Leaf size={16} /> Kwara L-PRES Farmers & Marketers Hub
                        </div>
                        <h1 className="marketplace-hero__title">
                            Livestock & Agro <span className="text-emerald">Marketplace</span>
                        </h1>
                        <p className="marketplace-hero__lead">
                            Directly connect Kwara livestock producers, pastoralists, dairy farmers, and agro-allied marketers with verified buyers state-wide.
                        </p>

                        <div className="marketplace-hero__actions">
                            <button
                                onClick={() => requireAuthForAction('post a product', () => setShowAddModal(true))}
                                className="btn-mp-primary"
                            >
                                <Plus size={18} />
                                <span>List Your Product</span>
                            </button>

                            {mUser ? (
                                <div className="muser-pill">
                                    <User size={16} />
                                    <span>{mUser.name} ({mUser.lga})</span>
                                    <button onClick={handleLogout} className="muser-logout" title="Log out">
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthIntentReason('access your marketer account');
                                        setAuthMode('login');
                                        setAuthError('');
                                        setShowAuthModal(true);
                                    }}
                                    className="btn-mp-secondary"
                                >
                                    <Lock size={16} />
                                    <span>Marketer Login / Register</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="marketplace-filter-section">
                <div className="container">
                    <div className="marketplace-filter-bar">
                        {/* Search */}
                        <div className="mp-search-box">
                            <Search size={18} className="mp-search-icon" />
                            <input
                                type="text"
                                placeholder="Search cattle, dairy, maize, feeds, machinery..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mp-search-input"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="mp-search-clear">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Category Select */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="mp-select"
                        >
                            <option value="">All Categories</option>
                            {['Livestock', 'Feed & Fodder', 'Cereals', 'Cash Crops', 'Root Crops', 'Vegetables', 'Fruits', 'Equipment'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {/* Kwara LGA Filter */}
                        <select
                            value={selectedLga}
                            onChange={(e) => setSelectedLga(e.target.value)}
                            className="mp-select"
                        >
                            <option value="">All Kwara LGAs</option>
                            {[
                                'Ilorin East', 'Ilorin West', 'Ilorin South', 'Offa', 'Baruten',
                                'Kaiama', 'Edu', 'Pategi', 'Ifelodun', 'Irepodun', 'Oyun', 'Isin',
                                'Moro', 'Asa', 'Oke Ero', 'Ekiti'
                            ].map((lga) => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>

                        {/* View Mode Toggle */}
                        <div className="mp-view-toggle">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`mp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                title="Grid view"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`mp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                title="List view"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="marketplace-body">
                <div className="container">
                    <div className="mp-status-header">
                        <h2 className="mp-section-title">
                            Available Listings ({filteredProducts.length})
                        </h2>
                        {selectedCategory && (
                            <span className="mp-active-tag">Category: {selectedCategory}</span>
                        )}
                        {selectedLga && (
                            <span className="mp-active-tag">LGA: {selectedLga}</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="mp-loading-state">
                            <div className="mp-spinner" />
                            <p>Loading Kwara L-PRES Marketplace listings...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="mp-empty-state">
                            <Package size={48} className="mp-empty-icon" />
                            <h3>No products found matching your search</h3>
                            <p>Try adjusting your category or LGA filter, or be the first to list a product in this category!</p>
                            <button
                                onClick={() => requireAuthForAction('list a product', () => setShowAddModal(true))}
                                className="btn-mp-primary"
                                style={{ marginTop: 16 }}
                            >
                                <Plus size={18} /> List a Product Now
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'mp-grid' : 'mp-list'}>
                            {filteredProducts.map((p) => {
                                const prodId = p._id || p.id;
                                const isContactRevealed = revealedContacts[prodId] || mUser;
                                const isOwner = mUser && (p.seller?.userId === mUser._id || p.seller?.email === mUser.email);

                                return (
                                    <div key={prodId} className="mp-card">
                                        {/* Image */}
                                        <div className="mp-card__image-wrap">
                                            <img
                                                src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80'}
                                                alt={p.name}
                                                className="mp-card__image"
                                            />
                                            <span className="mp-card__category">{p.category}</span>
                                            {p.specifications?.isOrganic && (
                                                <span className="mp-card__organic-badge">
                                                    <Leaf size={12} /> Organic
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="mp-card__content">
                                            <div className="mp-card__header">
                                                <h3 className="mp-card__title">{p.name}</h3>
                                                <div className="mp-card__price-box">
                                                    <span className="mp-card__price">{formatPrice(p.price?.amount, p.price?.unit)}</span>
                                                    <span className="mp-card__qty">{p.quantity?.available} {p.quantity?.unit} available</span>
                                                </div>
                                            </div>

                                            <p className="mp-card__desc">{p.description}</p>

                                            <div className="mp-card__meta">
                                                <div className="mp-meta-item">
                                                    <MapPin size={14} />
                                                    <span>{p.location?.region || 'Kwara State'}, {p.location?.country || 'Nigeria'}</span>
                                                </div>
                                                {p.specifications?.variety && (
                                                    <div className="mp-meta-item">
                                                        <Star size={14} className="text-amber" />
                                                        <span>Variety: {p.specifications.variety}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Seller Footer */}
                                            <div className="mp-card__seller-box">
                                                <div className="mp-seller-info">
                                                    <span className="mp-seller-name">{p.seller?.name || 'Kwara Producer'}</span>
                                                    <span className="mp-seller-lga">Verified Seller</span>
                                                </div>

                                                {/* Contact Action */}
                                                <div className="mp-seller-actions">
                                                    {isContactRevealed ? (
                                                        <div className="mp-contacts-disclosed">
                                                            <a
                                                                href={`tel:${p.seller?.contact?.phone || '+2348000000000'}`}
                                                                className="mp-contact-btn phone"
                                                                title="Call Seller"
                                                            >
                                                                <Phone size={15} /> <span>{p.seller?.contact?.phone}</span>
                                                            </a>
                                                            {p.seller?.contact?.whatsapp && (
                                                                <a
                                                                    href={`https://wa.me/${p.seller.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mp-contact-btn whatsapp"
                                                                    title="WhatsApp Seller"
                                                                >
                                                                    <MessageCircle size={15} /> <span>WhatsApp</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                requireAuthForAction('view seller contact details', () => {
                                                                    setRevealedContacts((prev) => ({ ...prev, [prodId]: true }));
                                                                });
                                                            }}
                                                            className="btn-reveal-contact"
                                                        >
                                                            <Lock size={14} /> View Seller Contact
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Owner actions */}
                                            {isOwner && (
                                                <div className="mp-owner-bar">
                                                    <span className="mp-owner-badge">Your Listing</span>
                                                    <button
                                                        onClick={() => handleDeleteProduct(prodId)}
                                                        className="mp-delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Auth Modal (Login / Register) */}
            {showAuthModal && (
                <div className="mp-modal-overlay">
                    <div className="mp-modal">
                        <button onClick={() => setShowAuthModal(false)} className="mp-modal-close">
                            <X size={20} />
                        </button>

                        <div className="mp-auth-header">
                            <div className="mp-auth-icon">
                                <User size={24} />
                            </div>
                            <h2>Marketer Registration & Login</h2>
                            <p>
                                {authIntentReason
                                    ? `Please log in or register to ${authIntentReason}.`
                                    : 'Join the Kwara L-PRES agricultural trade network.'}
                            </p>
                        </div>

                        {/* Toggle Tabs */}
                        <div className="mp-auth-tabs">
                            <button
                                className={`mp-auth-tab ${authMode === 'login' ? 'active' : ''}`}
                                onClick={() => setAuthMode('login')}
                            >
                                Log In
                            </button>
                            <button
                                className={`mp-auth-tab ${authMode === 'register' ? 'active' : ''}`}
                                onClick={() => setAuthMode('register')}
                            >
                                Register
                            </button>
                        </div>

                        {authError && (
                            <div className="mp-auth-error">
                                <AlertCircle size={16} /> {authError}
                            </div>
                        )}

                        <form onSubmit={handleAuthSubmit} className="mp-auth-form">
                            {authMode === 'register' && (
                                <>
                                    <div className="mp-form-group">
                                        <label>Full Name / Business Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Alhaji Sanni Bello"
                                            value={authName}
                                            onChange={(e) => setAuthName(e.target.value)}
                                        />
                                    </div>

                                    <div className="mp-form-group">
                                        <label>Phone Number (WhatsApp) *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+234 803 000 0000"
                                            value={authPhone}
                                            onChange={(e) => setAuthPhone(e.target.value)}
                                        />
                                    </div>

                                    <div className="mp-form-group">
                                        <label>Kwara LGA *</label>
                                        <select
                                            value={authLga}
                                            onChange={(e) => setAuthLga(e.target.value)}
                                        >
                                            {['Ilorin East', 'Ilorin West', 'Ilorin South', 'Offa', 'Baruten', 'Kaiama', 'Edu', 'Pategi', 'Ifelodun', 'Irepodun', 'Oyun', 'Isin', 'Moro', 'Asa'].map((lga) => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="mp-form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="your.email@example.com"
                                    value={authEmail}
                                    onChange={(e) => setAuthEmail(e.target.value)}
                                />
                            </div>

                            <div className="mp-form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={authPassword}
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={authSubmitting}
                                className="btn-mp-primary full-width"
                            >
                                {authSubmitting ? 'Authenticating...' : authMode === 'register' ? 'Create Account' : 'Log In'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="mp-modal-overlay">
                    <div className="mp-modal large">
                        <button onClick={() => setShowAddModal(false)} className="mp-modal-close">
                            <X size={20} />
                        </button>

                        <div className="mp-modal-title-box">
                            <h2>List Your Product on Kwara L-PRES Marketplace</h2>
                            <p>Promote your livestock, produce, fodder, or machinery to thousands of buyers across Kwara State.</p>
                        </div>

                        <form onSubmit={handleAddProduct} className="mp-add-form">
                            <div className="mp-form-grid">
                                <div className="mp-form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Bunaji Fattened Bulls"
                                    />
                                </div>

                                <div className="mp-form-group">
                                    <label>Category *</label>
                                    <select name="category" required>
                                        {['Livestock', 'Feed & Fodder', 'Cereals', 'Cash Crops', 'Root Crops', 'Vegetables', 'Fruits', 'Equipment'].map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mp-form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    placeholder="Describe your produce, animal weight, health condition, and location details..."
                                />
                            </div>

                            <div className="mp-form-grid">
                                <div className="mp-form-group">
                                    <label>Price (₦) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="0"
                                        placeholder="e.g. 45000"
                                    />
                                </div>

                                <div className="mp-form-group">
                                    <label>Price Unit *</label>
                                    <select name="priceUnit" required defaultValue="per bag">
                                        <option value="per bull">per bull</option>
                                        <option value="per head">per head</option>
                                        <option value="per Litre">per Litre</option>
                                        <option value="per bag">per bag</option>
                                        <option value="per 50kg bag">per 50kg bag</option>
                                        <option value="per bale">per bale</option>
                                        <option value="per ton">per ton</option>
                                        <option value="per unit">per unit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mp-form-grid">
                                <div className="mp-form-group">
                                    <label>Available Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        required
                                        min="1"
                                        defaultValue="10"
                                    />
                                </div>

                                <div className="mp-form-group">
                                    <label>Quantity Unit *</label>
                                    <select name="quantityUnit" required defaultValue="bags">
                                        <option value="bulls">bulls</option>
                                        <option value="head">head</option>
                                        <option value="Litres">Litres</option>
                                        <option value="bags">bags</option>
                                        <option value="bales">bales</option>
                                        <option value="tons">tons</option>
                                        <option value="units">units</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mp-form-grid">
                                <div className="mp-form-group">
                                    <label>Kwara Region / LGA *</label>
                                    <select name="region" required defaultValue={mUser?.lga || 'Ilorin East'}>
                                        {['Ilorin East', 'Ilorin West', 'Ilorin South', 'Offa', 'Baruten', 'Kaiama', 'Edu', 'Pategi', 'Ifelodun', 'Irepodun', 'Oyun', 'Isin', 'Moro', 'Asa'].map((lga) => (
                                            <option key={lga} value={lga}>{lga}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mp-form-group">
                                    <label>Variety / Grade (Optional)</label>
                                    <input
                                        type="text"
                                        name="variety"
                                        placeholder="e.g. Bunaji / SAMMAZ Hybrid"
                                    />
                                </div>
                            </div>

                            <div className="mp-form-grid">
                                <div className="mp-form-group">
                                    <label>Contact Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        defaultValue={mUser?.phone || ''}
                                        placeholder="+234 803 000 0000"
                                    />
                                </div>

                                <div className="mp-form-group">
                                    <label>WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        defaultValue={mUser?.phone || ''}
                                        placeholder="+234 803 000 0000"
                                    />
                                </div>
                            </div>

                            {/* Upload Image Section */}
                            <div className="mp-form-group">
                                <label>Product Photos (up to 4) *</label>
                                <label htmlFor="mp-img-upload" className="mp-upload-dropzone">
                                    <Upload size={32} />
                                    <p>Click to choose product photos</p>
                                    <span>JPEG, PNG, WEBP</span>
                                </label>
                                <input
                                    id="mp-img-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />

                                {imagePreviews.length > 0 && (
                                    <div className="mp-previews-grid">
                                        {imagePreviews.map((src, idx) => (
                                            <div key={idx} className="mp-preview-item">
                                                <img src={src} alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="mp-remove-preview"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mp-checkbox-group">
                                <input type="checkbox" id="organic" name="organic" defaultChecked />
                                <label htmlFor="organic">This product is organically produced under L-PRES standards</label>
                            </div>

                            <div className="mp-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-mp-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-mp-primary"
                                >
                                    {isSubmitting ? 'Publishing...' : 'Publish Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
