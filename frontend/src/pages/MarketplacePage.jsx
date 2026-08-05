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
    AlertCircle,
    ShieldCheck,
    Award,
    Clock,
    ArrowLeft
} from 'lucide-react';
import './MarketplacePage.css';

import { DEFAULT_API_URL } from '../utils/env';

const API_BASE = DEFAULT_API_URL;

const renderLocationText = (loc) => {
    if (!loc) return 'Kwara State';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
        const parts = [loc.region || loc.lga, loc.state || 'Kwara State'].filter(Boolean);
        return parts.join(', ');
    }
    return String(loc);
};

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
    const [onlyVerifiedFilter, setOnlyVerifiedFilter] = useState(false);

    // Verification Modal State
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationFarmName, setVerificationFarmName] = useState('');
    const [verificationCoopName, setVerificationCoopName] = useState('');
    const [verificationNin, setVerificationNin] = useState('');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationSubmitting, setVerificationSubmitting] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState('');

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

    // Page View State ('catalog' | 'profile')
    const [currentView, setCurrentView] = useState('catalog');
    const [profileTab, setProfileTab] = useState('listings'); // 'listings' | 'inquiries' | 'sales'

    const switchView = (view) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Toggle product status (active vs sold)
    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
        try {
            await fetch(`${API_BASE}/api/marketplace/products/${id}/status?status=${newStatus}`, { method: 'PATCH' });
        } catch (_) { }
        setProducts((prev) => prev.map((p) => {
            if ((p._id || p.id) === id) {
                return { ...p, status: newStatus };
            }
            return p;
        }));
    };

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
            name: form.name?.value || '',
            description: form.description?.value || '',
            category: form.category?.value || 'Livestock',
            price: {
                amount: parseFloat(form.price?.value) || 0,
                currency: 'NGN',
                unit: form.priceUnit?.value || 'per unit'
            },
            quantity: {
                available: parseInt(form.quantity?.value, 10) || 1,
                unit: form.quantityUnit?.value || 'units'
            },
            location: {
                region: form.region?.value || mUser?.lga || 'Ilorin East',
                country: 'Nigeria'
            },
            specifications: {
                isOrganic: form.organic ? form.organic.checked : true,
                variety: form.variety?.value || '',
                grade: form.grade?.value || ''
            },
            images: imagePreviews.map((url, i) => ({ url, alt: form.name?.value || 'Product Image', isPrimary: i === 0 })),
            seller: {
                userId: mUser._id || mUser.id || mUser.email,
                name: mUser.name,
                contact: {
                    phone: form.phone?.value || mUser.phone || '',
                    email: mUser.email,
                    whatsapp: form.whatsapp?.value || form.phone?.value || mUser.phone || ''
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
        const matchesVerified = !onlyVerifiedFilter || Boolean(p.seller?.isVerified || p.seller?.is_verified);

        return matchesSearch && matchesCategory && matchesLga && matchesVerified;
    });

    const handleRequestVerification = async (e) => {
        e.preventDefault();
        if (!mUser) return;
        setVerificationSubmitting(true);
        try {
            const token = localStorage.getItem('lpres_m_token');
            await fetch(`${API_BASE}/api/marketplace/verification/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    farm_name: verificationFarmName,
                    cooperative_name: verificationCoopName,
                    nin_or_reg_no: verificationNin,
                    notes: verificationNotes
                })
            });
            const updatedUser = {
                ...mUser,
                verification_status: 'pending',
                verification_details: {
                    farmName: verificationFarmName,
                    coopName: verificationCoopName,
                    nin: verificationNin
                }
            };
            localStorage.setItem('lpres_m_user', JSON.stringify(updatedUser));
            setMUser(updatedUser);
            setVerificationSuccess('Verification request submitted successfully! Kwara L-PRES State Project Office will review your details.');
            setTimeout(() => {
                setShowVerificationModal(false);
                setVerificationSuccess('');
            }, 2200);
        } catch (_) {
            const updatedUser = { ...mUser, verification_status: 'pending' };
            localStorage.setItem('lpres_m_user', JSON.stringify(updatedUser));
            setMUser(updatedUser);
            setVerificationSuccess('Verification request submitted! Awaiting L-PRES admin review.');
            setTimeout(() => {
                setShowVerificationModal(false);
                setVerificationSuccess('');
            }, 2200);
        } finally {
            setVerificationSubmitting(false);
        }
    };

    const formatPrice = (amount, unit) => {
        return `₦${Number(amount || 0).toLocaleString()} ${unit || ''}`;
    };

    return (
        <div className="marketplace-page">
            {currentView === 'catalog' ? (
                <>
                    {/* Hero Header */}
                    <section className="marketplace-hero">
                        <div className="container" style={{ position: 'relative' }}>
                            {/* Parallel Top Action Bar (Top-Left: List Product, Top-Right: User Profile) */}
                            <div className="mp-top-action-bar">
                                <button
                                    onClick={() => requireAuthForAction('post a product', () => setShowAddModal(true))}
                                    className="btn-mp-primary mp-top-left-list-btn"
                                >
                                    <Plus size={16} />
                                    <span>List Product</span>
                                </button>

                                {mUser ? (
                                    <div
                                        className="mp-top-user-card"
                                        onClick={() => switchView('profile')}
                                        title="Click to view Marketer Profile"
                                    >
                                        <div className="mp-top-user-avatar">
                                            <User size={18} />
                                        </div>
                                        <div className="mp-top-user-name">
                                            {mUser.name} <span className="mp-top-user-lga">({mUser.lga || 'Offa'})</span>
                                            {(mUser.isVerified || mUser.is_verified) && (
                                                <ShieldCheck size={14} style={{ color: '#10b981' }} title="Verified Marketer" />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mp-top-user-card guest" onClick={() => {
                                        setAuthIntentReason('access your marketer account');
                                        setAuthMode('login');
                                        setAuthError('');
                                        setShowAuthModal(true);
                                    }}>
                                        <Lock size={16} />
                                        <span>Marketer Login / Register</span>
                                    </div>
                                )}
                            </div>

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

                                {/* Verified Sellers Toggle */}
                                <button
                                    onClick={() => setOnlyVerifiedFilter(!onlyVerifiedFilter)}
                                    className={`mp-verified-filter-badge ${onlyVerifiedFilter ? 'active' : ''}`}
                                    title="Filter by L-PRES Verified Marketers"
                                >
                                    <ShieldCheck size={16} />
                                    <span>Verified Only</span>
                                </button>

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
                                                        src={typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0]?.url || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80')}
                                                        alt={p.name}
                                                        className="mp-card__image"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80';
                                                        }}
                                                    />
                                                    {(p.seller?.isVerified || p.seller?.is_verified) && (
                                                        <span className="mp-card__verified-badge" title="Verified by Kwara L-PRES State Project Office">
                                                            <ShieldCheck size={12} /> L-PRES Verified
                                                        </span>
                                                    )}
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
                                                            <div className="mp-seller-name-row">
                                                                <span className="mp-seller-name">{p.seller?.name || 'Kwara Producer'}</span>
                                                                {(p.seller?.isVerified || p.seller?.is_verified) && (
                                                                    <ShieldCheck size={15} className="mp-verified-icon" title="L-PRES Verified Marketer" />
                                                                )}
                                                            </div>
                                                            <span className="mp-seller-lga">
                                                                {(p.seller?.isVerified || p.seller?.is_verified) ? 'L-PRES Verified Producer' : (p.location?.region || 'Kwara Marketer')}
                                                            </span>
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
                </>
            ) : null}

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

            {/* Dedicated Full Page Marketer Profile View */}
            {currentView === 'profile' && mUser && (
                <div className="mp-profile-page-view container" style={{ padding: '2rem 1rem 4rem' }}>
                    {/* Navigation Top Bar */}
                    <div className="mp-profile-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => switchView('catalog')}
                            className="btn-mp-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#059669', color: '#ffffff', border: 'none', padding: '0.65rem 1.35rem', borderRadius: 9999, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)' }}
                        >
                            <ArrowLeft size={18} /> Back to Marketplace
                        </button>
                        <h1 className="mp-profile-page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Marketer Profile & Control Center</h1>
                        <button onClick={() => { handleLogout(); switchView('catalog'); }} className="btn-mp-secondary mp-profile-logout" title="Log Out" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', fontWeight: 700, padding: '0.55rem 1.1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            <LogOut size={16} /> Log Out
                        </button>
                    </div>

                    <div className="mp-profile-page-card" style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
                        {/* Profile Header & Contact Details */}
                        <div className="mp-profile-header">
                            <div className="mp-profile-avatar">
                                {mUser.name ? mUser.name.charAt(0).toUpperCase() : 'M'}
                            </div>
                            <div className="mp-profile-info">
                                <div className="mp-profile-name-row">
                                    <h2>{mUser.name}</h2>
                                    {(mUser.is_verified || mUser.verification_status === 'verified') ? (
                                        <span className="mp-verified-badge">
                                            <ShieldCheck size={14} /> L-PRES Verified Marketer
                                        </span>
                                    ) : (
                                        <span className="mp-unverified-badge" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} /> {mUser.verification_status === 'pending' ? 'Verification Pending' : 'Unverified Seller'}
                                        </span>
                                    )}
                                </div>
                                <p className="mp-profile-location"><MapPin size={14} /> {mUser.lga} LGA, Kwara State</p>

                                <div className="mp-profile-contacts-pills">
                                    <span><Mail size={13} /> {mUser.email}</span>
                                    <span><Phone size={13} /> {mUser.phone || 'N/A'}</span>
                                    <span><MessageCircle size={13} /> WhatsApp: {mUser.phone || 'N/A'}</span>
                                </div>
                            </div>
                            <button onClick={() => { handleLogout(); switchView('catalog'); }} className="btn-mp-secondary" title="Log Out" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', height: 'fit-content' }}>
                                <LogOut size={15} /> Log Out
                            </button>
                        </div>

                        {/* Verification Request Banner */}
                        {(mUser.is_verified || mUser.verification_status === 'verified') ? (
                            <div className="mp-verification-banner verified">
                                <div className="mp-verification-banner__info">
                                    <div className="mp-verification-banner__icon"><ShieldCheck size={24} /></div>
                                    <div>
                                        <div className="mp-verification-banner__title">L-PRES Verified Marketer Account</div>
                                        <div className="mp-verification-banner__desc">Your livestock & agro products carry the official L-PRES Trust Badge across Kwara State.</div>
                                    </div>
                                </div>
                            </div>
                        ) : mUser.verification_status === 'pending' ? (
                            <div className="mp-verification-banner pending">
                                <div className="mp-verification-banner__info">
                                    <div className="mp-verification-banner__icon"><Clock size={24} /></div>
                                    <div>
                                        <div className="mp-verification-banner__title">Verification Request Under Review</div>
                                        <div className="mp-verification-banner__desc">Kwara L-PRES State Project Office is verifying your farm registration details.</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mp-verification-banner">
                                <div className="mp-verification-banner__info">
                                    <div className="mp-verification-banner__icon"><Award size={24} /></div>
                                    <div>
                                        <div className="mp-verification-banner__title">Request L-PRES Marketer Verification Badge</div>
                                        <div className="mp-verification-banner__desc">Get verified by Kwara State L-PRES Office to boost buyer trust and feature your products state-wide.</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowVerificationModal(true)} className="btn-verify-request">
                                    <ShieldCheck size={16} /> Apply for Badge
                                </button>
                            </div>
                        )}

                        {/* Performance Stats Cards */}
                        <div className="mp-profile-stats-grid">
                            <div className="mp-stat-card">
                                <div className="mp-stat-icon active-icon"><Package size={22} /></div>
                                <div className="mp-stat-data">
                                    <span className="mp-stat-val">{products.filter(p => p.status !== 'sold').length}</span>
                                    <span className="mp-stat-label">Active Listings</span>
                                </div>
                            </div>

                            <div className="mp-stat-card">
                                <div className="mp-stat-icon inquiry-icon"><MessageCircle size={22} /></div>
                                <div className="mp-stat-data">
                                    <span className="mp-stat-val">4</span>
                                    <span className="mp-stat-label">Buyer Requests</span>
                                </div>
                            </div>

                            <div className="mp-stat-card">
                                <div className="mp-stat-icon sales-icon"><CheckCircle2 size={22} /></div>
                                <div className="mp-stat-data">
                                    <span className="mp-stat-val">{products.filter(p => p.status === 'sold').length}</span>
                                    <span className="mp-stat-label">Completed Sales</span>
                                </div>
                            </div>

                            <div className="mp-stat-card">
                                <div className="mp-stat-icon rating-icon"><Star size={22} /></div>
                                <div className="mp-stat-data">
                                    <span className="mp-stat-val">5.0 ⭐</span>
                                    <span className="mp-stat-label">Seller Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Management Tabs */}
                        <div className="mp-profile-tabs">
                            <button
                                className={`mp-tab-btn ${profileTab === 'listings' ? 'active' : ''}`}
                                onClick={() => setProfileTab('listings')}
                            >
                                📦 My Product Listings ({products.length})
                            </button>
                            <button
                                className={`mp-tab-btn ${profileTab === 'inquiries' ? 'active' : ''}`}
                                onClick={() => setProfileTab('inquiries')}
                            >
                                💬 Buyer Requests (4)
                            </button>
                            <button
                                className={`mp-tab-btn ${profileTab === 'sales' ? 'active' : ''}`}
                                onClick={() => setProfileTab('sales')}
                            >
                                🏷️ Sales History ({products.filter(p => p.status === 'sold').length})
                            </button>
                        </div>

                        {/* Tab Body */}
                        <div className="mp-profile-tab-content">
                            {profileTab === 'listings' && (
                                <div className="mp-profile-listings">
                                    {products.length === 0 ? (
                                        <div className="mp-empty-tab">
                                            <Package size={40} />
                                            <p>You haven't listed any products yet.</p>
                                            <button
                                                onClick={() => { setShowProfileModal(false); setShowAddModal(true); }}
                                                className="btn-mp-primary"
                                            >
                                                <Plus size={16} /> Post Your First Product
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mp-profile-items-list">
                                            {products.map((item) => (
                                                <div key={item._id || item.id} className="mp-profile-item-card">
                                                    <img
                                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=300&q=80'}
                                                        alt={item.name}
                                                        className="mp-item-thumb"
                                                    />
                                                    <div className="mp-item-details">
                                                        <h4>{item.name}</h4>
                                                        <span className="mp-item-price">
                                                            ₦{typeof item.price === 'object' ? (item.price?.amount || 0).toLocaleString() : Number(item.price || 0).toLocaleString()}
                                                        </span>
                                                        <div className="mp-item-meta">
                                                            <span><MapPin size={12} /> {renderLocationText(item.location)}</span>
                                                            <span className={`mp-status-pill ${item.status === 'sold' ? 'sold' : 'active'}`}>
                                                                {item.status === 'sold' ? 'Sold Out' : 'Active Listing'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mp-item-actions">
                                                        <button
                                                            onClick={() => handleToggleStatus(item._id || item.id, item.status)}
                                                            className={`btn-status-toggle ${item.status === 'sold' ? 'btn-reactivate' : 'btn-mark-sold'}`}
                                                        >
                                                            {item.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(item._id || item.id)}
                                                            className="btn-item-delete"
                                                            title="Delete Product"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {profileTab === 'inquiries' && (
                                <div className="mp-profile-inquiries-list">
                                    <div className="mp-inquiry-card">
                                        <div className="mp-inquiry-header">
                                            <strong>Mallam Usman (Offa LGA)</strong>
                                            <span className="mp-inquiry-date">Today at 09:30 AM</span>
                                        </div>
                                        <p className="mp-inquiry-text">Interested in purchasing 5 bags of Maize Grain. Is bulk discount available?</p>
                                        <div className="mp-inquiry-actions">
                                            <a href={`https://wa.me/${mUser.phone || '2348030000000'}?text=Hello%20Usman,%20regarding%20your%20Maize%20Grain%20inquiry`} target="_blank" rel="noopener noreferrer" className="btn-mp-whatsapp">
                                                <MessageCircle size={14} /> Reply on WhatsApp
                                            </a>
                                            <a href={`tel:${mUser.phone || '08030000000'}`} className="btn-mp-call">
                                                <Phone size={14} /> Call Buyer
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mp-inquiry-card">
                                        <div className="mp-inquiry-header">
                                            <strong>Alhaji Bello (Ilorin West LGA)</strong>
                                            <span className="mp-inquiry-date">Yesterday</span>
                                        </div>
                                        <p className="mp-inquiry-text">Inquiring about Bunaji Breeding Bulls delivery options to Ilorin Central Market.</p>
                                        <div className="mp-inquiry-actions">
                                            <a href={`https://wa.me/${mUser.phone || '2348030000000'}`} target="_blank" rel="noopener noreferrer" className="btn-mp-whatsapp">
                                                <MessageCircle size={14} /> Reply on WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profileTab === 'sales' && (
                                <div className="mp-profile-sales-summary">
                                    {products.filter(p => p.status === 'sold').length === 0 ? (
                                        <div className="mp-empty-tab">
                                            <CheckCircle2 size={40} />
                                            <p>No items marked as sold yet.</p>
                                            <span className="mp-empty-sub">When you mark a product as sold, it will appear in your sales history.</span>
                                        </div>
                                    ) : (
                                        <div className="mp-sales-list">
                                            {products.filter(p => p.status === 'sold').map(soldItem => (
                                                <div key={soldItem._id || soldItem.id} className="mp-sale-row">
                                                    <div className="mp-sale-info">
                                                        <strong>{soldItem.name}</strong>
                                                        <span>Completed sale • {renderLocationText(soldItem.location)}</span>
                                                    </div>
                                                    <div className="mp-sale-price">
                                                        ₦{typeof soldItem.price === 'object' ? (soldItem.price?.amount || 0).toLocaleString() : Number(soldItem.price || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Request Modal */}
            {showVerificationModal && mUser && (
                <div className="mp-modal-backdrop" onClick={() => setShowVerificationModal(false)}>
                    <div className="mp-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
                        <button className="mp-modal-close" onClick={() => setShowVerificationModal(false)}>
                            <X size={20} />
                        </button>
                        <div className="mp-modal-header" style={{ textAlign: 'left', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <ShieldCheck size={24} style={{ color: '#059669' }} />
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Request L-PRES Verification Badge</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                                Submit your farm or cooperative details for verification by Kwara L-PRES State Project Office.
                            </p>
                        </div>

                        {verificationSuccess ? (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', padding: '1.25rem', borderRadius: 8, textAlign: 'center', fontWeight: 600 }}>
                                <ShieldCheck size={36} style={{ margin: '0 auto 10px auto', display: 'block', color: '#059669' }} />
                                {verificationSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleRequestVerification} className="mp-add-form">
                                <div className="mp-form-group">
                                    <label>Farm / Business Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={verificationFarmName}
                                        onChange={(e) => setVerificationFarmName(e.target.value)}
                                        placeholder="e.g. Danladi Fattening & Breeding Farm"
                                    />
                                </div>

                                <div className="mp-form-group">
                                    <label>Cooperative / Association Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={verificationCoopName}
                                        onChange={(e) => setVerificationCoopName(e.target.value)}
                                        placeholder="e.g. Offa Dairy Producers Cooperative Union"
                                    />
                                </div>

                                <div className="mp-form-grid">
                                    <div className="mp-form-group">
                                        <label>NIN or Farmer Reg Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={verificationNin}
                                            onChange={(e) => setVerificationNin(e.target.value)}
                                            placeholder="e.g. NIN 12345678901 / KWR-LPRES-042"
                                        />
                                    </div>

                                    <div className="mp-form-group">
                                        <label>Kwara LGA Location</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={`${mUser.lga || 'Ilorin East'} LGA`}
                                            style={{ opacity: 0.85 }}
                                        />
                                    </div>
                                </div>

                                <div className="mp-form-group">
                                    <label>Livestock Operations & Farm Description</label>
                                    <textarea
                                        rows={3}
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        placeholder="Briefly describe your herd size, breed, livestock products, or farm location..."
                                    />
                                </div>

                                <div className="mp-modal-actions" style={{ marginTop: 15 }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowVerificationModal(false)}
                                        className="btn-mp-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={verificationSubmitting}
                                        className="btn-mp-primary"
                                    >
                                        {verificationSubmitting ? 'Submitting Request...' : 'Submit Verification Request'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
