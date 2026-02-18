// ============================================
// SERVICE PACKAGES & PRICING MASTER DATA
// ============================================
// All pricing, inclusions, and add-ons for YoiMedia services.
// MRP = the fixed base price for each tier+region (right-side columns in spreadsheet).
// priceRange = the range shown for reference.

export const REGIONS = [
    { id: "india", label: "India", currency: "₹", flag: "🇮🇳" },
    { id: "usa", label: "USA", currency: "$", flag: "🇺🇸" },
    { id: "uae", label: "UAE", currency: "AED", flag: "🇦🇪" },
];

export const SERVICE_TYPES = [
    { id: "website-dev", label: "Website Development", description: "Service-Based Businesses | Code-Written Websites", icon: "Globe" },
    { id: "google-meta-ads", label: "Google / Meta Ads (Single)", description: "Single platform ad management", icon: "Target" },
    { id: "google-meta-combo", label: "Google + Meta Ads (Combined)", description: "Cross-platform ad management package", icon: "Layers" },
    { id: "social-media", label: "Social Media Management", description: "Full social media management", icon: "Share2" },
    { id: "whatsapp-chatbot", label: "WhatsApp / Chatbot / AI", description: "WhatsApp integration, chatbots & automations", icon: "MessageSquare" },
];

// ============================================
// WEBSITE DEVELOPMENT
// ============================================
const WEBSITE_DEV_TIERS = [
    {
        id: "build",
        name: "Build",
        pricing: {
            india: { min: 55000, max: 85000, mrp: 27500 },
            usa: { min: 850, max: 1300, mrp: 425 },
            uae: { min: 3200, max: 5000, mrp: 1600 },
        },
        inclusions: [
            "3–5 page custom coded website",
            "Structured multi-page layout",
            "Brand-aligned design for trust & credibility",
            "Animations, transitions & micro-interactions",
            "Advanced on-page SEO setup",
            "Google Analytics integration",
            "Basic GEO or AEO implementation",
            "Performance-tuned cloud hosting",
            "WhatsApp floating button",
            "Basic chatbot (FAQ / lead capture)",
            "Free domain + hosting (1 year)",
            "SSL certificate (HTTPS)",
            "2 months post-launch updates",
            "1 year technical support",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        pricing: {
            india: { min: 95000, max: 145000, mrp: 47500 },
            usa: { min: 1500, max: 2300, mrp: 750 },
            uae: { min: 5500, max: 8500, mrp: 2750 },
        },
        inclusions: [
            "5–8 page scalable custom website",
            "Authority-focused UX & information architecture",
            "Advanced motion system & animations",
            "SEO + UX aligned site structure",
            "Google Analytics + Tag Manager",
            "Advanced GEO or AEO setup",
            "High-performance cloud hosting",
            "WhatsApp chatbot (query + lead flows)",
            "Advanced AI chatbot (logic / RAG based)",
            "Payment gateway integration",
            "Free domain + hosting (1 year)",
            "SSL certificate (HTTPS)",
            "90 days post-launch updates",
            "1 year priority technical support",
        ],
    },
    {
        id: "empire",
        name: "Empire",
        pricing: {
            india: { min: 175000, max: 275000, mrp: 87500 },
            usa: { min: 2800, max: 4500, mrp: 1400 },
            uae: { min: 10000, max: 16000, mrp: 5000 },
        },
        inclusions: [
            "Fully custom authority website build",
            "Conversion-rate-optimized layout (CRO-ready)",
            "Automation-ready architecture",
            "Premium motion & interaction system",
            "Advanced SEO, GEO & AEO foundation",
            "Integrations with CRM, forms & tools",
            "High-availability performance hosting",
            "Priority delivery & revisions",
            "Dedicated support channel",
            "Long-term scalability planning",
        ],
    },
];

// ============================================
// GOOGLE / META ADS (SINGLE PLATFORM)
// ============================================
const GOOGLE_META_ADS_TIERS = [
    {
        id: "launch",
        name: "Launch",
        pricing: {
            india: { min: 15000, max: 30000, mrp: 15000 },
            usa: { min: 250, max: 400, mrp: 250 },
            uae: { min: 900, max: 1500, mrp: 900 },
        },
        setupFee: {
            india: { min: 5000, max: 10000 },
            usa: { min: 100, max: 150 },
            uae: { min: 350, max: 600 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "Flat fee only, no % applied",
        inclusions: [
            "1 ad account (Google OR Meta)",
            "1 campaign only",
            "Up to 5 keywords (Google) OR 1 audience set (Meta)",
            "Ad copy writing OR creative direction (no heavy design)",
            "Basic bidding setup (manual or automated)",
            "Conversion tracking check (if already installed)",
            "Monthly performance report (PDF)",
            "Email support only",
        ],
    },
    {
        id: "build",
        name: "Build",
        pricing: {
            india: { min: 20000, max: 55000, mrp: 20000 },
            usa: { min: 300, max: 750, mrp: 300 },
            uae: { min: 1100, max: 2800, mrp: 1100 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "6%–10% above threshold",
        inclusions: [
            "Up to 3 active campaigns",
            "Keyword expansion / audience segmentation",
            "A/B testing of ads (copy or creatives)",
            "Pixel / conversion tracking setup",
            "Basic retargeting (site visitors / engagers)",
            "Budget pacing & bid optimisation (bi-weekly)",
            "Monthly report with insights & next steps",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        pricing: {
            india: { min: 27500, max: 85000, mrp: 27500 },
            usa: { min: 380, max: 1100, mrp: 380 },
            uae: { min: 1400, max: 4200, mrp: 1400 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "4%–7% above threshold",
        inclusions: [
            "Funnel structure (TOF / MOF / BOF)",
            "Up to 5 campaigns running simultaneously",
            "Advanced keyword themes / audience layering",
            "Weekly bid & budget optimisation",
            "ROAS / CPA tracking & improvement actions",
            "Creative performance analysis (what to scale / stop)",
            "Monthly report + strategy notes",
        ],
    },
    {
        id: "empire",
        name: "Empire",
        pricing: {
            india: { min: 40000, max: 140000, mrp: 40000 },
            usa: { min: 600, max: 2000, mrp: 600 },
            uae: { min: 3000, max: 7500, mrp: 3000 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "3%–5% on entire spend",
        inclusions: [
            "Full-funnel paid growth ownership",
            "Unlimited campaign iterations (within reason)",
            "Advanced automation rules & scaling logic",
            "Cross-campaign budget reallocation",
            "Weekly performance & strategy calls",
            "Priority execution & support",
        ],
    },
];

const GOOGLE_META_ADS_ADDONS = [
    {
        id: "ad-creatives-pack",
        name: "Ad Creatives Pack",
        pricing: {
            india: { min: 10000, max: 20000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Up to 5 static creatives or 2 short video edits",
            "Platform-specific sizes (Google / Meta)",
            "Copy refinement for each creative",
            "1 revision cycle",
        ],
    },
    {
        id: "advanced-creative-testing",
        name: "Advanced Creative Testing",
        pricing: {
            india: { min: 15000, max: 30000 },
            usa: { min: 250, max: 450 },
            uae: { min: 900, max: 1600 },
        },
        inclusions: [
            "Creative testing framework",
            "Creative-wise performance tracking",
            "Scale / stop recommendations",
            "Monthly creative insights",
        ],
    },
    {
        id: "landing-page-cro",
        name: "Landing Page CRO Support",
        pricing: {
            india: { min: 12000, max: 25000 },
            usa: { min: 180, max: 400 },
            uae: { min: 650, max: 1400 },
        },
        inclusions: [
            "CRO audit of 1 landing page",
            "Conversion bottleneck analysis",
            "Copy & CTA improvement suggestions",
            "Tracking alignment with ads",
        ],
    },
    {
        id: "advanced-retargeting",
        name: "Advanced Retargeting Setup",
        pricing: {
            india: { min: 10000, max: 20000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Website & engagement retargeting",
            "Custom exclusion audiences",
            "Funnel-based retargeting logic",
        ],
    },
    {
        id: "performance-analytics",
        name: "Performance Analytics Upgrade",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "GA4 + GTM advanced events",
            "Custom conversion dashboards",
            "Attribution clarity (basic)",
        ],
    },
    {
        id: "youtube-ads",
        name: "YouTube Ads Add-On",
        pricing: {
            india: { min: 15000, max: 30000 },
            usa: { min: 250, max: 500 },
            uae: { min: 900, max: 1800 },
        },
        inclusions: [
            "In-stream / discovery ads",
            "Video targeting setup",
            "Placement & audience optimisation",
        ],
    },
    {
        id: "extra-platform",
        name: "Extra Platform Add-On (LinkedIn / Display)",
        pricing: {
            india: { min: 20000, max: 35000 },
            usa: { min: 300, max: 600 },
            uae: { min: 1100, max: 2200 },
        },
        inclusions: [
            "Platform setup & management",
            "Campaign structuring",
            "Monthly optimisation & reporting",
        ],
    },
    {
        id: "weekly-reporting",
        name: "Weekly Reporting & Calls",
        pricing: {
            india: { min: 10000, max: 18000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Weekly performance snapshot",
            "Weekly optimisation call (30 mins)",
            "Action items & next steps",
        ],
    },
];

// ============================================
// GOOGLE + META ADS COMBINED PACKAGES
// ============================================
const GOOGLE_META_COMBO_TIERS = [
    {
        id: "launch-starter",
        name: "Launch Starter",
        pricing: {
            india: { min: 25000, max: 35000, mrp: 25000 },
            usa: { min: 400, max: 550, mrp: 400 },
            uae: { min: 1500, max: 2000, mrp: 1500 },
        },
        setupFee: {
            india: { min: 5000, max: 10000 },
            usa: { min: 100, max: 150 },
            uae: { min: 350, max: 600 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "Flat fee only, no % applied",
        whoFor: "First-time advertisers, local & service businesses, testing paid demand",
        inclusions: [
            "Google Ads or Meta Ads (one active platform based on intent)",
            "Up to 2 campaigns total",
            "Search ads (Google) or Lead/Traffic ads (Meta)",
            "Up to 5 keywords or 1 audience set",
            "Ad copy writing or static creative direction",
            "Basic bidding setup",
            "Conversion tracking health check",
            "One consolidated monthly performance report",
        ],
    },
    {
        id: "growth-build",
        name: "Growth Build",
        pricing: {
            india: { min: 45000, max: 65000, mrp: 45000 },
            usa: { min: 700, max: 900, mrp: 700 },
            uae: { min: 2500, max: 3500, mrp: 2500 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "Flat fee up to threshold + 6%–10% above",
        whoFor: "Businesses already generating leads, service brands seeking consistency",
        inclusions: [
            "Google Ads + Meta Ads both active",
            "Up to 4 campaigns total (combined)",
            "Search + Display (Google)",
            "Lead/Traffic + basic retargeting (Meta)",
            "Keyword expansion & audience segmentation",
            "A/B testing (ads or creatives)",
            "Pixel & conversion tracking setup",
            "Bi-weekly budget & bid optimisation",
            "Monthly report with insights & next actions",
        ],
    },
    {
        id: "scale-pro",
        name: "Scale Pro",
        pricing: {
            india: { min: 75000, max: 105000, mrp: 75000 },
            usa: { min: 1100, max: 1400, mrp: 1100 },
            uae: { min: 4000, max: 5500, mrp: 4000 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "Flat fee up to threshold + 4%–7% above",
        whoFor: "Growth-stage businesses, brands scaling volume & spend",
        inclusions: [
            "Full Google + Meta funnel (TOF / MOF / BOF)",
            "Up to 6 campaigns total",
            "Search + PMax / Display (Google)",
            "Prospecting + retargeting funnels (Meta)",
            "Advanced keyword themes & audience layering",
            "Weekly bid & budget optimisation",
            "ROAS / CPA tracking & scaling actions",
            "Creative performance analysis",
            "Monthly report + strategy notes",
        ],
    },
    {
        id: "empire-growth",
        name: "Empire Growth",
        pricing: {
            india: { min: 120000, max: 160000, mrp: 120000 },
            usa: { min: 1800, max: 2500, mrp: 1800 },
            uae: { min: 6500, max: 9000, mrp: 6500 },
        },
        adSpendThreshold: { india: 200000, usa: 2500, uae: 9000 },
        spendModel: "Flat fee + 3%–5% on entire spend",
        whoFor: "High-growth brands, funded startups, multi-location businesses",
        inclusions: [
            "Google + Meta growth ownership",
            "Full-funnel strategy across platforms",
            "Unlimited campaign iterations (within reason)",
            "Advanced automation & scaling rules",
            "Cross-platform budget reallocation",
            "Weekly performance & strategy calls",
            "Priority execution & support",
        ],
    },
];

// Combo uses the same add-ons as single platform
const GOOGLE_META_COMBO_ADDONS = GOOGLE_META_ADS_ADDONS;

// ============================================
// SOCIAL MEDIA MANAGEMENT
// ============================================
const SOCIAL_MEDIA_TIERS = [
    {
        id: "launch-presence",
        name: "Launch Presence",
        pricing: {
            india: { min: 15000, max: 22000, mrp: 15000 },
            usa: { min: 250, max: 350, mrp: 250 },
            uae: { min: 900, max: 1300, mrp: 900 },
        },
        platforms: "1 platform",
        whoFor: "New brands, local/service businesses",
        inclusions: [
            "Account audit & profile optimisation",
            "Content plan (monthly)",
            "8 static posts (design + caption)",
            "Basic hashtag research",
            "Posting & scheduling",
            "Basic engagement (likes/comments – limited)",
            "Monthly performance report",
        ],
    },
    {
        id: "growth-build",
        name: "Growth Build",
        pricing: {
            india: { min: 30000, max: 45000, mrp: 30000 },
            usa: { min: 450, max: 650, mrp: 450 },
            uae: { min: 1600, max: 2500, mrp: 1600 },
        },
        platforms: "Up to 2 platforms",
        whoFor: "Businesses building consistency, founders wanting engagement",
        inclusions: [
            "Strategy + content calendar",
            "12–16 posts (mix of static + carousel)",
            "4 reels / short videos (basic edits)",
            "Caption copywriting + hashtags",
            "Community management (comments & DMs – limited hours)",
            "Posting & optimisation",
            "Monthly analytics & insights",
        ],
    },
    {
        id: "scale-authority",
        name: "Scale Authority",
        pricing: {
            india: { min: 55000, max: 80000, mrp: 55000 },
            usa: { min: 800, max: 1100, mrp: 800 },
            uae: { min: 3000, max: 4200, mrp: 3000 },
        },
        platforms: "Up to 3 platforms",
        whoFor: "Growth-stage brands, businesses building authority",
        inclusions: [
            "Brand-aligned content strategy",
            "20–24 posts (static + carousel)",
            "8 reels / short videos (trend + value)",
            "Advanced copywriting & hooks",
            "Proactive community management",
            "Content performance optimisation",
            "Monthly report + growth recommendations",
        ],
    },
    {
        id: "empire-brand",
        name: "Empire Brand",
        pricing: {
            india: { min: 100000, max: 150000, mrp: 100000 },
            usa: { min: 1400, max: 2000, mrp: 1400 },
            uae: { min: 5000, max: 7500, mrp: 5000 },
        },
        platforms: "3–4 platforms",
        whoFor: "Personal brands & companies at scale, funded startups",
        inclusions: [
            "Full brand content ownership",
            "30+ posts (multi-format)",
            "12+ reels / videos (high-impact edits)",
            "Story content (as required)",
            "Community + inbox management",
            "Trend tracking & rapid content execution",
            "Weekly reviews + priority support",
        ],
    },
];

const SOCIAL_MEDIA_ADDONS = [
    {
        id: "extra-reels",
        name: "Extra Reels / Short Videos",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "4 additional reels / short videos",
            "Basic editing (cuts, captions, music)",
            "Platform-specific sizing",
            "1 revision round",
        ],
    },
    {
        id: "advanced-video-editing",
        name: "Advanced Video Editing",
        pricing: {
            india: { min: 12000, max: 25000 },
            usa: { min: 180, max: 400 },
            uae: { min: 650, max: 1400 },
        },
        inclusions: [
            "Motion graphics, text animations",
            "Visual hooks & pacing improvements",
            "Brand-aligned overlays",
            "Up to 4 videos",
        ],
    },
    {
        id: "story-content-pack",
        name: "Story Content Pack",
        pricing: {
            india: { min: 6000, max: 12000 },
            usa: { min: 100, max: 200 },
            uae: { min: 350, max: 750 },
        },
        inclusions: [
            "12–20 stories / month",
            "Polls, Q&A, CTAs",
            "Story captions & stickers",
        ],
    },
    {
        id: "community-management-plus",
        name: "Community Management Plus",
        pricing: {
            india: { min: 10000, max: 20000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Daily comment moderation",
            "DM replies (business hours)",
            "Lead tagging & escalation",
        ],
    },
    {
        id: "influencer-outreach",
        name: "Influencer Shortlisting & Outreach",
        pricing: {
            india: { min: 15000, max: 30000 },
            usa: { min: 250, max: 500 },
            uae: { min: 900, max: 1800 },
        },
        inclusions: [
            "Influencer research (5–10 creators)",
            "Outreach message drafts",
            "Coordination support (no payments included)",
        ],
    },
    {
        id: "personal-brand-content",
        name: "Personal Brand Content Add-On",
        pricing: {
            india: { min: 20000, max: 35000 },
            usa: { min: 300, max: 600 },
            uae: { min: 1100, max: 2200 },
        },
        inclusions: [
            "Thought-leadership posts",
            "Founder-voice captions",
            "Authority positioning content",
        ],
    },
    {
        id: "trend-monitoring",
        name: "Trend Monitoring & Rapid Posts",
        pricing: {
            india: { min: 10000, max: 18000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Weekly trend tracking",
            "Rapid content suggestions",
            "Quick-turn posts/reels",
        ],
    },
    {
        id: "content-shoot-planning",
        name: "Monthly Content Shoot Planning",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "Shoot theme planning",
            "Shot list & reel ideas",
            "Creator briefing document",
        ],
    },
    {
        id: "social-analytics",
        name: "Social Analytics Deep Dive",
        pricing: {
            india: { min: 7000, max: 12000 },
            usa: { min: 100, max: 200 },
            uae: { min: 350, max: 750 },
        },
        inclusions: [
            "Post-level performance analysis",
            "Best time & format insights",
            "Content optimisation recommendations",
        ],
    },
];

// ============================================
// WHATSAPP / CHATBOT / AI / AUTOMATIONS
// ============================================
const WHATSAPP_CHATBOT_TIERS = [
    {
        id: "launch-connect",
        name: "Launch Connect",
        pricing: {
            india: { min: 15000, max: 25000, mrp: 15000 },
            usa: { min: 250, max: 400, mrp: 250 },
            uae: { min: 900, max: 1500, mrp: 900 },
        },
        whoFor: "Small service businesses, WhatsApp-first lead handling",
        inclusions: [
            "WhatsApp Business API setup (client account)",
            "1 WhatsApp entry point (website / ads / QR)",
            "Basic auto-replies (greeting, away, FAQs – up to 10)",
            "Lead capture to Google Sheet / CRM (basic)",
            "Simple chatbot (rule-based, no AI)",
            "Conversation tagging (lead / support / spam)",
            "Monthly health check & report",
        ],
    },
    {
        id: "growth-build",
        name: "Growth Build",
        pricing: {
            india: { min: 30000, max: 50000, mrp: 30000 },
            usa: { min: 450, max: 700, mrp: 450 },
            uae: { min: 1600, max: 2800, mrp: 1600 },
        },
        whoFor: "Businesses with regular inbound leads, reducing sales team load",
        inclusions: [
            "WhatsApp API + chatbot live",
            "Multi-entry points (website, ads, social)",
            "Structured chatbot flows (FAQs, services, booking)",
            "Lead qualification questions (3–5 steps)",
            "CRM integration (Zoho / HubSpot / Sheets)",
            "Auto follow-ups (day 1 / day 3)",
            "Basic AI intent detection (FAQs)",
            "Monthly optimisation & report",
        ],
    },
    {
        id: "scale-automate",
        name: "Scale Automate",
        pricing: {
            india: { min: 60000, max: 85000, mrp: 60000 },
            usa: { min: 900, max: 1200, mrp: 900 },
            uae: { min: 3000, max: 4500, mrp: 3000 },
        },
        whoFor: "Growth-stage businesses, high lead volumes",
        inclusions: [
            "Advanced chatbot (logic + AI responses)",
            "RAG-based knowledge bot (FAQs, services, docs)",
            "Appointment booking integration",
            "Multi-step lead scoring & routing",
            "WhatsApp + Email + CRM automation",
            "Abandoned lead follow-ups",
            "Conversation analytics & optimisation",
            "Monthly strategy review",
        ],
    },
    {
        id: "empire-ai-ops",
        name: "Empire AI Ops",
        pricing: {
            india: { min: 100000, max: 150000, mrp: 100000 },
            usa: { min: 1500, max: 2200, mrp: 1500 },
            uae: { min: 5000, max: 8000, mrp: 5000 },
        },
        whoFor: "Large teams & enterprises, WhatsApp as core ops channel",
        inclusions: [
            "End-to-end WhatsApp automation ownership",
            "AI chatbot trained on business data (RAG)",
            "Multi-language support (if required)",
            "Complex workflows (sales, support, ops)",
            "CRM + internal tools integration",
            "Human handoff logic & SLA rules",
            "Continuous optimisation & monitoring",
            "Priority support + monthly calls",
        ],
    },
];

const WHATSAPP_CHATBOT_ADDONS = [
    {
        id: "extra-chatbot-flow",
        name: "Extra Chatbot Flow",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "1 new end-to-end chatbot flow",
            "Flow mapping + logic setup",
            "Up to 10 intents/questions",
            "Testing & deployment",
            "Flow documentation",
        ],
    },
    {
        id: "advanced-lead-qualification",
        name: "Advanced Lead Qualification Flow",
        pricing: {
            india: { min: 12000, max: 25000 },
            usa: { min: 180, max: 400 },
            uae: { min: 650, max: 1400 },
        },
        inclusions: [
            "5–7 step qualification questions",
            "Conditional logic based on answers",
            "Lead scoring (hot/warm/cold)",
            "Auto-routing to CRM / sales",
            "Drop-off tracking",
        ],
    },
    {
        id: "multi-language-bot",
        name: "Multi-Language Bot (per language)",
        pricing: {
            india: { min: 10000, max: 20000 },
            usa: { min: 150, max: 350 },
            uae: { min: 550, max: 1300 },
        },
        inclusions: [
            "Add 1 additional language",
            "Language selection or detection",
            "Translated bot responses (client-approved)",
            "Fallback & error handling",
            "Language QA testing",
        ],
    },
    {
        id: "ai-knowledge-bot",
        name: "AI Knowledge Bot Training (RAG)",
        pricing: {
            india: { min: 15000, max: 30000 },
            usa: { min: 250, max: 500 },
            uae: { min: 900, max: 1800 },
        },
        inclusions: [
            "Knowledge ingestion (FAQs, PDFs, services)",
            "RAG-based response setup",
            "Context-aware answers",
            "Source-controlled replies",
            "Accuracy testing & tuning",
        ],
    },
    {
        id: "appointment-booking",
        name: "Appointment Booking Automation",
        pricing: {
            india: { min: 10000, max: 20000 },
            usa: { min: 150, max: 300 },
            uae: { min: 550, max: 1100 },
        },
        inclusions: [
            "Calendar integration (Google / Calendly / CRM)",
            "Slot availability sync",
            "Auto confirmations on WhatsApp",
            "Reminder messages (24h / 1h)",
            "No-show tagging",
        ],
    },
    {
        id: "abandoned-lead-followup",
        name: "Abandoned Lead Follow-Up Automation",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "Detect incomplete conversations",
            "Follow-ups (Day 1 / Day 3 / Day 7)",
            "Custom follow-up messages",
            "Exit tagging (converted / lost)",
            "Reply-rate tracking",
        ],
    },
    {
        id: "crm-deep-integration",
        name: "CRM Deep Integration",
        pricing: {
            india: { min: 15000, max: 30000 },
            usa: { min: 250, max: 500 },
            uae: { min: 900, max: 1800 },
        },
        inclusions: [
            "Two-way CRM sync",
            "Custom field mapping",
            "Lead status updates via bot",
            "Activity logging",
            "Sync monitoring",
        ],
    },
    {
        id: "email-whatsapp-automation",
        name: "Email + WhatsApp Automation",
        pricing: {
            india: { min: 12000, max: 25000 },
            usa: { min: 180, max: 400 },
            uae: { min: 650, max: 1400 },
        },
        inclusions: [
            "Trigger emails from WhatsApp actions",
            "Lead confirmation emails",
            "Internal alerts (sales / ops)",
            "Status-based email flows",
        ],
    },
    {
        id: "voice-bot-ivr",
        name: "Voice Bot / IVR Automation",
        pricing: {
            india: { min: 20000, max: 40000 },
            usa: { min: 300, max: 700 },
            uae: { min: 1100, max: 2800 },
        },
        inclusions: [
            "Incoming call handling",
            "IVR menu logic",
            "Call → WhatsApp handoff",
            "Call tagging & routing",
            "Call logs & analytics",
        ],
    },
    {
        id: "internal-workflow-automation",
        name: "Internal Workflow Automation (per flow)",
        pricing: {
            india: { min: 12000, max: 25000 },
            usa: { min: 180, max: 400 },
            uae: { min: 650, max: 1400 },
        },
        inclusions: [
            "Connect WhatsApp to tools (CRM, Sheets, Slack, Notion)",
            "Task creation on actions",
            "Status updates",
            "Error & fallback logic",
        ],
    },
    {
        id: "conversation-analytics",
        name: "Conversation Analytics & Insights",
        pricing: {
            india: { min: 7000, max: 12000 },
            usa: { min: 100, max: 200 },
            uae: { min: 350, max: 750 },
        },
        inclusions: [
            "Conversation volume tracking",
            "Drop-off analysis",
            "Top intents/questions report",
            "Lead quality insights",
        ],
    },
    {
        id: "compliance-optin",
        name: "Compliance & Opt-In Management",
        pricing: {
            india: { min: 6000, max: 12000 },
            usa: { min: 90, max: 180 },
            uae: { min: 300, max: 700 },
        },
        inclusions: [
            "Opt-in message logic",
            "Consent storage",
            "Opt-out handling",
            "Audit-ready logs",
        ],
    },
    {
        id: "human-handoff-sla",
        name: "Human Handoff & SLA Logic",
        pricing: {
            india: { min: 8000, max: 15000 },
            usa: { min: 120, max: 250 },
            uae: { min: 450, max: 900 },
        },
        inclusions: [
            "Bot → human escalation rules",
            "Priority tagging (VIP / urgent)",
            "SLA timers & alerts",
            "Assignment & resolution tracking",
        ],
    },
];

// ============================================
// MASTER EXPORT
// ============================================
export const SERVICE_PACKAGES = {
    "website-dev": {
        tiers: WEBSITE_DEV_TIERS,
        addOns: [],
    },
    "google-meta-ads": {
        tiers: GOOGLE_META_ADS_TIERS,
        addOns: GOOGLE_META_ADS_ADDONS,
    },
    "google-meta-combo": {
        tiers: GOOGLE_META_COMBO_TIERS,
        addOns: GOOGLE_META_COMBO_ADDONS,
    },
    "social-media": {
        tiers: SOCIAL_MEDIA_TIERS,
        addOns: SOCIAL_MEDIA_ADDONS,
    },
    "whatsapp-chatbot": {
        tiers: WHATSAPP_CHATBOT_TIERS,
        addOns: WHATSAPP_CHATBOT_ADDONS,
    },
};

// ============================================
// HELPER: Get all possible inclusions for a service
// (combines all tiers, for the "add from higher tier" feature)
// ============================================
export function getAllInclusionsForService(serviceType) {
    const pkg = SERVICE_PACKAGES[serviceType];
    if (!pkg) return [];
    const allInclusions = new Set();
    pkg.tiers.forEach(tier => {
        tier.inclusions.forEach(inc => allInclusions.add(inc));
    });
    return [...allInclusions];
}

// ============================================
// HELPER: Get inclusions from higher tiers only
// ============================================
export function getHigherTierInclusions(serviceType, currentTierId) {
    const pkg = SERVICE_PACKAGES[serviceType];
    if (!pkg) return [];
    const currentTierIndex = pkg.tiers.findIndex(t => t.id === currentTierId);
    if (currentTierIndex === -1) return [];

    const currentInclusions = new Set(pkg.tiers[currentTierIndex].inclusions);
    const higherInclusions = [];

    for (let i = currentTierIndex + 1; i < pkg.tiers.length; i++) {
        pkg.tiers[i].inclusions.forEach(inc => {
            if (!currentInclusions.has(inc) && !higherInclusions.includes(inc)) {
                higherInclusions.push(inc);
            }
        });
    }
    return higherInclusions;
}

// ============================================
// HELPER: Format price with currency
// ============================================
export function formatPrice(amount, region) {
    const reg = REGIONS.find(r => r.id === region);
    if (!reg) return String(amount);
    if (region === "india") {
        return `${reg.currency}${amount.toLocaleString("en-IN")}`;
    }
    return `${reg.currency}${amount.toLocaleString()}`;
}

// ============================================
// HELPER: Format price range
// ============================================
export function formatPriceRange(min, max, region) {
    return `${formatPrice(min, region)} – ${formatPrice(max, region)}`;
}
