import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  Plus, 
  Star, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Upload, 
  Check, 
  X, 
  Eye, 
  User, 
  Home, 
  Wrench, 
  Sparkles, 
  Zap, 
  Droplet, 
  PenTool,
  Send,
  MessageSquare,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Site, Contractor, ProjectRequest } from '../types';

interface HostedSiteViewProps {
  site: Site;
  onSubmitRequest: (request: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onJoinDirectory: (contractor: Omit<Contractor, 'id' | 'rating' | 'reviewsCount'>) => Promise<void>;
  isPreview?: boolean;
}

export default function HostedSiteView({ site, onSubmitRequest, onJoinDirectory, isPreview = false }: HostedSiteViewProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'contractor'>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Show "Request Project" Form overlay
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    location: '',
    budgetRange: '$500 - $1,000',
    timeline: '2 weeks',
    images: [] as string[]
  });

  // Show "Join Directory" Form
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newContractor, setNewContractor] = useState({
    name: '',
    specialty: 'House Construction',
    experience: 5,
    location: '',
    priceRange: '$$',
    avatarLetters: '',
    avatarColor: 'bg-teal-600 text-white'
  });

  // State for success notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map categories to modern Lucide icons
  const getCategoryIcon = (catName: string) => {
    const name = catName.toLowerCase();
    if (name.includes('house') || name.includes('construct')) return <Home className="w-5 h-5 text-emerald-600" />;
    if (name.includes('renovat') || name.includes('repair')) return <Wrench className="w-5 h-5 text-amber-600" />;
    if (name.includes('interior') || name.includes('design')) return <Sparkles className="w-5 h-5 text-purple-600" />;
    if (name.includes('elect')) return <Zap className="w-5 h-5 text-blue-600" />;
    if (name.includes('plumb')) return <Droplet className="w-5 h-5 text-cyan-600" />;
    if (name.includes('architect')) return <PenTool className="w-5 h-5 text-indigo-600" />;
    return <Briefcase className="w-5 h-5 text-slate-600" />;
  };

  // Color mapping based on site configuration
  const colorClasses = useMemo(() => {
    const colors = {
      teal: {
        bg: 'bg-teal-600',
        bgHover: 'hover:bg-teal-700',
        text: 'text-teal-600',
        border: 'border-teal-600',
        ring: 'focus:ring-teal-500',
        btnBg: 'bg-teal-700',
        tabActive: 'bg-teal-600 text-white',
        badge: 'bg-teal-50 text-teal-700 border-teal-200'
      },
      emerald: {
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        border: 'border-emerald-600',
        ring: 'focus:ring-emerald-500',
        btnBg: 'bg-emerald-700',
        tabActive: 'bg-emerald-600 text-white',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      blue: {
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        border: 'border-blue-600',
        ring: 'focus:ring-blue-500',
        btnBg: 'bg-blue-700',
        tabActive: 'bg-blue-600 text-white',
        badge: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      indigo: {
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        text: 'text-indigo-600',
        border: 'border-indigo-600',
        ring: 'focus:ring-indigo-500',
        btnBg: 'bg-indigo-700',
        tabActive: 'bg-indigo-600 text-white',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      },
      amber: {
        bg: 'bg-amber-600',
        bgHover: 'hover:bg-amber-700',
        text: 'text-amber-600',
        border: 'border-amber-600',
        ring: 'focus:ring-amber-500',
        btnBg: 'bg-amber-700',
        tabActive: 'bg-amber-600 text-white',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      rose: {
        bg: 'bg-rose-600',
        bgHover: 'hover:bg-rose-700',
        text: 'text-rose-600',
        border: 'border-rose-600',
        ring: 'focus:ring-rose-500',
        btnBg: 'bg-rose-700',
        tabActive: 'bg-rose-600 text-white',
        badge: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    };
    return colors[site.accentColor] || colors.teal;
  }, [site.accentColor]);

  // Handle Mock Image Upload
  const handleImageMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Create object URLs for mock previews
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setNewRequest(prev => ({
              ...prev,
              images: [...prev.images, reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  // Submit Project Request Handler
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.description || !newRequest.location) return;

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        title: newRequest.title,
        description: newRequest.description,
        location: newRequest.location,
        budgetRange: newRequest.budgetRange,
        timeline: newRequest.timeline,
        images: newRequest.images
      });

      setSuccessMsg("Project Request Submitted Successfully! Directors/Contractors have been notified.");
      setNewRequest({
        title: '',
        description: '',
        location: '',
        budgetRange: '$500 - $1,000',
        timeline: '2 weeks',
        images: []
      });
      setTimeout(() => {
        setShowRequestForm(false);
        setSuccessMsg(null);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Contractor Registration Handler
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractor.name || !newContractor.location) return;

    setIsSubmitting(true);
    try {
      // Pick random elegant BG color for contractor avatar
      const colors = [
        'bg-teal-600 text-white',
        'bg-blue-600 text-white',
        'bg-purple-600 text-white',
        'bg-indigo-600 text-white',
        'bg-orange-600 text-white',
        'bg-emerald-600 text-white',
        'bg-rose-600 text-white'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      await onJoinDirectory({
        name: newContractor.name,
        specialty: newContractor.specialty,
        experience: Number(newContractor.experience) || 3,
        location: newContractor.location,
        priceRange: newContractor.priceRange,
        avatarLetters: newContractor.name.substring(0, 2).toUpperCase(),
        avatarColor: randomColor
      });

      setSuccessMsg("Welcome aboard! You have been added to the contractor directory.");
      setNewContractor({
        name: '',
        specialty: site.categories[0] || 'House Construction',
        experience: 5,
        location: '',
        priceRange: '$$',
        avatarLetters: '',
        avatarColor: 'bg-teal-600 text-white'
      });
      setTimeout(() => {
        setShowJoinForm(false);
        setSuccessMsg(null);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search contractors
  const filteredContractors = useMemo(() => {
    return site.contractors.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = 
        !selectedCategory || 
        c.specialty.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory.toLowerCase().includes('house') && c.specialty.toLowerCase().includes('engineer')) ||
        (selectedCategory.toLowerCase().includes('architect') && c.specialty.toLowerCase().includes('architect'));

      return matchesSearch && matchesCategory;
    });
  }, [site.contractors, searchQuery, selectedCategory]);

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-800 font-sans flex flex-col relative select-none">
      
      {/* 1. Header (Navbar) */}
      <header id="hosted-header" className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${colorClasses.bg} text-white`}>
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-md">{site.title}</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Hosted on SmartBuildWP</span>
          </div>
        </div>

        {/* Custom Segmented Tabs from Screenshot */}
        <div className="flex bg-slate-100 p-0.5 rounded-full text-xs font-semibold">
          <button 
            id="tab-customer"
            onClick={() => { setActiveTab('customer'); setSelectedCategory(null); }}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${activeTab === 'customer' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Customer
          </button>
          <button 
            id="tab-contractor"
            onClick={() => { setActiveTab('contractor'); setSelectedCategory(null); }}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${activeTab === 'contractor' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Contractor
          </button>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="flex-1 overflow-y-auto pb-24">
        
        {/* Active View: Customer Tab */}
        {activeTab === 'customer' && (
          <div>
            {/* Banner Section matching design */}
            <div className={`bg-gradient-to-br ${site.bannerGradient} text-white px-5 py-8 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
              <p className="text-xs font-semibold tracking-widest text-emerald-300 uppercase mb-1">SmartBuild Platform</p>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight mb-2">{site.tagline}</h2>
              
              {/* Dynamic Search Box */}
              <div className="max-w-md mx-auto mt-5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  id="search-input"
                  type="text"
                  placeholder="Search engineers, builders, electricians..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 rounded-lg text-sm border-none shadow-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content Container */}
            <div className="px-4 py-6">
              
              {/* Categories Grid (From Image 1) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">Categories</h3>
                  {selectedCategory && (
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {site.categories.map((cat, idx) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        id={`cat-card-${idx}`}
                        key={idx}
                        onClick={() => setSelectedCategory(isSelected ? null : cat)}
                        className={`p-3 bg-white border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 shadow-2xs hover:shadow-sm ${
                          isSelected 
                            ? `border-slate-800 ring-2 ring-slate-800/10 bg-slate-50` 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="p-2 bg-slate-50 rounded-lg mb-2">
                          {getCategoryIcon(cat)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-2">
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contractors List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                    {selectedCategory ? `${selectedCategory} near you` : 'Top rated near you'}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {filteredContractors.length} found
                  </span>
                </div>

                {filteredContractors.length > 0 ? (
                  <div className="space-y-3">
                    {filteredContractors.map((c) => (
                      <div 
                        key={c.id} 
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-start space-x-3 hover:border-slate-200 transition-all"
                      >
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${c.avatarColor}`}>
                          {c.avatarLetters}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{c.name}</h4>
                            <span className="text-xs font-bold text-slate-400">{c.priceRange}</span>
                          </div>
                          
                          <p className="text-xs text-slate-500 font-medium mb-1.5">{c.specialty} • {c.experience} yrs exp</p>
                          
                          {/* Rating and Location Footer */}
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                            <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-500 stroke-amber-500 mr-0.5" />
                              <span>{c.rating.toFixed(1)}</span>
                              <span className="text-slate-400 font-normal ml-0.5">({c.reviewsCount})</span>
                            </div>
                            <div className="flex items-center text-slate-400">
                              <MapPin className="w-3 h-3 mr-0.5 text-slate-300" />
                              <span className="truncate">{c.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white border border-slate-100 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No contractors found matching your selection.</p>
                    <button 
                      onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                      className="mt-2 text-xs text-emerald-600 font-semibold"
                    >
                      Clear search filters
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Active View: Contractor Tab */}
        {activeTab === 'contractor' && (
          <div className="p-4 space-y-4">
            
            {/* Call To Action banner */}
            <div className={`p-4 rounded-xl text-white ${colorClasses.bg} shadow-sm relative overflow-hidden`}>
              <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 opacity-15">
                <Briefcase className="w-32 h-32 rotate-12" />
              </div>
              <h3 className="font-bold font-display text-sm mb-1">Looking for Construction Leads?</h3>
              <p className="text-[11px] text-white/90 leading-normal mb-3">
                Review local projects submitted by customers and register your business to get found by clients.
              </p>
              <button 
                id="join-directory-btn"
                onClick={() => setShowJoinForm(true)}
                className="bg-white text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 transition"
              >
                Join Contractor Directory
              </button>
            </div>

            {/* List of active customer project leads */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-1.5 text-slate-500" />
                Active Project Requests ({site.projectRequests.length})
              </h3>

              {site.projectRequests.length > 0 ? (
                <div className="space-y-4">
                  {site.projectRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs hover:border-slate-200 transition"
                    >
                      {/* Lead Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mr-2">
                            {req.status}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{req.title}</h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                        {req.description}
                      </p>

                      {/* Details pills */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mb-3">
                        <div className="flex items-center min-w-0">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{req.location}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <DollarSign className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{req.budgetRange}</span>
                        </div>
                        <div className="flex items-center min-w-0 col-span-2">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Timeline: {req.timeline}</span>
                        </div>
                      </div>

                      {/* Display attachment if any */}
                      {req.images && req.images.length > 0 && (
                        <div className="mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attached Images</p>
                          <div className="flex space-x-2 overflow-x-auto pb-1">
                            {req.images.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt={`Attachment ${i}`} 
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Apply / Bid Button */}
                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={() => alert(`Connect details: To contact this client for "${req.title}", please contact the SmartBuild admin or upgrade your CMS package.`)}
                          className="bg-slate-100 text-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-slate-200 transition"
                        >
                          Bid on Project
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-slate-100 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No projects submitted yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Switch to Customer view to post a new project!</p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 3. Floating Action Button ("+ New Project" - Image 1) */}
      {activeTab === 'customer' && !showRequestForm && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            id="add-project-fab"
            onClick={() => setShowRequestForm(true)}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Project</span>
          </button>
        </div>
      )}

      {/* 4. "Request a Project" Screen Form (Image 2 Overlay) */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col md:items-center justify-end md:justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Form Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <button 
                id="close-request-form"
                onClick={() => setShowRequestForm(false)}
                className="p-1 text-slate-500 hover:text-slate-800 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-slate-900 text-sm">Request a Project</h3>
              <div className="w-6" /> {/* spacer */}
            </div>

            {/* Form Body */}
            <form onSubmit={handleRequestSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {successMsg ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-md">Request Submitted!</h4>
                  <p className="text-xs text-slate-500 max-w-xs">{successMsg}</p>
                </div>
              ) : (
                <>
                  {/* Field: Project Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Title</label>
                    <input 
                      id="form-title"
                      type="text"
                      required
                      placeholder="e.g. Kitchen renovation"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Field: Project Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Description</label>
                    <textarea 
                      id="form-desc"
                      required
                      rows={3}
                      placeholder="Describe what you need done..."
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Field: Construction Location */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Construction Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <input 
                        id="form-location"
                        type="text"
                        required
                        placeholder="Enter address or area"
                        value={newRequest.location}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-8 border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Row: Budget & Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Budget Range</label>
                      <input 
                        id="form-budget"
                        type="text"
                        required
                        placeholder="$500 - $1,000"
                        value={newRequest.budgetRange}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, budgetRange: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Timeline</label>
                      <input 
                        id="form-timeline"
                        type="text"
                        required
                        placeholder="2 weeks"
                        value={newRequest.timeline}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, timeline: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Mock Image Upload */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Upload Images</label>
                    <div className="grid grid-cols-4 gap-2">
                      
                      {/* Image Thumbnails */}
                      {newRequest.images.map((img, i) => (
                        <div key={i} className="relative aspect-square border rounded-lg overflow-hidden group">
                          <img src={img} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => setNewRequest(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Upload Slot */}
                      {newRequest.images.length < 3 && (
                        <label className="aspect-square border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition bg-slate-50">
                          <Upload className="w-4 h-4 text-slate-400 mb-1" />
                          <span className="text-[9px] text-slate-400 text-center">Add Photo</span>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageMock}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Upload up to 3 project reference photos (supports drag & drop / manual selection)</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      id="submit-project-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs transition duration-200 disabled:opacity-55 flex items-center justify-center space-x-1.5"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-white" />
                          <span>Submit Project Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

            </form>
          </div>
        </div>
      )}

      {/* 5. "Join Directory" Form Overlay */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col md:items-center justify-end md:justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <button 
                onClick={() => setShowJoinForm(false)}
                className="p-1 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-slate-900 text-sm font-display">Join as Contractor</h3>
              <div className="w-6" />
            </div>

            {/* Form Body */}
            <form onSubmit={handleJoinSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {successMsg ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-md">Welcome to the Team!</h4>
                  <p className="text-xs text-slate-500 max-w-xs">{successMsg}</p>
                </div>
              ) : (
                <>
                  {/* Field: Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Company / Contractor Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Sok Pisey Construction"
                      value={newContractor.name}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  {/* Field: Specialty Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Specialty</label>
                    <select 
                      value={newContractor.specialty}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, specialty: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
                    >
                      {site.categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                      <option value="Civil Engineer">Civil Engineer</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Architect">Architect</option>
                    </select>
                  </div>

                  {/* Grid: Exp & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Years of Experience</label>
                      <input 
                        type="number"
                        min={1}
                        max={50}
                        required
                        value={newContractor.experience}
                        onChange={(e) => setNewContractor(prev => ({ ...prev, experience: Number(e.target.value) }))}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Price Level</label>
                      <select 
                        value={newContractor.priceRange}
                        onChange={(e) => setNewContractor(prev => ({ ...prev, priceRange: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
                      >
                        <option value="$">$ (Budget friendly)</option>
                        <option value="$$">$$ (Standard)</option>
                        <option value="$$$">$$$ (Premium / Luxury)</option>
                      </select>
                    </div>
                  </div>

                  {/* Field: Location / Coverage Area */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Coverage Location</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Toul Kork, Phnom Penh"
                      value={newContractor.location}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  {/* Submit Join */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition disabled:opacity-55"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Profile to Directory"}
                    </button>
                  </div>
                </>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
