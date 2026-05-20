import { Project, Service, TimelineEvent, SkillGroup } from './types';

export const USER_INFO = {
  fullName: "Usama Rasheed",
  role: "Environmental Engineer & AI Solutions Expert",
  tagline: "Bridging sustainability with digital innovation through smart technology, modern Web development, and AI solutions.",
  aboutBrief: "I am an Environmental Engineering student at Mehran U.E.T - Jamshoro with a deep-rooted passion for combining physical ecological science with cutting-edge AI and digital solutions. As the founder of Unscripted Studio and a versatile digital professional, I design websites, build AI tools, optimize web systems, and design strategies addressing critical climate, water, and pollution control vectors.",
  email: "usamaenviroengineer@gmail.com",
  phone: "+92-323-1083134",
  location: "Fazalabad Colony Matli, Badin, Sindh - Pakistan",
  socials: {
    github: "https://github.com/unscriptedusama",
    youtube: "https://www.youtube.com/@UnscriptedUsama",
    facebook: "https://www.facebook.com/usama.arain.421745/",
    instagram: "https://www.instagram.com/unscripted.usama?igsh=cDdrbmpxcHdnemRr",
    whatsapp: "https://wa.me/923231083134"
  },
  images: {
    hero: "https://myphotosss.netlify.app/5.png",
    about: "https://myphotosss.netlify.app/1.png",
    contact: "https://myphotosss.netlify.app/3.png",
    creative: "https://myphotosss.netlify.app/2.png",
    brand_4: "https://myphotosss.netlify.app/4.png",
    brand_6: "https://myphotosss.netlify.app/6.png"
  }
};

export const PROJECTS_DATA: Project[] = [
  {
    id: "proj-1",
    title: "AI-Powered Turbidity Predictor & Water Telemetry",
    description: "An interactive telemetry dashboard integrated with machine learning algorithms to predict clean-water turbidity levels, assisting municipal wastewater management.",
    category: "Environmental Projects",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    technologies: ["React", "Python", "TensorFlow", "IoT Sensors", "Tailwind CSS"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Wastewater treatment facilities struggle with slow, manual laboratory assays of secondary settling tank turbidity, preventing real-time chemical dosage regulation.",
      solution: "Developed an IoT sensing rig that streams temperature, pH, and light scattering values to a neural network running locally on Edge, predicting turbidity levels with 98% accuracy.",
      impact: "Reduced chemical coagulant overdrive by 18% during testing and automated raw data logging for compliance auditing."
    }
  },
  {
    id: "proj-2",
    title: "EcoVision: Real-Time Solid Waste Auto-Classifier",
    description: "A computer vision platform trained on customized environmental datasets to categorize recyclable, organic, and hazardous waste materials in high-speed environments.",
    category: "AI Projects",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    technologies: ["PyTorch", "OpenCV", "Roboflow", "FastAPI", "Next.js"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Manual sorting of municipal solid waste is hazardous, slow, and highly prone to cross-contamination of material grades.",
      solution: "Engineered a custom YOLOv8 model trained on 15,000 localized refuse samples to automate sorting on standard conveyor belts.",
      impact: "Achieved a response frame rate of 42 FPS with a sorting accuracy of 94.2%, enabling robotic actuator triggers."
    }
  },
  {
    id: "proj-3",
    title: "Unscripted Studio Enterprise Platform",
    description: "A gorgeous, high-performance website and client booking management system engineered to showcase web development craft and automate digital lead generation.",
    category: "Web Development",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "Framer Motion", "Node.js"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Digital agencies require quick page loads, exceptional design fidelity, and native SEO indexing to captivate high-profile clients.",
      solution: "Built a headless client ecosystem leveraging incremental static regeneration and complex page-exit motions for premium visual pacing.",
      impact: "Fostered a 34% increase in online inquiries and maintained a Google Lighthouse performance rating of 99/100."
    }
  },
  {
    id: "proj-4",
    title: "Adsorption Kinetics of Agric-Waste Biosorbents",
    description: "Academic thesis and laboratory research examining biosorption efficiency of low-cost agricultural residues for heavy metal removal in industrial effluent treatment.",
    category: "Research",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=800",
    technologies: ["FTIR Spectroscopy", "Langmuir Models", "Sorption Isotherms", "Data Modeling"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Standard activated carbon filters are prohibitively expensive for localized small-scale industrial operations in South Asia.",
      solution: "Formulated highly porous biochar via localized pyrolysis of wheat husks and chemically activated them using eco-safe citric acid washes.",
      impact: "Observed chromium (VI) removal rates exceeding 89.5% at optimal pH levels, offering a low-cost, decentralized filtration alternative."
    }
  },
  {
    id: "proj-5",
    title: "AquaMonitor: UI/UX Industrial Dashboard Redesign",
    description: "A premium Figma UI/UX redesign featuring dark glassmorphism styling, clean data tables, and high-contrast color codes to manage remote water storage reservoirs.",
    category: "Design Work",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    technologies: ["Figma UI/UX", "Component Libraries", "AutoLayout", "Design Tokens"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Existing industrial SCADA screens are cluttered, difficult to read under intense sunlight, and lack clear emergency signposting.",
      solution: "Constructed an accessible, high-contrast dashboard using strict visual spacing, large control tabs, and intelligent telemetry alerts.",
      impact: "Submited successfully to user testing groups, lowering accidental operation triggers and improving task workflow speed by 40%."
    }
  },
  {
    id: "proj-6",
    title: "Scope 1-3 Supply Chain Carbon Calculator",
    description: "A specialized AI-powered carbon footprint assessment platform tailored for logistics firms to analyze vehicle logs and fuel records through automated scripts.",
    category: "AI Projects",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    technologies: ["SvelteKit", "Python", "CO2 API", "Tailwind CSS", "Recharts"],
    liveUrl: "#",
    githubUrl: "#",
    extendedDetails: {
      challenge: "Corporate carbon accounting is laborious, often taking auditors weeks of spreadsheet manipulation to establish basic carbon targets.",
      solution: "Constructed an Express-backed ingestion engine that reads Excel fleet logs, identifies fuel grades using NLP, and triggers emissions factors instantly.",
      impact: "Shortened greenhouse gas assessment timelines from 14 days to 3.5 minutes with verifiable compliance standards."
    }
  }
];

