import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { profileService } from "@/services/profile.service";
import type { Education, Experience, Language, Certificate } from "@/types/profile";
import { aiService } from "@/services/ai.service";
import { useToastStore } from "@/store/toastStore";
import { AiScoreCard } from "@/components/AiScoreCard";
import type { ResumeAnalysis } from "@/types/ai";
import { SKILL_SUGGESTIONS, LANGUAGES } from "@/utils/constants";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/PageLoader";
const LANGUAGES_LIST = LANGUAGES.map((l) => l.value);

const levelLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  native: "Native",
};

const formatDate = (d: string | Date) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

export const ProfilePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useProfile();

  const profile = data?.data;

  const mutation = useMutation({
    mutationFn: (input: any) => profileService.update(input),
    onSuccess: (res) => {
      queryClient.setQueryData(["profile"], res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsEditing(false);
      toast("success", "Profile saved successfully");
    },
  });

  const [saved, setSaved] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => { setAvatarError(false); }, [profile?.avatarUrl]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setLanguages(profile.languages || []);
      setCertificates(profile.certificates || []);
      setPortfolio(profile.portfolio || "");
      setGithub(profile.github || "");
      setLinkedin(profile.linkedin || "");
    }
  }, [profile]);

  const cancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setLanguages(profile.languages || []);
      setCertificates(profile.certificates || []);
      setPortfolio(profile.portfolio || "");
      setGithub(profile.github || "");
      setLinkedin(profile.linkedin || "");
      setResumeUrlInput(profile.resumeUrl || "");
    }
  };

  const handleSave = () => {
    mutation.mutate({
      fullName, phone, location, title, bio, skills,
      education: education.map((e) => ({
        ...e,
        startDate: typeof e.startDate === "string" ? e.startDate : new Date(e.startDate).toISOString(),
        endDate: e.endDate ? (typeof e.endDate === "string" ? e.endDate : new Date(e.endDate).toISOString()) : undefined,
      })),
      experience: experience.map((e) => ({
        ...e,
        startDate: typeof e.startDate === "string" ? e.startDate : new Date(e.startDate).toISOString(),
        endDate: e.endDate ? (typeof e.endDate === "string" ? e.endDate : new Date(e.endDate).toISOString()) : undefined,
      })),
      languages, certificates,
      portfolio: portfolio || undefined,
      github: github || undefined,
      linkedin: linkedin || undefined,
      resumeUrl: resumeUrlInput || undefined,
    });
  };

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const res = await profileService.uploadAvatar(avatarFile);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    setUploadingResume(true);
    try {
      const res = await profileService.uploadResume(resumeFile);
      setResumeFile(null);
      setResumeUrlInput(res.data.resumeUrl);
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const [resumeUrlInput, setResumeUrlInput] = useState("");

  useEffect(() => {
    if (profile) setResumeUrlInput(profile.resumeUrl || "");
  }, [profile]);

  const [aiAnalysis, setAiAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeResume = async () => {
    if (!profile?.resumeUrl) return;
    setAnalyzing(true);
    try {
      const res = await aiService.analyzeResume(profile.resumeUrl);
      setAiAnalysis(res.data);
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  if (isLoading) return <PageLoader />;

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) setSkills([...skills, skill]);
    setSkillInput("");
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addEducation = () =>
    setEducation([...education, { institution: "", degree: "", field: "", startDate: "", endDate: "", current: false }]);
  const updateEducation = (i: number, field: keyof Education, value: any) => {
    const copy = [...education];
    (copy[i] as any)[field] = value;
    setEducation(copy);
  };
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const addExperience = () =>
    setExperience([...experience, { company: "", title: "", description: "", startDate: "", endDate: "", current: false }]);
  const updateExperience = (i: number, field: keyof Experience, value: any) => {
    const copy = [...experience];
    (copy[i] as any)[field] = value;
    setExperience(copy);
  };
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  const addLanguageRow = () => {
    const missing = LANGUAGES_LIST.find((l) => !languages.some((x) => x.language === l));
    setLanguages([...languages, { language: missing || "", level: "beginner" }]);
  };
  const updateLanguage = (i: number, field: keyof Language, value: any) => {
    const copy = [...languages];
    (copy[i] as any)[field] = value;
    setLanguages(copy);
  };
  const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));

  const addCertificate = () => setCertificates([...certificates, { name: "", issuer: "", url: "" }]);
  const updateCertificate = (i: number, field: keyof Certificate, value: any) => {
    const copy = [...certificates];
    (copy[i] as any)[field] = value;
    setCertificates(copy);
  };
  const removeCertificate = (i: number) => setCertificates(certificates.filter((_, idx) => idx !== i));

  const filteredSkills = SKILL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  );

  const inputClass = "rounded-xl border-violet-200 bg-violet-50/50 dark:border-gray-700 dark:bg-gray-800 text-slate-800 dark:text-gray-100 focus-visible:border-violet-400 focus-visible:bg-white dark:focus-visible:bg-gray-700 focus-visible:ring-violet-500/20";
  const selectClass = "w-full rounded-xl border border-violet-200 bg-violet-50/50 dark:border-gray-700 dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-violet-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300";
  const cardClass = "rounded-2xl ring-0 border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/80 shadow-md shadow-violet-500/5 dark:shadow-none backdrop-blur-sm";
  const sectionTitleClass = "mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-gray-100";

  // ─── VIEW MODE ────────────────────────────────────────────────────
  if (!isEditing) {
    const p = profile;
    if (!p) return <p className="text-center text-slate-500 dark:text-gray-400">{t("common.noResults")}</p>;

    return (
      <div className="mx-auto max-w-3xl animate-slideUp">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">{t("profile.myProfile")}</h1>
            <p className="mt-1 text-slate-500 dark:text-gray-400">{t("profile.managePersonal")}</p>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="h-auto rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2 text-sm text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            {t("profile.editProfile")}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-blue-600 p-6 text-white shadow-lg shadow-violet-500/25 sm:p-8">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:gap-5">
              {p.avatarUrl && !avatarError ? (
                <img src={p.avatarUrl} onError={() => setAvatarError(true)} alt="" className="h-20 w-20 rounded-full border-2 border-white/30 object-cover shadow-lg" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm">
                  {p.fullName?.charAt(0) || "?"}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{p.fullName}</h2>
                {p.title && <p className="text-violet-200">{p.title}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                  {p.email && <span className="inline-flex items-center gap-1">{p.email}</span>}
                  {p.phone && <span className="inline-flex items-center gap-1">{p.phone}</span>}
                  {p.location && <span className="inline-flex items-center gap-1">{p.location}</span>}
                </div>
              </div>
            </div>
            {p.bio && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="whitespace-pre-wrap text-sm text-violet-100">{p.bio}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {p.skills && p.skills.length > 0 && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  {t("profile.skills")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="h-auto rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-600 ring-1 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:ring-violet-800">{s}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Experience */}
          {p.experience && p.experience.length > 0 && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412m2.5 4.25h-15" /></svg>
                  {t("profile.experience")}
                </h2>
                <div className="space-y-5">
                  {p.experience.map((exp, i) => (
                    <div key={i} className="relative border-l-2 border-violet-200 dark:border-violet-800 pl-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-violet-500" />
                      <h3 className="font-semibold text-slate-800 dark:text-gray-100">{exp.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{exp.company}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        {formatDate(exp.startDate)} – {exp.current ? t("profile.present") : exp.endDate ? formatDate(exp.endDate) : ""}
                      </p>
                      {exp.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Education */}
          {p.education && p.education.length > 0 && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
                  {t("profile.education")}
                </h2>
                <div className="space-y-5">
                  {p.education.map((edu, i) => (
                    <div key={i} className="relative border-l-2 border-violet-200 dark:border-violet-800 pl-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-violet-500" />
                      <h3 className="font-semibold text-slate-800 dark:text-gray-100">{edu.institution}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{edu.degree} in {edu.field}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        {formatDate(edu.startDate)} – {edu.current ? t("profile.present") : edu.endDate ? formatDate(edu.endDate) : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Languages */}
          {p.languages && p.languages.length > 0 && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                  {t("profile.languages")}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {p.languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-full bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 text-sm ring-1 ring-violet-200 dark:ring-violet-800">
                      <span className="font-medium text-slate-800 dark:text-gray-100">{lang.language}</span>
                      <span className="text-slate-500 dark:text-gray-400">({levelLabel[lang.level] || lang.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Links */}
          {(p.portfolio || p.github || p.linkedin) && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                  {t("profile.links")}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {p.portfolio && (
                    <a href={p.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-100 dark:hover:bg-violet-900/50">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                      {t("profile.portfolio")}
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 ring-1 ring-slate-200 dark:ring-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                      {t("profile.github")}
                    </a>
                  )}
                  {p.linkedin && (
                    <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      {t("profile.linkedin")}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Resume */}
          <Card className={cardClass}>
            <div className="p-6">
              <h2 className={sectionTitleClass}>
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                {t("profile.resumeCV")}
              </h2>
              {p.resumeUrl ? (
                <div className="flex flex-wrap gap-3">
                  <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    {t("profile.viewResume")}
                  </a>
                  <Button
                    variant="outline"
                    onClick={handleAnalyzeResume}
                    disabled={analyzing}
                    className="h-auto rounded-xl border-violet-200 dark:border-gray-700 bg-violet-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 transition-all hover:bg-violet-100 dark:hover:bg-gray-700"
                  >
                    {analyzing ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        {t("profile.analyzing")}
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                        {t("profile.analyzeAI")}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-gray-500">{t("profile.noResume")}</p>
              )}
            </div>
          </Card>

          {/* AI Resume Analysis */}
          {aiAnalysis && (
            <AiScoreCard
              overallScore={aiAnalysis.overallScore}
              strongSkills={aiAnalysis.strongSkills}
              missingSkills={aiAnalysis.missingSkills}
              weakPoints={aiAnalysis.weakPoints}
              suggestions={aiAnalysis.suggestions}
            />
          )}

          {/* Certificates */}
          {p.certificates && p.certificates.length > 0 && (
            <Card className={cardClass}>
              <div className="p-6">
                <h2 className={sectionTitleClass}>
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                  {t("profile.certificates")}
                </h2>
                <div className="space-y-3">
                  {p.certificates.map((cert, i) => (
                    <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/50 dark:border-gray-800 dark:bg-gray-900 p-4">
                      <p className="font-medium text-slate-800 dark:text-gray-100">{cert.name}</p>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{cert.issuer}</p>
                      {cert.url && (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">
                          {t("profile.viewCredential")}
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ─── EDIT MODE ─────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">Edit Profile</h1>
          <p className="mt-1 text-slate-500 dark:text-gray-400">Update your professional information</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Saved!</span>}
          <Button
            variant="outline"
            onClick={cancelEdit}
            className="h-auto rounded-xl border-violet-200 dark:border-gray-700 px-4 py-2 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-violet-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="h-auto rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2 text-sm text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {mutation.isError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          {(mutation.error as any)?.response?.data?.message || "Failed to save profile"}
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Info */}
        <Card className={cardClass}>
          <div className="p-6">
            <h2 className={sectionTitleClass}>
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <label className={labelClass}>Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <Input value={profile?.email || ""} disabled className={`${inputClass} bg-violet-50/50 dark:bg-gray-900 text-slate-500 dark:text-gray-400`} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+1 555-0000" />
              </div>
              <div>
                <label className={labelClass}>Title / Headline</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Senior Frontend Developer" />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="New York, NY" />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={inputClass} placeholder="Tell employers about yourself..." />
            </div>
          </div>
        </Card>

        {/* Avatar */}
        <Card className={cardClass}>
          <div className="p-6">
            <h2 className={sectionTitleClass}>
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Profile Photo
            </h2>
            <div className="flex items-center gap-4">
              {profile?.avatarUrl && !avatarError && (
                <img src={profile.avatarUrl} onError={() => setAvatarError(true)} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-violet-200 dark:border-gray-700 object-cover" />
              )}
              {avatarError && profile?.fullName && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-lg font-bold text-violet-600 dark:text-violet-400">
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <div>
                <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="h-auto file:mr-3 file:rounded-xl file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-600 hover:file:bg-violet-100 dark:file:bg-violet-900/30 dark:file:text-violet-400 dark:hover:file:bg-violet-900/50" />
                {avatarFile && (
                  <Button onClick={handleUploadAvatar} disabled={uploadingAvatar}
                    className="mt-2 h-auto rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-1 text-xs text-white transition-all shadow-md shadow-violet-500/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Resume / CV */}
        <Card className={cardClass}>
          <div className="p-6">
            <h2 className={sectionTitleClass}>
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Resume / CV
            </h2>
            {profile?.resumeUrl && (
              <div className="mb-3">
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 px-4 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-100 dark:hover:bg-violet-900/50">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  View Current Resume
                </a>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Upload new resume (PDF, DOC)</label>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="h-auto file:mr-3 file:rounded-xl file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-600 hover:file:bg-violet-100 dark:file:bg-violet-900/30 dark:file:text-violet-400 dark:hover:file:bg-violet-900/50" />
                {resumeFile && (
                  <Button onClick={handleUploadResume} disabled={uploadingResume}
                    className="mt-2 h-auto rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-1 text-xs text-white transition-all shadow-md shadow-violet-500/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {uploadingResume ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
              <div>
                <label className={labelClass}>Or paste a resume URL (saved with &quot;Save Profile&quot;)</label>
                <Input value={resumeUrlInput} onChange={(e) => setResumeUrlInput(e.target.value)} className={inputClass} placeholder="https://example.com/my-resume.pdf" />
              </div>
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className={cardClass}>
          <div className="p-6">
            <h2 className={sectionTitleClass}>
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Skills
            </h2>
            <div className="relative">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className={inputClass} placeholder="Type to add skills..." />
              {skillInput && filteredSkills.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-xl border border-violet-100 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-lg">
                  {filteredSkills.map((s) => (
                    <li key={s} onClick={() => addSkill(s)} className="cursor-pointer px-3 py-2 text-sm text-slate-700 dark:text-gray-300 transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400">{s}</li>
                  ))}
                </ul>
              )}
            </div>
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" onClick={() => removeSkill(s)}
                    className="flex cursor-pointer items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition-colors hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:bg-violet-900/30 dark:text-violet-400 dark:ring-violet-800 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:ring-red-800"
                  >
                    {s} &times;
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Experience */}
        <Card className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className={sectionTitleClass}>
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412m2.5 4.25h-15" /></svg>
                Experience
              </h2>
              <Button variant="ghost" size="sm" onClick={addExperience} className="text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">+ Add</Button>
            </div>
            {experience.length === 0 && <p className="text-sm text-slate-400 dark:text-gray-500">No experience added yet.</p>}
            {experience.map((exp, i) => (
              <div key={i} className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 dark:border-gray-800 dark:bg-gray-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Experience #{i + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="text-sm text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Remove</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2"><label className={labelClass}>Company</label><Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className={inputClass} /></div>
                  <div className="col-span-1 sm:col-span-2"><label className={labelClass}>Title</label><Input value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Start Date</label><Input type="date" value={typeof exp.startDate === "string" ? exp.startDate.split("T")[0] : ""} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>End Date</label><Input type="date" value={exp.endDate ? (typeof exp.endDate === "string" ? exp.endDate.split("T")[0] : "") : ""} disabled={exp.current} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className={inputClass} /></div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(i, "current", e.target.checked)} className="rounded border-violet-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500" />
                      I currently work here
                    </label>
                  </div>
                  <div className="col-span-2"><label className={labelClass}>Description</label><Textarea value={exp.description || ""} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2} className={inputClass} /></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Education */}
        <Card className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className={sectionTitleClass}>
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
                Education
              </h2>
              <Button variant="ghost" size="sm" onClick={addEducation} className="text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">+ Add</Button>
            </div>
            {education.length === 0 && <p className="text-sm text-slate-400 dark:text-gray-500">No education added yet.</p>}
            {education.map((edu, i) => (
              <div key={i} className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 dark:border-gray-800 dark:bg-gray-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Education #{i + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(i)} className="text-sm text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Remove</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2"><label className={labelClass}>Institution</label><Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Degree</label><Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className={inputClass} placeholder="Bachelor's" /></div>
                  <div><label className={labelClass}>Field of Study</label><Input value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} className={inputClass} placeholder="Computer Science" /></div>
                  <div><label className={labelClass}>Start Date</label><Input type="date" value={typeof edu.startDate === "string" ? edu.startDate.split("T")[0] : ""} onChange={(e) => updateEducation(i, "startDate", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>End Date</label><Input type="date" value={edu.endDate ? (typeof edu.endDate === "string" ? edu.endDate.split("T")[0] : "") : ""} disabled={edu.current} onChange={(e) => updateEducation(i, "endDate", e.target.value)} className={inputClass} /></div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                      <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(i, "current", e.target.checked)} className="rounded border-violet-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500" />
                      Currently studying here
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Languages */}
        <Card className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className={sectionTitleClass}>
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                Languages
              </h2>
              <Button variant="ghost" size="sm" onClick={addLanguageRow} className="text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">+ Add</Button>
            </div>
            {languages.length === 0 && <p className="text-sm text-slate-400 dark:text-gray-500">No languages added yet.</p>}
            {languages.map((lang, i) => (
              <div key={i} className="mt-3 flex items-end gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Language</label>
                  <select value={lang.language} onChange={(e) => updateLanguage(i, "language", e.target.value)} className={selectClass}>
                    <option value="">Select...</option>
                    {LANGUAGES_LIST.map((l) => (<option key={l} value={l}>{l}</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Level</label>
                  <select value={lang.level} onChange={(e) => updateLanguage(i, "level", e.target.value)} className={selectClass}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native</option>
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeLanguage(i)} className="mb-1 text-sm text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Remove</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Links */}
        <Card className={cardClass}>
          <div className="p-6">
            <h2 className={sectionTitleClass}>
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
              Links
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Portfolio</label><Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className={inputClass} placeholder="https://yourportfolio.com" /></div>
              <div><label className={labelClass}>GitHub</label><Input value={github} onChange={(e) => setGithub(e.target.value)} className={inputClass} placeholder="https://github.com/username" /></div>
              <div><label className={labelClass}>LinkedIn</label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/username" /></div>
            </div>
          </div>
        </Card>

        {/* Certificates */}
        <Card className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className={sectionTitleClass}>
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                Certificates
              </h2>
              <Button variant="ghost" size="sm" onClick={addCertificate} className="text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">+ Add</Button>
            </div>
            {certificates.length === 0 && <p className="text-sm text-slate-400 dark:text-gray-500">No certificates added yet.</p>}
            {certificates.map((cert, i) => (
              <div key={i} className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 dark:border-gray-800 dark:bg-gray-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Certificate #{i + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeCertificate(i)} className="text-sm text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Remove</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2"><label className={labelClass}>Name</label><Input value={cert.name} onChange={(e) => updateCertificate(i, "name", e.target.value)} className={inputClass} placeholder="AWS Certified Developer" /></div>
                  <div><label className={labelClass}>Issuer</label><Input value={cert.issuer} onChange={(e) => updateCertificate(i, "issuer", e.target.value)} className={inputClass} placeholder="Amazon Web Services" /></div>
                  <div><label className={labelClass}>URL (optional)</label><Input value={cert.url || ""} onChange={(e) => updateCertificate(i, "url", e.target.value)} className={inputClass} placeholder="https://credential.example.com" /></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
