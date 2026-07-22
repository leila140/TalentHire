export const SKILL_SUGGESTIONS = [
  // Programming & Development
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "C#", "Go",
  "Rust", "C++", "PHP", "Ruby", "Scala", "Kotlin", "Swift", "Dart",
  "SQL", "MongoDB", "PostgreSQL", "Redis", "MySQL", "SQLite", "DynamoDB", "Cassandra",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "REST API", "GraphQL",
  "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "SASS", "Bootstrap",
  "Django", "Flask", "Spring Boot", "Express", "NestJS", "FastAPI", "Rails", "Laravel",
  "React Native", "Flutter", "Swift", "TensorFlow", "PyTorch", "Machine Learning",
  "Deep Learning", "NLP", "Computer Vision", "Data Science", "Generative AI", "LLMs",
  "DevOps", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Linux", "Nginx",
  "RabbitMQ", "Kafka", "Elasticsearch", "Microservices", "WebSockets", "OAuth",
  "HTML", "CSS", "JavaScript ES6", "WordPress", "Shopify",

  // Design & Creative
  "UI/UX Design", "Figma", "Photoshop", "Illustrator", "Adobe XD", "Sketch",
  "After Effects", "Premiere Pro", "InDesign", "Canva", "Lightroom",
  "3D Modeling", "Blender", "AutoCAD", "Animation", "Motion Graphics",
  "Video Editing", "Photography", "Graphic Design", "Brand Design",
  "Icon Design", "Typography", "Wireframing", "Prototyping",

  // Marketing & Sales
  "SEO", "SEM", "Google Ads", "Facebook Ads", "LinkedIn Ads", "TikTok Ads",
  "Content Marketing", "Social Media Marketing", "Email Marketing", "Copywriting",
  "Brand Strategy", "Lead Generation", "Sales", "B2B Sales", "B2C Sales",
  "Affiliate Marketing", "PPC", "Influencer Marketing", "Marketing Automation",
  "HubSpot", "Salesforce", "Google Analytics", "Market Research",
  "Public Relations", "Event Marketing", "Growth Hacking", "Conversion Optimization",

  // Business & Management
  "Project Management", "Product Management", "Business Analysis",
  "Strategic Planning", "Financial Modeling", "Budgeting", "Forecasting",
  "KPIs", "OKRs", "Lean", "Six Sigma", "Risk Management", "Vendor Management",
  "Operations", "Supply Chain", "Procurement", "Change Management",
  "Stakeholder Management", "Business Development", "Entrepreneurship",
  "P&L Management", "Resource Planning", "Process Improvement",

  // Soft Skills
  "Leadership", "Communication", "Teamwork", "Problem Solving",
  "Critical Thinking", "Time Management", "Adaptability", "Creativity",
  "Public Speaking", "Negotiation", "Conflict Resolution", "Mentorship",
  "Decision Making", "Emotional Intelligence", "Self-Motivation",
  "Attention to Detail", "Work Ethic", "Multitasking", "Collaboration",
  "Analytical Thinking", "Presentation Skills", "Coaching",

  // Data & Analytics
  "Data Analysis", "Data Visualization", "Tableau", "Power BI", "Excel",
  "Google Analytics", "A/B Testing", "Statistical Analysis", "ETL",
  "Data Engineering", "Apache Spark", "Hadoop", "Data Mining",
  "Business Intelligence", "Dashboarding", "Big Data",

  // Writing & Content
  "Technical Writing", "Content Creation", "Editing", "Proofreading",
  "Storytelling", "UX Writing", "Grant Writing", "Transcription",
  "Blogging", "Whitepapers", "Documentation", "Scriptwriting",

  // Other
  "Accounting", "HR Management", "Legal", "Quality Assurance", "QA Testing",
  "Training", "Customer Service", "Customer Success", "Event Planning",
  "Recruitment", "Compliance", "Translation", "Curriculum Design",
  "Healthcare", " Nursing", "Pharmacology", "Cybersecurity", "Penetration Testing",
  "Cloud Architecture", "Network Engineering", "Technical Support",
];

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

export const WORK_MODES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "MAD", "TND"] as const;

export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "arabic", label: "Arabic" },
  { value: "spanish", label: "Spanish" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "russian", label: "Russian" },
] as const;

export const LANGUAGE_LEVELS = [
  { value: "native", label: "Native" },
  { value: "fluent", label: "Fluent" },
  { value: "advanced", label: "Advanced" },
  { value: "intermediate", label: "Intermediate" },
  { value: "basic", label: "Basic" },
] as const;