export const SERVICES_DATA: Service[] = [
  {
    id: "srv-1",
    title: "Environmental Consultation",
    description: "Providing scientific, actionable solutions for waste minimization, water purification compliance, and green technology feasibility studies.",
    bullets: ["Biosorption filter blueprints", "EIA (Environmental Impact Assessment) drafting", "Eco-compliance and water testing logs", "Waste minimization and carbon offset schemes"],
    iconName: "Droplet",
    category: "core"
  },
  {
    id: "srv-2",
    title: "AI Solutions & Automation",
    description: "Developing custom Artificial Intelligence systems utilizing computer vision, language processing, and advanced prediction models for physical systems.",
    bullets: ["YOLO Waste Classification", "Predictive maintenance metrics", "Automated system data streaming", "Optimized process workflow AI scripts"],
    iconName: "Cpu",
    category: "core"
  },
  {
    id: "srv-3",
    title: "Website Development",
    description: "Crafting modern, lightning-fast digital solutions with responsive grids, interactive modules, and state-of-the-art frameworks.",
    bullets: ["React & Next.js responsive designs", "Custom client portal dashboards", "High SEO performance ratings", "Interactive 3D or visual graphics integrations"],
    iconName: "Code",
    category: "digital"
  },
  {
    id: "srv-4",
    title: "WordPress Development",
    description: "Deploying high-converting, fully customizable, and block-configured corporate platforms without bloated plugin stacks.",
    bullets: ["Custom theme/plugin configurations", "Elementor/Gutenberg engineering", "Advanced loading optimizations", "Integrated local forms & calendars"],
    iconName: "Globe",
    category: "digital"
  },
  {
    id: "srv-5",
    title: "Shopify Store Setup",
    description: "Launching conversion-focused digital marketplaces suited for green consumer products, drop-shipping setups, or custom item listings.",
    bullets: ["Responsive section styling", "High converting checkouts", "Inventory management flows", "App extensions & speed enhancements"],
    iconName: "ShoppingBag",
    category: "digital"
  },
  {
    id: "srv-6",
    title: "SEO Optimization",
    description: "Placing your web properties at the top page of Google results by strictly tuning system cores, metadata grids, and technical links.",
    bullets: ["Keyword indexing surveys", "Clean URL & metadata maps", "Structural sitemaps & Schema markup", "Page speed adjustments & layout shifts"],
    iconName: "TrendingUp",
    category: "digital"
  },
  {
    id: "srv-7",
    title: "UI/UX Design",
    description: "Converting complicated software concepts into elegant, minimalist, and accessible screens in Figma before starting lines of code.",
    bullets: ["Interactive wireframe flows", "Custom color systems & token grids", "Responsive bento patterns", "Usability mapping & heat tracing"],
    iconName: "Palette",
    category: "creative"
  },
  {
    id: "srv-8",
    title: "Graphic Design",
    description: "Developing consistent brand identities, vector launch sheets, typography pairings, and clean digital publishing materials.",
    bullets: ["Vector asset and logo design", "Corporate brochures & flyers", "Interactive slidedecks", "High-contrast social kits"],
    iconName: "Layers",
    category: "creative"
  },
  {
    id: "srv-9",
    title: "Video Editing",
    description: "Creating highly engaging, color-corrected, and cinematic short-form / long-form records suitable for social media campaigns.",
    bullets: ["Color-grading & visual rhythm pacing", "Keyframe text tracking & subtitles", "Sound design and high retention cuts", "Client testimonial overlays"],
    iconName: "Video",
    category: "creative"
  }
];

