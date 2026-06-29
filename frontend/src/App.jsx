import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import HomeLight from './pages/HomeLight';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import ResultsPage from './pages/ResultsPage';
import PartnersPage from './pages/PartnersPage';
import NewsPage from './pages/NewsPage';
import NewsArticle from './pages/NewsArticle';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NewsForm from './pages/admin/NewsForm';
import GalleryManager from './pages/admin/GalleryManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import SearchModal from './components/ui/SearchModal';
import ChatBot from './components/ui/ChatBot';

function ScrollAnimator() {
  const { pathname } = useLocation();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-animate]:not(.in-view)').forEach(el => observer.observe(el));
    }, 80);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [pathname]);
  return null;
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Retry a few times to handle pages that render asynchronously
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 8) {
          attempts++;
          setTimeout(tryScroll, 120);
        }
      };
      setTimeout(tryScroll, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0f1a' }} />;
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
        <ScrollToHash />
        <ScrollAnimator />
        <SearchModal />
        <ChatBot />
        <Routes>
          {/* Public routes */}
          <Route path="/"          element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about"     element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/programs"  element={<PublicLayout><ProgramsPage /></PublicLayout>} />
          <Route path="/impact"    element={<PublicLayout><ResultsPage /></PublicLayout>} />
          <Route path="/partners"  element={<PublicLayout><PartnersPage /></PublicLayout>} />
          <Route path="/news"      element={<PublicLayout><NewsPage /></PublicLayout>} />
          <Route path="/news/:slug" element={<PublicLayout><NewsArticle /></PublicLayout>} />
          <Route path="/contact"   element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/gallery"   element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/home-light" element={<HomeLight />} />

          {/* Admin routes */}
          <Route path="/admin/login"       element={<AdminLogin />} />
          <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/news/new"    element={<AdminRoute><NewsForm /></AdminRoute>} />
          <Route path="/admin/news/:id/edit" element={<AdminRoute><NewsForm /></AdminRoute>} />
          <Route path="/admin/gallery"   element={<AdminRoute><GalleryManager /></AdminRoute>} />
          <Route path="/admin/projects"  element={<AdminRoute><ProjectsManager /></AdminRoute>} />
          <Route path="/admin"             element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
