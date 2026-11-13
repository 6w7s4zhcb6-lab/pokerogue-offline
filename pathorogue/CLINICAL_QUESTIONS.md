# Offline clinical question bank

The game uses 687 authored single-best-answer cases covering the original 96 lecture concepts: 292 digestive, 239 renal, and 156 musculoskeletal subsections. Each case has a clinical stem, a keyed answer, three individual incorrect alternatives, and an explanation for every option. These are original practice questions; they are not official NCLEX items.

`clinical-bank.ts` is the sole active question source. Missing cases fail validation instead of falling back to the former wording templates. `nursing-content.ts` retains lecture metadata, condition-guide material, and the original subsection IDs so saved progress remains compatible. It no longer supplies the question stems or choices displayed in battles or the clinic.

Easy presents three options and the introductory vignette. Subsequent tiers present four options and progressively increase the chance of an authored reduced-cue vignette or closer clinical alternatives; tier 10 always uses the advanced form. All 687 subsections have an advanced variant. The displayed variant supplies its own option explanations. Questions remain single-best-answer at every tier.

Clinical review checked the stems against their keyed answers and competing choices. The editorial pass replaced unrelated distractors, clinically unsupported assumptions, and distractors that dismissed themselves with implausible absolutes. Recognition headers hide the answer and recognition questions lead each gate. Procedures and tests are labeled as such rather than described as diseases.

The player needs three correct responses for a gated attack or capture attempt. A wrong response ends that gate. Enemy turns use native battle behavior with no quiz. Existing +10/+20/+50 subsection reviews, the 12-answer mastered-concept review, mastery records, clinic statistics, and saved run debriefs are retained.

Question-writing approach: [NCSBN 2026 RN Test Plan](https://www.ncsbn.org/publications/2026-nclex-rn-test-plan). Clinical checks included [NIDDK kidney and urinary disease resources](https://www.niddk.nih.gov/health-information/kidney-disease), [AAOS OrthoInfo](https://orthoinfo.aaos.org/), and [NIAMS health topics](https://www.niams.nih.gov/health-topics), with additional condition-specific primary references recorded in the source modules.

Validation runs `node --test pathorogue/*.test.cjs`, checks strict TypeScript for the clinical modules, inspects the compiled runtime, then launches and plays the actual portable Windows EXE offline before publishing its artifact. Automated checks validate coverage, option uniqueness, difficulty selection, rationale coverage, scheduling, and battle behavior. Clinical review remains necessary for semantic correctness; text uniqueness checks alone cannot establish that only one answer is medically best.
