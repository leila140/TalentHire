import { Schema, model, Document } from "mongoose";

export interface IGalleryImage {
  _id?: Schema.Types.ObjectId;
  url: string;
  caption?: string;
  publicId?: string;
}

export interface ICompany extends Document {
  name: string;
  logo?: string;
  description: string;
  industry: string;
  employees: number;
  location: string;
  website?: string;
  benefits: string[];
  gallery: IGalleryImage[];
  isApproved: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  url: { type: String, required: true },
  caption: { type: String },
  publicId: { type: String },
}, { _id: true });

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    employees: { type: Number, required: true },
    location: { type: String, required: true },
    website: { type: String },
    benefits: [{ type: String }],
    gallery: [galleryImageSchema],
    isApproved: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Company = model<ICompany>("Company", companySchema);