export const TIMELINE_DATA: TimelineEvent[] = [
  {
    id: "time-1",
    role: "Founder & Lead Developer",
    company: "Unscripted Studio",
    location: "Remote / Matli, Badin",
    duration: "2024 - Present",
    description: [
      "Founded a premium freelance digital studio catering to international and domestic clients looking for high-fidelity frontend platforms, e-commerce stores, and digital design guides.",
      "Delivered over 15 custom responsive portals in React, WordPress, and Shopify with focus on fast speed indexes.",
      "Manage client onboarding, scoping outlines, branding workshops, and custom SEO configurations."
    ],
    skills: ["Next.js", "WordPress theme craft", "Client Communications", "Shopify API", "Lead Generation"],
    category: "professional"
  },
  {
    id: "time-2",
    role: "Environmental Engineering Student",
    company: "Mehran U.E.T",
    location: "Matli, Sindh, Pakistan",
    duration: "2025 - 2029",
    description: [
      "Pursuing a Bachelor of Environmental Engineering with exceptional visual focus (GPA 1st Semester: 3.3).",
      "Acquiring advanced fundamentals of Environmental Studies, focusing on water purification systems, wastewater treatment, solid waste management plans, and climate science modeling.",
      "Conducting active biosorbent adsorption testing to discover sustainable ways to filter dye-filled textile waters using natural residue materials."
    ],
    skills: ["Water Treatment", "GIS Mapping", "Chemical Sorption Models", "Waste Classification Studies"],
    category: "academic"
  },
  {
    id: "time-3",
    role: "WordPress Developer & Shopify Manager",
    company: "Freelance Hubs",
    location: "Global Reach",
    duration: "2023 - 2024",
    description: [
      "Authored custom Gutenberg layouts, customized WooCommerce structures, and organized dropshipping product channels for worldwide green tech shops.",
      "Decreased average store loading durations from 6.4s to 1.8s, increasing customer conversion rates by 22%.",
      "Drafted high-fidelity custom scripts to coordinate live wholesale inventories across external shipping partners."
    ],
    skills: ["WordPress Hooks", "WooCommerce", "Liquid Templates", "PageSpeed Insights", "Product Catalog Optimization"],
    category: "professional"
  },
  {
    id: "time-4",
    role: "Environmental Volunteer",
    company: "Local Pollution Control & Climate Action Groups",
    location: "Karachi / Matli, Badin",
    duration: "2022 - Present",
    description: [
      "Coordinated tree plantation inventories, beach trash analysis, and localized educational workshops explaining waste classification pipelines across municipal districts.",
      "Managed carbon mapping initiatives in local student chapters and created intuitive digital infographics using Graphic Design skills to increase ecological awareness."
    ],
    skills: ["Community Management", "Recycling Awareness", "Infographic Design", "Public Outreach"],
    category: "volunteer"
  },
  {
    id: "time-5",
    role: "Content Writer & Video Editor",
    company: "Digital Publishers & Tech Channels",
    location: "Remote",
    duration: "2021 - 2023",
    description: [
      "Wrote informative technical articles, SEO newsletters, and environmental summaries covering renewable energy systems, climate policies, and AI developments.",
      "Rendered custom-paced educational video reviews, color grading, multi-cam sound styling, and eye-catching animations for visual learners on social mediums."
    ],
    skills: ["SEO copywriting", "Video Post-Production", "Cinematic Sound Design", "Adobe Premiere Pro"],
    category: "professional"
  },
  {
    id: "time-6",
    role: "Environmental Engineering Intern",
    company: "Municipal Water Treatment Facility",
    location: "Karachi, Pakistan",
    duration: "Summer 2023",
    description: [
      "Assisted laboratory technicians in testing Biochemical Oxygen Demand (BOD), Chemical Oxygen Demand (COD), pH ranges, and dissolved oxygen parameters for local effluent inflows.",
      "Observed aeration processes, sand filtration maintenance runs, and compiled daily reporting statistics on dosage schedules."
    ],
    skills: ["Lab Analytics", "BOD Wastewater Assays", "Operational Reporting", "Aeration Systems Monitoring"],
    category: "academic"
  }
];

