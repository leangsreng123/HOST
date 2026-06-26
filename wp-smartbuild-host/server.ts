import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Default initial sites to populate the store if empty
const INITIAL_SITES = [
  {
    id: 'site-1',
    slug: 'smartbuild',
    title: 'SmartBuild',
    tagline: 'Find help for your build',
    accentColor: 'teal',
    bannerGradient: 'from-emerald-950 via-teal-900 to-emerald-950',
    categories: [
      'House Construction',
      'Home Renovation',
      'Interior Design',
      'Electrical',
      'Plumbing',
      'Architecture'
    ],
    contractors: [
      {
        id: 'c-1',
        name: 'Sok Pisey',
        specialty: 'Civil Engineer',
        experience: 9,
        rating: 4.8,
        reviewsCount: 142,
        location: 'Toul Kork',
        priceRange: '$$$',
        avatarLetters: 'SP',
        avatarColor: 'bg-blue-600 text-white'
      },
      {
        id: 'c-2',
        name: 'Chan Dara',
        specialty: 'Electrician',
        experience: 5,
        rating: 4.6,
        reviewsCount: 88,
        location: 'Sen Sok',
        priceRange: '$$',
        avatarLetters: 'CD',
        avatarColor: 'bg-teal-600 text-white'
      },
      {
        id: 'c-3',
        name: 'Keo Sophea',
        specialty: 'Interior Designer',
        experience: 7,
        rating: 4.9,
        reviewsCount: 112,
        location: 'Boeung Keng Kang 1',
        priceRange: '$$$',
        avatarLetters: 'KS',
        avatarColor: 'bg-purple-600 text-white'
      },
      {
        id: 'c-4',
        name: 'Oum Vandy',
        specialty: 'Plumber',
        experience: 4,
        rating: 4.5,
        reviewsCount: 64,
        location: 'Chroy Changvar',
        priceRange: '$',
        avatarLetters: 'OV',
        avatarColor: 'bg-orange-600 text-white'
      },
      {
        id: 'c-5',
        name: 'Mean Samnang',
        specialty: 'Architect',
        experience: 12,
        rating: 4.9,
        reviewsCount: 195,
        location: 'Daun Penh',
        priceRange: '$$$',
        avatarLetters: 'MS',
        avatarColor: 'bg-emerald-600 text-white'
      }
    ],
    projectRequests: [
      {
        id: 'r-1',
        title: 'Kitchen Renovation',
        description: 'Need a full redesign of our ground floor kitchen, including modern cabinets, tiling, and upgraded electrical sockets.',
        location: 'Toul Kork, Phnom Penh',
        budgetRange: '$1,500 - $3,000',
        timeline: '3 weeks',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'],
        createdAt: '2026-06-25T14:30:00Z',
        status: 'pending'
      },
      {
        id: 'r-2',
        title: 'Complete Villa Wiring',
        description: 'New construction villa requires full conduit installation, distribution board setup, and socket wiring.',
        location: 'Sen Sok, Phnom Penh',
        budgetRange: '$2,000 - $4,500',
        timeline: '4 weeks',
        images: [],
        createdAt: '2026-06-26T02:15:00Z',
        status: 'pending'
      }
    ]
  }
];

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sites.json");

// Helper function to ensure data directory and file exist
function getSites(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SITES, null, 2), "utf-8");
      return INITIAL_SITES;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading sites file, using initial data:", error);
    return INITIAL_SITES;
  }
}

