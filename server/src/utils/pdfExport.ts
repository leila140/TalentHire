import PDFDocument from "pdfkit";

interface ResumeData {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    title: string;
    description?: string;
    startDate: Date | string;
    endDate?: Date | string;
    current: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: Date | string;
    endDate?: Date | string;
    current: boolean;
  }>;
  languages?: Array<{
    language: string;
    level: string;
  }>;
  certificates?: Array<{
    name: string;
    issuer: string;
    url?: string;
  }>;
  portfolio?: string;
  github?: string;
  linkedin?: string;
}

export const generateResumePdf = (data: ResumeData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).font("Helvetica-Bold").text(data.fullName, { align: "center" });
    doc.moveDown(0.2);

    const contactParts = [data.email, data.phone, data.location].filter(Boolean);
    doc.fontSize(10).font("Helvetica").text(contactParts.join(" | "), { align: "center" });

    const links = [data.portfolio, data.github, data.linkedin].filter(Boolean);
    if (links.length > 0) {
      doc.text(links.join(" | "), { align: "center" });
    }

    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#3b6bf5");
    doc.moveDown(0.5);

    if (data.title || data.bio) {
      doc.fontSize(14).font("Helvetica-Bold").text(data.title || "Professional Profile");
      doc.moveDown(0.2);
      if (data.bio) {
        doc.fontSize(10).font("Helvetica").text(data.bio);
        doc.moveDown(0.5);
      }
    }

    if (data.skills && data.skills.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Skills");
      doc.moveDown(0.2);
      doc.fontSize(10).font("Helvetica").text(data.skills.join(" • "));
      doc.moveDown(0.5);
    }

    if (data.experience && data.experience.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Experience");
      doc.moveDown(0.2);

      for (const exp of data.experience) {
        doc.fontSize(11).font("Helvetica-Bold").text(exp.title);
        doc.fontSize(10).font("Helvetica").text(`${exp.company} • ${formatDate(exp.startDate)} - ${exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}`);
        if (exp.description) {
          doc.moveDown(0.1);
          doc.fontSize(10).font("Helvetica").text(exp.description);
        }
        doc.moveDown(0.3);
      }
      doc.moveDown(0.2);
    }

    if (data.education && data.education.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Education");
      doc.moveDown(0.2);

      for (const edu of data.education) {
        doc.fontSize(11).font("Helvetica-Bold").text(`${edu.degree} in ${edu.field}`);
        doc.fontSize(10).font("Helvetica").text(`${edu.institution} • ${formatDate(edu.startDate)} - ${edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}`);
        doc.moveDown(0.3);
      }
      doc.moveDown(0.2);
    }

    if (data.languages && data.languages.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Languages");
      doc.moveDown(0.2);
      doc.fontSize(10).font("Helvetica").text(data.languages.map((l) => `${l.language} (${l.level})`).join(" • "));
      doc.moveDown(0.5);
    }

    if (data.certificates && data.certificates.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Certificates");
      doc.moveDown(0.2);
      for (const cert of data.certificates) {
        doc.fontSize(10).font("Helvetica-Bold").text(cert.name);
        doc.fontSize(10).font("Helvetica").text(cert.issuer);
        doc.moveDown(0.2);
      }
    }

    doc.end();
  });
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
