export const COURSE_STATUS = {
  DRAFT: "draft",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

// Single source of truth for valid transitions. Adding a status later means
// editing this map, not hunting through service functions for missed branches.
export const COURSE_STATUS_TRANSITIONS: Record<CourseStatus, CourseStatus[]> = {
  [COURSE_STATUS.DRAFT]: [COURSE_STATUS.IN_REVIEW, COURSE_STATUS.ARCHIVED],
  [COURSE_STATUS.IN_REVIEW]: [COURSE_STATUS.APPROVED, COURSE_STATUS.DRAFT], // approve, or reject back to draft
  [COURSE_STATUS.APPROVED]: [COURSE_STATUS.PUBLISHED, COURSE_STATUS.SCHEDULED, COURSE_STATUS.DRAFT, COURSE_STATUS.ARCHIVED],
  [COURSE_STATUS.SCHEDULED]: [COURSE_STATUS.PUBLISHED, COURSE_STATUS.APPROVED, COURSE_STATUS.ARCHIVED],
  [COURSE_STATUS.PUBLISHED]: [COURSE_STATUS.ARCHIVED],
  [COURSE_STATUS.ARCHIVED]: [COURSE_STATUS.DRAFT],
};

export const LESSON_TYPES = [
  "Text",
  "Video",
  "PDF",
  "Quiz",
  "Assignment",
  "Image",
  "Code",
  "Embed",
  "File",
] as const;