function saveSites(sites: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(sites, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing sites file:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Get all hosted sites
  app.get("/api/sites", (req, res) => {
    res.json(getSites());
  });

  // API Route: Get single hosted site by slug
  app.get("/api/sites/:slug", (req, res) => {
    const sites = getSites();
    const site = sites.find(s => s.slug === req.params.slug);
    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json(site);
  });

  // API Route: Create a new site
  app.post("/api/sites", (req, res) => {
    const sites = getSites();
    const newSite = req.body;

    if (!newSite.slug || !newSite.title) {
      return res.status(400).json({ error: "Slug and title are required" });
    }

    if (sites.some(s => s.slug === newSite.slug)) {
      return res.status(400).json({ error: "Site with this slug already exists" });
    }

    const createdSite = {
      id: `site-${Date.now()}`,
      slug: newSite.slug.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
      title: newSite.title,
      tagline: newSite.tagline || "My Premium Directory",
      accentColor: newSite.accentColor || "teal",
      bannerGradient: newSite.bannerGradient || "from-emerald-950 via-teal-900 to-emerald-950",
      categories: newSite.categories || [
        'House Construction',
        'Home Renovation',
        'Interior Design',
        'Electrical',
        'Plumbing',
        'Architecture'
      ],
      contractors: newSite.contractors || [],
      projectRequests: newSite.projectRequests || []
    };

    sites.push(createdSite);
    saveSites(sites);
    res.status(201).json(createdSite);
  });

  // API Route: Update an existing site
  app.put("/api/sites/:id", (req, res) => {
    const sites = getSites();
    const index = sites.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Site not found" });
    }

    const updatedSite = {
      ...sites[index],
      ...req.body,
      // Ensure ID and slug can't be mutated dangerously
      id: sites[index].id,
      slug: req.body.slug ? req.body.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '') : sites[index].slug
    };

    sites[index] = updatedSite;
    saveSites(sites);
    res.json(updatedSite);
  });

  // API Route: Delete an existing site
  app.delete("/api/sites/:id", (req, res) => {
    let sites = getSites();
    const initialLength = sites.length;
    sites = sites.filter(s => s.id !== req.params.id);

    if (sites.length === initialLength) {
      return res.status(404).json({ error: "Site not found" });
    }

    saveSites(sites);
    res.json({ success: true, message: "Site deleted successfully" });
  });

  // API Route: Submit project request on a hosted site
  app.post("/api/sites/:slug/requests", (req, res) => {
    const sites = getSites();
    const siteIndex = sites.findIndex(s => s.slug === req.params.slug);

    if (siteIndex === -1) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { title, description, location, budgetRange, timeline, images } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: "Title, description, and location are required" });
    }

    const newRequest = {
      id: `r-${Date.now()}`,
      title,
      description,
      location,
      budgetRange: budgetRange || "$500 - $1,000",
      timeline: timeline || "2 weeks",
      images: images || [],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    sites[siteIndex].projectRequests.unshift(newRequest);
    saveSites(sites);
    res.status(201).json(newRequest);
  });

  // API Route: Join site's directory as a contractor
  app.post("/api/sites/:slug/contractors", (req, res) => {
    const sites = getSites();
    const siteIndex = sites.findIndex(s => s.slug === req.params.slug);

    if (siteIndex === -1) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { name, specialty, experience, location, priceRange, avatarLetters, avatarColor } = req.body;

    if (!name || !specialty || !location) {
      return res.status(400).json({ error: "Name, specialty, and location are required" });
    }

    const newContractor = {
      id: `c-${Date.now()}`,
      name,
      specialty,
      experience: Number(experience) || 1,
      rating: 5.0,
      reviewsCount: 1,
      location,
      priceRange: priceRange || "$$",
      avatarLetters: avatarLetters || name.substring(0, 2).toUpperCase(),
      avatarColor: avatarColor || "bg-teal-600 text-white"
    };

    sites[siteIndex].contractors.push(newContractor);
    saveSites(sites);
    res.status(201).json(newContractor);
  });

  // API Route: Overwrite all sites (Restore / Import)
  app.post("/api/sites/restore", (req, res) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Invalid backup file. Must be a JSON array of sites." });
    }
    saveSites(req.body);
    res.json({ success: true, count: req.body.length });
  });

  // Serve Vite development assets or built production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WordPress SmartBuild Host server running on http://localhost:${PORT}`);
  });
}

startServer();
