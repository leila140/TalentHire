import { Schema, model, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: string;
  popularity: number;
  createdAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

skillSchema.index({ name: "text" });
skillSchema.index({ category: 1 });

export const Skill = model<ISkill>("Skill", skillSchema);
