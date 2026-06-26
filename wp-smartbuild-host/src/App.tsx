import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Smartphone, 
  Settings, 
  Database, 
  Sparkles, 
  HelpCircle, 
  Layout, 
  ChevronLeft,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { Site, Contractor, ProjectRequest } from './types';
import AdminDashboard from './components/AdminDashboard';
import HostedSiteView from './components/HostedSiteView';
import PhoneMockup from './components/PhoneMockup';

export default function App() {
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Parse path to support custom hosted URLs (e.g., /site/smartbuild)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const siteSlug = React.useMemo(() => {
    const match = currentPath.match(/^\/site\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }, [currentPath]);

  // Support back/forward navigation within SPA custom routing
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Custom navigate function
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Fetch all sites on mount
  const fetchSites = async (selectSlug?: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/sites');
      if (!res.ok) throw new Error("Failed to load hosted directories from server.");
      const data: Site[] = await res.json();
      setSites(data);
      
      // Decide which site is active
      if (data.length > 0) {
        if (selectSlug) {
          const found = data.find(s => s.slug === selectSlug);
          if (found) setActiveSite(found);
        } else if (!activeSite) {
          setActiveSite(data[0]);
        } else {
          // Keep same active site refreshed
          const currentActive = data.find(s => s.id === activeSite.id);
          setActiveSite(currentActive || data[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error communicating with full-stack server backend. Make sure dev server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites(siteSlug || undefined);
  }, [siteSlug]);

  // CREATE site API call
  const handleCreateSite = async (title: string, slug: string, tagline: string) => {
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, tagline })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create directory site.");
      }
      const newSite: Site = await res.json();
      await fetchSites(newSite.slug);
    } catch (err: any) {
      alert(err.message || "Failed to provision hosted site.");
      throw err;
    }
  };

  // UPDATE site API call
  const handleUpdateSite = async (updated: Site) => {
    try {
      const res = await fetch(`/api/sites/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to save changes to backend.");
      const saved: Site = await res.json();
      
      // Update local state
      setSites(prev => prev.map(s => s.id === saved.id ? saved : s));
      setActiveSite(saved);
    } catch (err: any) {
      alert(err.message || "Failed to update configurations.");
    }
  };

  // DELETE site API call
  const handleDeleteSite = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this hosted directory site and all its data?")) return;
    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete site.");
      
      const remaining = sites.filter(s => s.id !== id);
      setSites(remaining);
      if (remaining.length > 0) {
        setActiveSite(remaining[0]);
      } else {
        setActiveSite(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete hosted site.");
    }
  };

  // RESTORE Backup API call
  const handleRestoreBackup = async (data: any[]) => {
    try {
      const res = await fetch('/api/sites/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to upload database backup.");
      await fetchSites();
    } catch (err: any) {
      alert(err.message || "Restore backup failed.");
    }
  };

  // VISITORS: Submit project request on a hosted directory
  const handleSubmitRequest = async (slug: string, reqData: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      const res = await fetch(`/api/sites/${slug}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      if (!res.ok) throw new Error("Submission rejected by server.");
      
      // Reload sites to see new request in admin dashboard
      await fetchSites();
    } catch (err: any) {
      alert(err.message || "Failed to submit project request.");
      throw err;
    }
  };

  // VISITORS: Join directory as contractor
  const handleJoinDirectory = async (slug: string, contractorData: Omit<Contractor, 'id' | 'rating' | 'reviewsCount'>) => {
    try {
      const res = await fetch(`/api/sites/${slug}/contractors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractorData)
      });
      if (!res.ok) throw new Error("Registration failed.");
      
      // Reload sites to see new contractor in list
      await fetchSites();
    } catch (err: any) {
      alert(err.message || "Failed to register profile.");
      throw err;
    }
  };

  // loading view
  if (loading && sites.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <h3 className="font-semibold text-sm tracking-wide uppercase">Booting WordPress SmartBuild Core...</h3>
        <p className="text-xs text-slate-400">Loading custom themes, contractor listings, and leads data.</p>
      </div>
    );
  }

  // error view
  if (error && sites.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg font-display">Server Connection Lost</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchSites()}
          className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-400 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* ROUTE: STANDALONE PUBLIC VIEW (/site/:slug)          */
  /* ---------------------------------------------------- */
  if (siteSlug) {
    const hostedSite = sites.find(s => s.slug === siteSlug);
    if (!hostedSite) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <Globe className="w-12 h-12 text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">404 - Directory Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">The hosted directory site you are looking for has been moved or deleted by the administrator.</p>
          <button 
            onClick={() => navigateTo('/')}
            className="mt-4 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold"
          >
            Go to WordPress Console
          </button>
        </div>
      );
    }

    return (
      <div className="w-full min-h-screen bg-slate-100 flex flex-col">
        {/* WordPress branding banner overlay on top of the hosted site */}
        <div className="bg-slate-900 text-slate-400 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-950 flex-shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-mono">WordPress Host</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-200">{hostedSite.title}</span>
          </div>
          <button 
            id="back-to-console-btn"
            onClick={() => navigateTo('/')}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1 rounded transition"
          >
            ← Back to CMS Dashboard
          </button>
        </div>

        {/* Render fully live public Hosted Directory */}
        <div className="flex-1 overflow-hidden relative">
          <HostedSiteView 
            site={hostedSite}
            onSubmitRequest={(req) => handleSubmitRequest(hostedSite.slug, req)}
            onJoinDirectory={(con) => handleJoinDirectory(hostedSite.slug, con)}
          />
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* ROUTE: MAIN CMS CREATOR & CUSTOMIZER (Split Screen)  */
  /* ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Dynamic Global Topbar */}
      <header id="wp-topbar" className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-emerald-500 rounded text-slate-950 font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white font-display text-sm">SmartBuild WordPress-Host Console</h1>
            <p className="text-[10px] text-slate-400 font-mono">Status: Connected to Express Backend Container • Port: 3000</p>
          </div>
        </div>

        {activeSite && (
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline text-[11px] text-slate-400">
              Live Hosted link: <a href={`/site/${activeSite.slug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-emerald-400 hover:underline">/site/{activeSite.slug}</a>
            </span>
            <a
              id="view-live-btn"
              href={`/site/${activeSite.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
            >
              <span>View Hosted Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </header>

      {/* Main Builder Split Workspace */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* Left Side: CMS Administration Dashboard */}
        <div className="flex-1 xl:w-2/3 overflow-y-auto p-4 md:p-6 bg-slate-950 border-r border-slate-900">
          <AdminDashboard 
            sites={sites}
            activeSite={activeSite}
            onSelectSite={(s) => setActiveSite(s)}
            onCreateSite={handleCreateSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
            onRestoreBackup={handleRestoreBackup}
          />
        </div>

        {/* Right Side: Live Interactive Mobile Previewer */}
        <div className="xl:w-1/3 bg-slate-900 border-t xl:border-t-0 xl:border-l border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-y-auto">
          
          {/* Section Header */}
          <div className="absolute top-4 left-6 flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Interactive Visual Builder Live View</span>
          </div>

          {activeSite ? (
            <div className="w-full h-full pt-8 flex items-center justify-center">
              <PhoneMockup 
                isFullscreen={isFullscreenPreview}
                onToggleFullscreen={(val) => setIsFullscreenPreview(val)}
                siteTitle={activeSite.title}
              >
                {/* Renders the Hosted view, inside our elegant phone frame */}
                <HostedSiteView 
                  site={activeSite}
                  onSubmitRequest={(req) => handleSubmitRequest(activeSite.slug, req)}
                  onJoinDirectory={(con) => handleJoinDirectory(activeSite.slug, con)}
                  isPreview={true}
                />
              </PhoneMockup>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500 max-w-xs">
              <Settings className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-pulse" />
              <h3 className="font-bold text-slate-300 text-sm">No Site Created</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">Create or select a WordPress site in the admin panel to enable live interactive previews.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
