import React, { useState } from 'react';
import { 
  Globe, 
  Settings, 
  Users, 
  Mail, 
  Database, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Download, 
  UploadCloud, 
  ExternalLink, 
  Layout, 
  Layers, 
  TrendingUp, 
  Briefcase, 
  Sparkles, 
  Check, 
  X, 
  FileText, 
  ChevronRight,
  PlusCircle,
  Clock,
  Eye
} from 'lucide-react';
import { Site, Contractor, ProjectRequest } from '../types';
import { PRESET_THEMES } from '../data/presets';

interface AdminDashboardProps {
  sites: Site[];
  activeSite: Site | null;
  onSelectSite: (site: Site) => void;
  onCreateSite: (title: string, slug: string, tagline: string) => Promise<void>;
  onUpdateSite: (updated: Site) => Promise<void>;
  onDeleteSite: (id: string) => Promise<void>;
  onRestoreBackup: (data: any[]) => Promise<void>;
}

export default function AdminDashboard({
  sites,
  activeSite,
  onSelectSite,
  onCreateSite,
  onUpdateSite,
  onDeleteSite,
  onRestoreBackup
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'sites' | 'customizer' | 'contractors' | 'leads' | 'backup'>('sites');
  
  // Create site states
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [newSiteSlug, setNewSiteSlug] = useState('');
  const [newSiteTagline, setNewSiteTagline] = useState('');
  const [siteCreateError, setSiteCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Customizer state helpers
  const [customizerTitle, setCustomizerTitle] = useState(activeSite?.title || '');
  const [customizerTagline, setCustomizerTagline] = useState(activeSite?.tagline || '');
  const [customizerAccent, setCustomizerAccent] = useState(activeSite?.accentColor || 'teal');
  const [customizerGradient, setCustomizerGradient] = useState(activeSite?.bannerGradient || '');
  const [customizerCategory, setCustomizerCategory] = useState('');
  const [customizerCategories, setCustomizerCategories] = useState<string[]>(activeSite?.categories || []);

  // Contractor state helpers
  const [isAddingContractor, setIsAddingContractor] = useState(false);
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null);
  const [contractorForm, setContractorForm] = useState({
    name: '',
    specialty: 'House Construction',
    experience: 5,
    location: '',
    priceRange: '$$',
    rating: 4.8,
    reviewsCount: 15
  });

  // Sync customizer inputs when changing active site
  React.useEffect(() => {
    if (activeSite) {
      setCustomizerTitle(activeSite.title);
      setCustomizerTagline(activeSite.tagline);
      setCustomizerAccent(activeSite.accentColor);
      setCustomizerGradient(activeSite.bannerGradient);
      setCustomizerCategories(activeSite.categories);
    }
  }, [activeSite]);

  // Handle site creation
  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteTitle || !newSiteSlug) return;
    
    // Clean slug
    const cleanSlug = newSiteSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSlug) {
      setSiteCreateError('Invalid slug. Use lower-case letters, numbers, and dashes.');
      return;
    }

    if (sites.some(s => s.slug === cleanSlug)) {
      setSiteCreateError('A site with this slug already exists.');
      return;
    }

    setIsCreating(true);
    setSiteCreateError('');
    try {
      await onCreateSite(newSiteTitle, cleanSlug, newSiteTagline || "Find help for your build");
      setNewSiteTitle('');
      setNewSiteSlug('');
      setNewSiteTagline('');
      setActiveTab('customizer');
    } catch (err) {
      setSiteCreateError('Failed to create site.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle site update (Customizer)
  const handleSaveCustomizer = async () => {
    if (!activeSite) return;
    const updated: Site = {
      ...activeSite,
      title: customizerTitle,
      tagline: customizerTagline,
      accentColor: customizerAccent,
      bannerGradient: customizerGradient,
      categories: customizerCategories
    };
    await onUpdateSite(updated);
    alert('Website customizations saved successfully!');
  };

  // Theme preset picker
  const applyPresetTheme = (themeId: string) => {
    const theme = PRESET_THEMES.find(t => t.id === themeId);
    if (theme) {
      setCustomizerAccent(theme.accentColor);
      setCustomizerGradient(theme.bannerGradient);
    }
  };

  // Add category tag
  const handleAddCategory = () => {
    if (!customizerCategory.trim()) return;
    if (customizerCategories.includes(customizerCategory.trim())) return;
    setCustomizerCategories([...customizerCategories, customizerCategory.trim()]);
    setCustomizerCategory('');
  };

  // Delete category tag
  const handleDeleteCategory = (catToDelete: string) => {
    setCustomizerCategories(customizerCategories.filter(c => c !== catToDelete));
  };

  // Manage contractor CRUD
  const handleContractorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite) return;

    let updatedContractors = [...activeSite.contractors];

    if (editingContractorId) {
      // Edit mode
      updatedContractors = updatedContractors.map(c => {
        if (c.id === editingContractorId) {
          return {
            ...c,
            name: contractorForm.name,
            specialty: contractorForm.specialty,
            experience: Number(contractorForm.experience),
            location: contractorForm.location,
            priceRange: contractorForm.priceRange,
            rating: Number(contractorForm.rating),
            reviewsCount: Number(contractorForm.reviewsCount)
          };
        }
        return c;
      });
      setEditingContractorId(null);
    } else {
      // Add mode
      const initials = contractorForm.name.substring(0, 2).toUpperCase() || "CN";
      const colors = ['bg-teal-600 text-white', 'bg-blue-600 text-white', 'bg-purple-600 text-white', 'bg-emerald-600 text-white', 'bg-orange-600 text-white'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newContractor: Contractor = {
        id: `c-${Date.now()}`,
        name: contractorForm.name,
        specialty: contractorForm.specialty,
        experience: Number(contractorForm.experience),
        rating: Number(contractorForm.rating) || 5.0,
        reviewsCount: Number(contractorForm.reviewsCount) || 1,
        location: contractorForm.location,
        priceRange: contractorForm.priceRange,
        avatarLetters: initials,
        avatarColor: randomColor
      };
      updatedContractors.push(newContractor);
      setIsAddingContractor(false);
    }

    await onUpdateSite({
      ...activeSite,
      contractors: updatedContractors
    });

    // Reset Form
    setContractorForm({
      name: '',
      specialty: activeSite.categories[0] || 'House Construction',
      experience: 5,
      location: '',
      priceRange: '$$',
      rating: 4.8,
      reviewsCount: 15
    });
  };

  const handleEditContractorClick = (c: Contractor) => {
    setEditingContractorId(c.id);
    setIsAddingContractor(true);
    setContractorForm({
      name: c.name,
      specialty: c.specialty,
      experience: c.experience,
      location: c.location,
      priceRange: c.priceRange,
      rating: c.rating,
      reviewsCount: c.reviewsCount
    });
  };

  const handleDeleteContractor = async (id: string) => {
    if (!activeSite) return;
    if (!confirm('Are you sure you want to remove this contractor from your directory?')) return;
    
    await onUpdateSite({
      ...activeSite,
      contractors: activeSite.contractors.filter(c => c.id !== id)
    });
  };

  // Manage Project Lead CRUD
  const handleUpdateLeadStatus = async (id: string, status: 'pending' | 'accepted' | 'completed') => {
    if (!activeSite) return;
    const updatedRequests = activeSite.projectRequests.map(req => {
      if (req.id === id) {
        return { ...req, status };
      }
      return req;
    });

    await onUpdateSite({
      ...activeSite,
      projectRequests: updatedRequests
    });
  };

  const handleDeleteLead = async (id: string) => {
    if (!activeSite) return;
    if (!confirm('Are you sure you want to archive/delete this lead submission?')) return;

    await onUpdateSite({
      ...activeSite,
      projectRequests: activeSite.projectRequests.filter(req => req.id !== id)
    });
  };

  // Backup file export
  const triggerExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wordpress_smartbuild_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup file import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            await onRestoreBackup(parsed);
            alert(`Backup successfully restored! Imported ${parsed.length} sites.`);
          } else {
            alert('Invalid backup file. Must be a valid JSON list of sites.');
          }
        } catch (err) {
          alert('Failed to parse file. Ensure it is a valid JSON backup exported from this app.');
        }
      };
    }
  };

  // Total Counters
  const stats = React.useMemo(() => {
    let contractorsCount = 0;
    let leadsCount = 0;
    sites.forEach(s => {
      contractorsCount += s.contractors.length;
      leadsCount += s.projectRequests.length;
    });
    return {
      sites: sites.length,
      contractors: contractorsCount,
      leads: leadsCount
    };
  }, [sites]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[650px] bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-md">
      
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-950 flex-shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-2 bg-slate-950">
            <div className="p-1 bg-emerald-500 rounded text-slate-950">
              <Globe className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white font-display">SmartBuild WP</h2>
              <p className="text-[10px] text-slate-400 font-medium">Hosting & CMS Dashboard</p>
            </div>
          </div>

          {/* Active Site Selector */}
          <div className="p-4 border-b border-slate-800">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Selected Directory</label>
            <select
              value={activeSite?.id || ''}
              onChange={(e) => {
                const found = sites.find(s => s.id === e.target.value);
                if (found) onSelectSite(found);
              }}
              className="w-full bg-slate-850 text-slate-100 text-xs rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.title} (/{s.slug})</option>
              ))}
            </select>
          </div>

          {/* Sidebar Menu Links */}
          <nav className="p-3 space-y-1">
            <button
              id="admin-menu-sites"
              onClick={() => setActiveTab('sites')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'sites' ? 'bg-slate-850 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
            >
              <Layers className="w-4 h-4" />
              <span>All Websites</span>
              <span className="ml-auto bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300">{stats.sites}</span>
            </button>

            <button
              id="admin-menu-customizer"
              disabled={!activeSite}
              onClick={() => setActiveTab('customizer')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${!activeSite ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'customizer' ? 'bg-slate-850 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
              <span>WP Site Customizer</span>
            </button>

            <button
              id="admin-menu-contractors"
              disabled={!activeSite}
              onClick={() => setActiveTab('contractors')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${!activeSite ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'contractors' ? 'bg-slate-850 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>Contractors List</span>
              {activeSite && (
                <span className="ml-auto bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300">{activeSite.contractors.length}</span>
              )}
            </button>

            <button
              id="admin-menu-leads"
              disabled={!activeSite}
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${!activeSite ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'leads' ? 'bg-slate-850 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
            >
              <Mail className="w-4 h-4" />
              <span>Visitor Leads / Inbox</span>
              {activeSite && (
                <span className="ml-auto bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{activeSite.projectRequests.length}</span>
              )}
            </button>

            <button
              id="admin-menu-backup"
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'backup' ? 'bg-slate-850 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
            >
              <Database className="w-4 h-4" />
              <span>WP Backups & Migration</span>
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 bg-slate-950 font-mono flex flex-col space-y-1.5">
          <p>SERVER STATUS: ONLINE</p>
          <p>URL: /{activeSite?.slug || ''}</p>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        
        {/* Statistics Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Sites</span>
              <h3 className="text-xl font-bold font-mono text-slate-800">{stats.sites}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Engineers</span>
              <h3 className="text-xl font-bold font-mono text-slate-800">{stats.contractors}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Leads Inbox</span>
              <h3 className="text-xl font-bold font-mono text-slate-800">{stats.leads}</h3>
            </div>
          </div>
        </div>

        {/* Tab 1: All Websites */}
        {activeTab === 'sites' && (
          <div className="space-y-6">
            
            {/* Create Site Form Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-850 font-display text-sm">Create WordPress-hosted Directory Site</h3>
              </div>

              <form onSubmit={handleCreateSite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Site Title</label>
                    <input 
                      id="input-new-title"
                      type="text"
                      required
                      placeholder="e.g. SmartBuild Cambodia"
                      value={newSiteTitle}
                      onChange={(e) => {
                        setNewSiteTitle(e.target.value);
                        // Auto-generate slug from title
                        const clean = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9 ]/g, '')
                          .replace(/\s+/g, '-');
                        setNewSiteSlug(clean);
                      }}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Site Slug (URL handle)</label>
                    <div className="flex items-center">
                      <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg p-2 text-[10px] text-slate-500 font-mono">/site/</span>
                      <input 
                        id="input-new-slug"
                        type="text"
                        required
                        placeholder="smartbuild-cambodia"
                        value={newSiteSlug}
                        onChange={(e) => setNewSiteSlug(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-r-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tagline (Banner Slogan)</label>
                    <input 
                      id="input-new-tagline"
                      type="text"
                      placeholder="e.g. What needs building today?"
                      value={newSiteTagline}
                      onChange={(e) => setNewSiteTagline(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {siteCreateError && (
                  <p className="text-xs text-rose-600 font-semibold">{siteCreateError}</p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    id="submit-create-site"
                    type="submit"
                    disabled={isCreating}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition disabled:opacity-55"
                  >
                    {isCreating ? "Hosting site..." : "Provision & Host Site"}
                  </button>
                </div>
              </form>
            </div>

            {/* Sites Grid List */}
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Live Hosted Sites Directory</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sites.map(s => {
                  const isActive = activeSite?.id === s.id;
                  return (
                    <div 
                      key={s.id}
                      className={`bg-white rounded-xl border p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between ${isActive ? 'border-emerald-500 ring-1 ring-emerald-500/10' : 'border-slate-100'}`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-150">WordPress Live</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{s.title}</h4>
                            <p className="text-xs text-slate-400 font-mono">/site/{s.slug}</p>
                          </div>
                          
                          {/* Trash button */}
                          {sites.length > 1 && (
                            <button
                              onClick={() => onDeleteSite(s.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition"
                              title="Delete Hosted Site"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 italic mt-3">"{s.tagline}"</p>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                          <div>Contractors: <strong className="font-mono">{s.contractors.length}</strong></div>
                          <div>Customer Leads: <strong className="font-mono">{s.projectRequests.length}</strong></div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50 flex space-x-2">
                        <button
                          onClick={() => onSelectSite(s)}
                          className={`flex-1 text-xs py-2 rounded-lg font-bold transition text-center ${isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                        >
                          {isActive ? 'Currently Managing' : 'Manage Site'}
                        </button>
                        <a 
                          href={`/site/${s.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-2.5 py-2 rounded-lg flex items-center justify-center transition"
                          title="Open Hosted Site in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Site Customizer */}
        {activeTab === 'customizer' && activeSite && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-bold text-slate-900 font-display text-sm">Theme Settings & Site Customizer</h3>
                <p className="text-xs text-slate-400">Configure visual themes, slogans, banners, and categories.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Display Title</label>
                  <input 
                    id="custom-title-input"
                    type="text"
                    value={customizerTitle}
                    onChange={(e) => setCustomizerTitle(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Display Slogan / Tagline</label>
                  <input 
                    id="custom-tagline-input"
                    type="text"
                    value={customizerTagline}
                    onChange={(e) => setCustomizerTagline(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Accent Brand Color Theme</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['teal', 'emerald', 'blue', 'indigo', 'amber', 'rose'].map((col) => {
                      const colorMap: any = {
                        teal: 'bg-teal-500',
                        emerald: 'bg-emerald-500',
                        blue: 'bg-blue-500',
                        indigo: 'bg-indigo-500',
                        amber: 'bg-amber-500',
                        rose: 'bg-rose-500'
                      };
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setCustomizerAccent(col as any)}
                          className={`h-9 rounded-lg flex items-center justify-center border-2 transition ${colorMap[col]} ${customizerAccent === col ? 'border-slate-950 scale-105 shadow-xs' : 'border-transparent'}`}
                          title={col}
                        >
                          {customizerAccent === col && <Check className="w-4 h-4 text-white font-bold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom CSS Banner Background Gradient</label>
                  <input 
                    type="text"
                    value={customizerGradient}
                    onChange={(e) => setCustomizerGradient(e.target.value)}
                    placeholder="from-emerald-950 via-teal-900 to-emerald-950"
                    className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Right Column: Theme Presets & Category manager */}
              <div className="space-y-4">
                
                {/* WordPress Theme Presets */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">WordPress Theme Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => applyPresetTheme(theme.id)}
                        className="bg-white border border-slate-150 p-2 rounded-lg text-left hover:border-slate-300 transition"
                      >
                        <h4 className="text-[11px] font-bold text-slate-800">{theme.name}</h4>
                        <p className="text-[9px] text-slate-400 leading-normal line-clamp-1">{theme.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Manager */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Directory Filter Categories</label>
                  <div className="flex space-x-2 mb-2">
                    <input 
                      type="text"
                      placeholder="Add custom category..."
                      value={customizerCategory}
                      onChange={(e) => setCustomizerCategory(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg max-h-32 overflow-y-auto">
                    {customizerCategories.map((cat, i) => (
                      <span key={i} className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 px-2 py-1 rounded-md flex items-center space-x-1">
                        <span>{cat}</span>
                        <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {customizerCategories.length === 0 && (
                      <span className="text-[10px] text-slate-400 p-1">No custom categories. Default categories will be used.</span>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                id="save-customizer-btn"
                type="button"
                onClick={handleSaveCustomizer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save WordPress Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Contractors Directory Manager */}
        {activeTab === 'contractors' && activeSite && (
          <div className="space-y-6">
            
            {/* List and Create Button Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm font-display">Manage Contractor Listings</h3>
              <button
                id="toggle-add-contractor"
                onClick={() => {
                  setIsAddingContractor(!isAddingContractor);
                  if (editingContractorId) {
                    setEditingContractorId(null);
                    setContractorForm({
                      name: '',
                      specialty: activeSite.categories[0] || 'House Construction',
                      experience: 5,
                      location: '',
                      priceRange: '$$',
                      rating: 4.8,
                      reviewsCount: 15
                    });
                  }
                }}
                className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
              >
                {isAddingContractor ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isAddingContractor ? 'Cancel Form' : 'Register Contractor'}</span>
              </button>
            </div>

            {/* Form Toggle card */}
            {isAddingContractor && (
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                  {editingContractorId ? 'Edit Contractor Profile' : 'Register New Professional'}
                </h4>

                <form onSubmit={handleContractorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Contractor / Business Name</label>
                      <input 
                        id="contractor-name-input"
                        type="text"
                        required
                        placeholder="e.g. Chan Dara Plumbers"
                        value={contractorForm.name}
                        onChange={(e) => setContractorForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Specialty Category</label>
                      <select 
                        value={contractorForm.specialty}
                        onChange={(e) => setContractorForm(prev => ({ ...prev, specialty: e.target.value }))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {activeSite.categories.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                        <option value="Civil Engineer">Civil Engineer</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Architect">Architect</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Years of Experience</label>
                      <input 
                        type="number"
                        min={1}
                        max={50}
                        required
                        value={contractorForm.experience}
                        onChange={(e) => setContractorForm(prev => ({ ...prev, experience: Number(e.target.value) }))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Service Location Cover</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Toul Kork, Phnom Penh"
                        value={contractorForm.location}
                        onChange={(e) => setContractorForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Pricing Tier</label>
                      <select 
                        value={contractorForm.priceRange}
                        onChange={(e) => setContractorForm(prev => ({ ...prev, priceRange: e.target.value }))}
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="$">$ (Budget friendly)</option>
                        <option value="$$">$$ (Standard)</option>
                        <option value="$$$">$$$ (Premium / Luxury)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Rating (Out of 5.0)</label>
                        <input 
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={contractorForm.rating}
                          onChange={(e) => setContractorForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Reviews Count</label>
                        <input 
                          type="number"
                          value={contractorForm.reviewsCount}
                          onChange={(e) => setContractorForm(prev => ({ ...prev, reviewsCount: Number(e.target.value) }))}
                          className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      id="save-contractor-btn"
                      type="submit"
                      className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      {editingContractorId ? 'Apply Profile Updates' : 'Publish to Directory'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contractors Table List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
              {activeSite.contractors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Specialty</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Price Tier</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {activeSite.contractors.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800">{c.name}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-semibold text-slate-600">{c.specialty}</span>
                          </td>
                          <td className="p-4 text-slate-500">{c.location}</td>
                          <td className="p-4 font-mono font-semibold">★ {c.rating.toFixed(1)} ({c.reviewsCount})</td>
                          <td className="p-4 font-bold text-emerald-600">{c.priceRange}</td>
                          <td className="p-4 flex justify-center space-x-1.5">
                            <button
                              onClick={() => handleEditContractorClick(c)}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-150 rounded-lg text-slate-500 hover:text-slate-900 transition"
                              title="Edit Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteContractor(c.id)}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-150 rounded-lg text-slate-500 hover:text-rose-600 transition"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>No contractors registered on this site yet.</p>
                  <button 
                    onClick={() => setIsAddingContractor(true)} 
                    className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Click to add your first contractor
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Leads Inbox */}
        {activeTab === 'leads' && activeSite && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 font-display text-sm">Customer Leads Inbox</h3>
                <p className="text-xs text-slate-400">Review submissions from the "Request a Project" public form.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {activeSite.projectRequests.length} submissions
              </span>
            </div>

            {activeSite.projectRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSite.projectRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge and Status Toggle */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateLeadStatus(req.id, 'pending')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleUpdateLeadStatus(req.id, 'accepted')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${req.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateLeadStatus(req.id, 'completed')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                          >
                            Complete
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-1">{req.title}</h4>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{req.description}</p>

                      {/* Info Metadata */}
                      <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 space-y-1 font-medium mb-3">
                        <div>📍 Location: <span className="text-slate-800">{req.location}</span></div>
                        <div>💰 Budget: <span className="text-slate-800">{req.budgetRange}</span></div>
                        <div>⏱ Timeline: <span className="text-slate-800">{req.timeline}</span></div>
                      </div>

                      {/* Lead Attachments */}
                      {req.images && req.images.length > 0 && (
                        <div className="mb-3">
                          <span className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Attached Images</span>
                          <div className="flex space-x-1.5 overflow-x-auto pb-1">
                            {req.images.map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="Lead reference" 
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-cover rounded-lg border border-slate-100 shadow-2xs"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex justify-end">
                      <button
                        onClick={() => handleDeleteLead(req.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Archive Lead</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-xl py-12 text-center text-slate-400 text-xs">
                <p>No project submissions received from clients yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Submit a "Request a Project" form in the Mobile preview to see it populate here instantly!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Backups & Migration */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <Database className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-bold text-slate-900 font-display text-sm">WordPress Backup & Site Migration Engine</h3>
                <p className="text-xs text-slate-400">Move your databases, pages, themes, and client list assets instantly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Export */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Export Sites Package</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Downloads an XML-equivalent WordPress JSON backup containing all configuration, themes, contractor registries, and active visitor project leads. You can restore this backup on any device at any time.
                  </p>
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={triggerExportBackup}
                    className="w-full bg-slate-950 text-white hover:bg-slate-850 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download WordPress Backup</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Import */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Restore Backup / Import Sites</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Upload or replace your active database using a previously exported backup file. Note: This will overwrite your current workspace directories.
                  </p>
                </div>

                <div className="pt-4">
                  <label className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs">
                    <UploadCloud className="w-4 h-4 text-emerald-500" />
                    <span>Upload WordPress Backup</span>
                    <input 
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Hosting Details */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-150">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">WordPress Hosting Details & Sharing Instructions</span>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Any site you create gets hosted under its respective URL handle, e.g. <code className="bg-white border border-slate-150 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">/site/{"{slug}"}</code>.
                </p>
                <p>
                  Because this application runs behind Google Cloud Run containers, **these hosted directories are fully public and accessible on any smartphone, desktop, or tablet in the world** using your Development or Shared App URL!
                </p>
                <p>
                  To test "Open Anywhere": Simply open <code className="bg-white border border-slate-150 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">https://{"{your-app-url}"}/site/smartbuild</code> on your phone! Submit a project request, and watch it populate on your laptop dashboard in real-time!
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
