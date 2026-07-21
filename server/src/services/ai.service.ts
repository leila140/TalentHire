import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { env } from "@config/env";

let openai: OpenAI | null = null;

const getOpenAI = () => {
  if (!openai && env.openai.apiKey) {
    openai = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return openai;
};

const SYSTEM_PROMPT = `You are an expert AI recruitment assistant for TalentHire, an AI-powered recruitment platform.
You analyze resumes, match candidates to jobs, generate interview questions, and write cover letters.
Always respond with valid JSON only. No markdown, no code fences, no extra text.`;

const parseJSON = <T>(text: string): T => {
  const cleaned = text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
};

export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
};

export const analyzeResume = async (resumeText: string, jobDescription?: string) => {
  const client = getOpenAI();
  if (!client) return analyzeResumeFallback(resumeText, jobDescription);

  const jobContext = jobDescription
    ? `\n\nJob Description to compare against:\n${jobDescription}`
    : "";

  const response = await client.chat.completions.create({
    model: env.openai.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this resume and provide a detailed assessment.${jobContext}

Resume:
${resumeText}

Respond with JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "strongSkills": ["skill1", "skill2"],
  "weakPoints": ["point1", "point2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Scoring criteria:
- 0-30: Significant gaps, needs major improvements
- 30-50: Below average, several key areas missing
- 50-70: Average, meets basic requirements
- 70-85: Strong candidate with good profile
- 85-100: Excellent, top-tier candidate

Be specific about skills found and missing. Provide actionable improvement suggestions.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  return parseJSON<{
    overallScore: number;
    missingSkills: string[];
    strongSkills: string[];
    weakPoints: string[];
    suggestions: string[];
  }>(content);
};

export const matchCandidate = async (
  candidateProfile: string,
  jobDescription: string
) => {
  const client = getOpenAI();
  if (!client) return matchCandidateFallback(candidateProfile, jobDescription);

  const response = await client.chat.completions.create({
    model: env.openai.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Match this candidate to the job description. Analyze skills, experience, and overall fit.

Candidate Profile:
${candidateProfile}

Job Description:
${jobDescription}

Respond with JSON in this exact format:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "reasons": ["reason1", "reason2"],
  "recommendation": "strong_match|good_match|partial_match|weak_match"
}

Scoring:
- 0-30: Weak match, major gaps
- 30-50: Partial match, some relevant skills
- 50-70: Good match, meets most requirements
- 70-85: Strong match, excellent fit
- 85-100: Exceptional match, perfect candidate

Be specific about why skills match or don't match. Consider experience level and education.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  return parseJSON<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    reasons: string[];
    recommendation: string;
  }>(content);
};

export const generateInterviewQuestions = async (
  candidateProfile: string,
  jobDescription: string
) => {
  const client = getOpenAI();
  if (!client) return generateQuestionsFallback(candidateProfile, jobDescription);

  const response = await client.chat.completions.create({
    model: env.openai.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate 10 customized interview questions for this candidate based on their profile and the job description.

Candidate Profile:
${candidateProfile}

Job Description:
${jobDescription}

Respond with JSON in this exact format:
{
  "questions": [
    {
      "question": "The interview question",
      "category": "technical|behavioral|experience|problem-solving",
      "difficulty": "easy|medium|hard",
      "reason": "Why this question is relevant for this candidate"
    }
  ]
}

Requirements:
- Mix of technical and behavioral questions
- Tailored to the candidate's specific skills and experience level
- Progressive difficulty (start easier, get harder)
- Each question should be specific to the role, not generic
- Reference specific technologies/skills from the candidate's profile`,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  return parseJSON<{
    questions: Array<{
      question: string;
      category: string;
      difficulty: string;
      reason: string;
    }>;
  }>(content);
};

export const generateCoverLetter = async (
  candidateInfo: string,
  jobDescription: string
) => {
  const client = getOpenAI();
  if (!client) return generateCoverLetterFallback(candidateInfo, jobDescription);

  const response = await client.chat.completions.create({
    model: env.openai.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a professional, personalized cover letter for this candidate applying to this job.

Candidate Info:
${candidateInfo}

Job Description:
${jobDescription}

Respond with JSON in this exact format:
{
  "coverLetter": "The full cover letter text"
}

Guidelines:
- Professional but not stiff
- Reference specific skills and experiences from the candidate's profile
- Show enthusiasm for the specific role
- Keep it concise (300-400 words)
- Include concrete examples of relevant experience
- End with a strong call to action
- Date it with today's date`,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  return parseJSON<{ coverLetter: string }>(content);
};

export const generateRecommendedJobs = async (
  candidateProfile: string,
  availableJobs: string
) => {
  const client = getOpenAI();
  if (!client) return { recommendations: [] };

  const response = await client.chat.completions.create({
    model: env.openai.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Based on this candidate's profile, rank and recommend the best matching jobs from the available list.

Candidate Profile:
${candidateProfile}

Available Jobs:
${availableJobs}

Respond with JSON in this exact format:
{
  "recommendations": [
    {
      "jobId": "<job id>",
      "score": <number 0-100>,
      "reason": "Brief explanation of why this job is a good match"
    }
  ]
}

Rank jobs from best to worst match. Consider skills, experience level, location preference, and career growth potential.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  return parseJSON<{ recommendations: Array<{ jobId: string; score: number; reason: string }> }>(content);
};

// --- Fallback functions (when OpenAI key is not set) ---

const SKILL_DATABASE: Record<string, string[]> = {
  Frontend: ["react", "angular", "vue", "svelte", "next.js", "nuxt", "gatsby", "html", "css", "javascript", "typescript", "tailwind", "redux", "webpack", "vite"],
  Backend: ["node.js", "express", "django", "flask", "fastapi", "spring boot", "ruby on rails", "php", "go", "rust", "python", "java", "c#", "graphql", "rest api"],
  Database: ["mongodb", "postgresql", "mysql", "sqlite", "redis", "elasticsearch", "dynamodb", "firebase", "prisma", "typeorm", "mongoose"],
  DevOps: ["docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform", "aws", "azure", "gcp", "nginx", "linux"],
  Mobile: ["react native", "flutter", "kotlin", "swift", "android", "ios"],
  "Data Science": ["machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "data science", "data analysis", "pandas", "numpy", "scikit-learn"],
  Testing: ["jest", "mocha", "cypress", "selenium", "playwright", "pytest", "junit"],
  Tools: ["git", "github", "jira", "figma", "postman"],
};

export const extractSkillsFromText = (text: string): string[] => {
  const lower = text.toLowerCase();
  const allSkills = Object.values(SKILL_DATABASE).flat();
  return allSkills.filter((skill) => {
    const pattern = new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}\\b`);
    return pattern.test(lower);
  });
};

export function analyzeResumeFallback(resumeText: string, jobDescription?: string) {
  const foundSkills = extractSkillsFromText(resumeText);
  const jobSkills = jobDescription ? extractSkillsFromText(jobDescription) : [];
  const present = foundSkills.filter((s) => jobSkills.includes(s));
  const missing = jobSkills.filter((s) => !foundSkills.includes(s));
  const score = jobDescription
    ? Math.min(100, Math.round((present.length / Math.max(jobSkills.length, 1)) * 100) + 10)
    : Math.min(100, foundSkills.length * 8 + 10);

  return {
    overallScore: score,
    missingSkills: missing,
    strongSkills: foundSkills.filter((s) => present.includes(s)).slice(0, 5) || foundSkills.slice(0, 5),
    weakPoints: missing.length > 0 ? missing.slice(0, 3).map((s) => `No experience with ${s}`) : ["Keep building your skill set"],
    suggestions: [
      score < 50 ? "Consider gaining more experience in key areas." : "Your profile is solid.",
      missing.length > 0 ? `Consider learning: ${missing.slice(0, 5).join(", ")}` : "",
      "Highlight measurable achievements in your experience.",
    ].filter(Boolean),
  };
}

export function matchCandidateFallback(candidateProfile: string, jobDescription: string) {
  const candidateSkills = extractSkillsFromText(candidateProfile);
  const jobSkills = extractSkillsFromText(jobDescription);
  const matched = jobSkills.filter((s) => candidateSkills.includes(s));
  const missing = jobSkills.filter((s) => !candidateSkills.includes(s));
  const setA = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const setB = new Set(jobSkills.map((s) => s.toLowerCase()));
  const intersection = new Set([...setA].filter((x) => setB.has(x))).size;
  const union = new Set([...setA, ...setB]).size;
  const score = union === 0 ? 0 : Math.round((intersection / union) * 100);

  return {
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
    reasons: matched.length > 0 ? [`Strong in: ${matched.slice(0, 5).join(", ")}`] : ["Few matching skills found"],
    recommendation: score >= 70 ? "strong_match" : score >= 50 ? "good_match" : score >= 30 ? "partial_match" : "weak_match",
  };
}

export function generateQuestionsFallback(candidateProfile: string, _jobDescription: string) {
  const skills = extractSkillsFromText(candidateProfile);
  const templates = [
    { q: "Describe your experience with {skill} and how you've used it in past projects.", category: "technical" },
    { q: "Tell me about a challenging project where you used {skill}. What obstacles did you face?", category: "experience" },
    { q: "How do you stay current with developments in {skill}?", category: "behavioral" },
    { q: "Describe a time you had to learn a new technology quickly. How did you approach it?", category: "behavioral" },
    { q: "How do you handle disagreements with team members about technical decisions?", category: "behavioral" },
    { q: "Walk me through your debugging process when you encounter a production issue.", category: "problem-solving" },
    { q: "Describe your approach to writing maintainable, scalable code.", category: "technical" },
    { q: "How do you prioritize tasks when working on multiple features simultaneously?", category: "problem-solving" },
    { q: "Tell me about a time you mentored a junior developer or helped a teammate.", category: "behavioral" },
    { q: "What would you do differently if you could redo your most recent project?", category: "problem-solving" },
  ];

  const questions = templates.map((t, i) => ({
    question: t.q.replace("{skill}", skills[i % skills.length] || "your primary technology"),
    category: t.category,
    difficulty: i < 3 ? "easy" : i < 7 ? "medium" : "hard",
    reason: `Assesses ${t.category} abilities${skills[i % skills.length] ? ` related to ${skills[i % skills.length]}` : ""}`,
  }));

  return { questions };
}

export function generateCoverLetterFallback(candidateInfo: string, _jobDescription: string) {
  const skills = extractSkillsFromText(candidateInfo);
  const nameMatch = candidateInfo.match(/^(.+?)(?:\n|$)/);
  const name = nameMatch ? nameMatch[1].trim() : "Applicant";
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const coverLetter = `${date}

Dear Hiring Manager,

I am writing to express my strong interest in this position. With expertise in ${skills.slice(0, 5).join(", ")}${skills.length > 5 ? ", and more" : ""}, I am confident that my skills and experience align well with your requirements.

Throughout my career, I have delivered solutions that combine technical excellence with practical business outcomes. My hands-on experience with ${skills.slice(0, 3).join(", ")} has prepared me to make an immediate contribution to your team.

I am excited about the opportunity to bring my expertise to your organization and would welcome the chance to discuss how I can contribute to your team's success.

Thank you for your time and consideration.

Best regards,
${name}`;

  return { coverLetter };
}
