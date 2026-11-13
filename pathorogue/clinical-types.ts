/** Explicitly authored single-best-answer cases. No generated clinical claims. */
export type ClinicalOption = { text: string; why: string };
export type ClinicalCase = {
  stem: string;
  answer: string;
  foils: ClinicalOption[];
  why: string;
  kind?: "diagnosis" | "treatment" | "test" | "mechanism" | "classification";
  harderStem?: string;
  harderFoils?: ClinicalOption[];
};
