import { describe, it, expect } from "vitest";
import {
  analyzeResumeFallback,
  matchCandidateFallback,
  generateQuestionsFallback,
  generateCoverLetterFallback,
  extractSkillsFromText,
} from "@services/ai.service";

describe("extractSkillsFromText", () => {
  it("extracts known skills from text", () => {
    const text = "I have experience with React, Node.js, and MongoDB";
    const skills = extractSkillsFromText(text);
    expect(skills).toContain("react");
    expect(skills).toContain("node.js");
    expect(skills).toContain("mongodb");
  });

  it("returns empty array for text with no known skills", () => {
    const text = "I enjoy cooking and reading books";
    const skills = extractSkillsFromText(text);
    expect(skills).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const text = "REACT and Docker and PYTHON";
    const skills = extractSkillsFromText(text);
    expect(skills).toContain("react");
    expect(skills).toContain("docker");
    expect(skills).toContain("python");
  });
});

describe("analyzeResumeFallback", () => {
  it("returns score and skills for a resume with known skills", () => {
    const result = analyzeResumeFallback("Skills: React, TypeScript, Node.js, MongoDB");
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.strongSkills).toBeInstanceOf(Array);
    expect(result.suggestions).toBeInstanceOf(Array);
  });

  it("compares resume against job description", () => {
    const resume = "Skills: React, TypeScript, Node.js";
    const job = "Required: React, TypeScript, Docker, Kubernetes";
    const result = analyzeResumeFallback(resume, job);
    expect(result.missingSkills).toContain("docker");
    expect(result.missingSkills).toContain("kubernetes");
    expect(result.strongSkills).toContain("react");
    expect(result.strongSkills).toContain("typescript");
  });

  it("gives high score when all job skills match", () => {
    const resume = "Skills: React, Docker, AWS";
    const job = "Required: React, Docker, AWS";
    const result = analyzeResumeFallback(resume, job);
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.missingSkills).toHaveLength(0);
  });
});

describe("matchCandidateFallback", () => {
  it("returns match score and matched skills", () => {
    const result = matchCandidateFallback(
      "Full stack developer with React, Node.js, MongoDB",
      "Looking for React, Node.js, PostgreSQL developer"
    );
    expect(result.matchScore).toBeGreaterThan(0);
    expect(result.matchedSkills).toContain("react");
    expect(result.matchedSkills).toContain("node.js");
    expect(result.missingSkills).toContain("postgresql");
  });

  it("gives strong_match for high match", () => {
    const result = matchCandidateFallback(
      "Expert in React, TypeScript, Node.js, MongoDB, Docker",
      "Need React, TypeScript, Node.js, MongoDB, Docker"
    );
    expect(result.matchScore).toBeGreaterThanOrEqual(70);
    expect(result.recommendation).toBe("strong_match");
  });

  it("gives weak_match for low match", () => {
    const result = matchCandidateFallback(
      "Experience in COBOL and Fortran",
      "Need React, Node.js, Docker, Kubernetes, AWS"
    );
    expect(result.recommendation).toMatch(/weak_match|partial_match/);
  });
});

describe("generateQuestionsFallback", () => {
  it("generates exactly 10 questions", () => {
    const result = generateQuestionsFallback(
      "Skills: React, Node.js",
      "Full stack position"
    );
    expect(result.questions).toHaveLength(10);
  });

  it("each question has required fields", () => {
    const result = generateQuestionsFallback(
      "Skills: Python, Django",
      "Backend position"
    );
    result.questions.forEach((q) => {
      expect(q.question).toBeTruthy();
      expect(["technical", "behavioral", "experience", "problem-solving"]).toContain(q.category);
      expect(["easy", "medium", "hard"]).toContain(q.difficulty);
      expect(q.reason).toBeTruthy();
    });
  });

  it("includes skill-specific questions when skills are found", () => {
    const result = generateQuestionsFallback(
      "Skills: React, TypeScript",
      "Frontend position"
    );
    const techQuestions = result.questions.filter((q) => q.category === "technical");
    expect(techQuestions.length).toBeGreaterThan(0);
  });
});

describe("generateCoverLetterFallback", () => {
  it("generates a cover letter with the candidate name", () => {
    const result = generateCoverLetterFallback(
      "John Doe\nSkills: React, Node.js",
      "Frontend Developer at Acme Corp"
    );
    expect(result.coverLetter).toContain("John Doe");
    expect(result.coverLetter).toContain("Dear Hiring Manager");
    expect(result.coverLetter).toContain("react");
  });

  it("uses first line as name when no newline after name", () => {
    const result = generateCoverLetterFallback(
      "Skills: React, Node.js",
      "Frontend position"
    );
    expect(result.coverLetter).toContain("Skills: React, Node.js");
    expect(result.coverLetter).toContain("Dear Hiring Manager");
  });

  it("mentions candidate skills in the letter", () => {
    const result = generateCoverLetterFallback(
      "Jane Smith\nSkills: Python, Django, PostgreSQL",
      "Backend position"
    );
    expect(result.coverLetter).toContain("python");
    expect(result.coverLetter).toContain("django");
  });
});