export const SKILLS_DATA: SkillGroup[] = [
  {
    category: "Environmental Expertise",
    skills: [
      { name: "Water & Wastewater Treatment", percentage: 92 },
      { name: "Sorption Modeling & Chemical Assays", percentage: 85 },
      { name: "Environmental Impact Assessment", percentage: 80 },
      { name: "Solid Waste Management Plans", percentage: 88 },
      { name: "GIS & Pollution Core Mapping", percentage: 76 }
    ]
  },
  {
    category: "AI & Programming",
    skills: [
      { name: "Computer Vision & YOLO Architectures", percentage: 84 },
      { name: "Python Data Science (Pandas, Scikit)", percentage: 82 },
      { name: "Regression Models & Predictors", percentage: 90 },
      { name: "GitHub workflows & Cloud Deployments", percentage: 88 }
    ]
  },
  {
    category: "Digital Development",
    skills: [
      { name: "React, Next.js & Tailwind CSS", percentage: 95 },
      { name: "WordPress Custom Theme Engineering", percentage: 92 },
      { name: "Shopify Liquid & API management", percentage: 88 },
      { name: "Technical SEO Auditing", percentage: 94 }
    ]
  },
  {
    category: "Creative Craft",
    skills: [
      { name: "UI/UX Layout prototyping (Figma)", percentage: 90 },
      { name: "Vector Graphics & Branding", percentage: 85 },
      { name: "Video Post-Production & Sound Craft", percentage: 80 }
    ]
  }
];

export const CLIENT_REASONS = [
  {
    id: "reason-1",
    title: "Double-Helix Domain Expertise",
    subtitle: "Intersection of Science & Tech",
    description: "Unlike normal developers, I bring rigorous scientific analytics from Environmental Engineering and fuse it with modern software patterns, offering unparalleled insight for physical industries."
  },
  {
    id: "reason-2",
    title: "Hyper-Fast Learner & Solver",
    subtitle: "Nimble Adaptability",
    description: "I self-trained in artificial intelligence frameworks and modern JS stacks parallel to physical labs. I solve real roadblocks quickly with modern tool sets (e.g. OpenCV, Figma, TypeScript)."
  },
  {
    id: "reason-3",
    title: "Premium Startup Visual Style",
    subtitle: "Minimal, Aesthetic & Modern",
    description: "Inspired by Apple, Linear, and Vercel. I despise bloated designs. I craft pixel-perfect layouts, deliberate visual hierarchies, and fast page speeds suitable for premium corporate eyes."
  },
  {
    id: "reason-4",
    title: "Sustainable Solution Engineering",
    subtitle: "Eco-First Architecture",
    description: "Sustainability is not a marketing catchphrase for me — it's my core academic study. Every project I design, web server I configure, or proposal I write minimizes noise and optimizes resources."
  }
];

export const HOME_FUN_FACTS = [
  { count: "15+", label: "Clients Served Worldwide" },
  { count: "4.9★", label: "Average Delivery Rating" },
  { count: "4", label: "Specialized AI Models Deployed" },
  { count: "95%", label: "Lab Water Purify Recovery" }
];
