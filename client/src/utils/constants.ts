export const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "C#", "Go",
  "Rust", "SQL", "MongoDB", "PostgreSQL", "Redis", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "Git", "CI/CD", "REST API", "GraphQL", "Next.js",
  "Vue.js", "Angular", "Tailwind CSS", "SASS", "Figma", "Agile", "Scrum",
  "Django", "Flask", "Spring Boot", "Express", "NestJS", "FastAPI",
  "React Native", "Flutter", "Swift", "Kotlin", "TensorFlow", "PyTorch",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
  "DevOps", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
  "RabbitMQ", "Kafka", "Elasticsearch", "Nginx", "Linux",
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
