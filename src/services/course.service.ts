import mongoose from "mongoose";
import {
  computeCourseAggregates,
  getPublishChecklist,
  slugify,
} from "../utils/course.aggregates";
import { StatusCodes } from "../common/errors/statusCodes";
import { Course } from "../models/Course.model";
import { AppError } from "../common/errors/api-error";
import {
  COURSE_STATUS,
  COURSE_STATUS_TRANSITIONS,
  CourseStatus,
} from "../types/course.constants";
import { Instructor } from "../models/Instructor.model";

async function generateUniqueSlug(
  title: string,
  session: mongoose.ClientSession,
) {
  const base = slugify(title);
  let candidate = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await Course.exists({ slug: candidate }).session(session);
    if (!exists) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new AppError(
    "Could not generate a unique course URL, please try a different title.",
    StatusCodes.CONFLICT,
  );
}

export const createCourse = async (instructorId: string, data: any) => {
  const session = await mongoose.startSession();
  try {
    let created: any;
    await session.withTransaction(async () => {
      const slug = await generateUniqueSlug(data.title, session);
      const { syllabus, durationHrs, lessonsCount } = computeCourseAggregates(
        data.syllabus,
      );

      const [course] = await Course.create(
        [
          {
            ...data,
            syllabus,
            durationHrs,
            lessonsCount,
            slug,
            instructor: instructorId, // <- from auth token, never from data/body
            status: COURSE_STATUS.DRAFT,
          },
        ],
        { session },
      );

      await Instructor.findByIdAndUpdate(
        instructorId,
        { $inc: { coursesCount: 1 } },
        { session },
      );
      created = course;
    });

    return await created.populate({ path: "instructor", select: "name email" });
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError(
        "A course with this title already exists.",
        StatusCodes.CONFLICT,
      );
    }
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateCourse = async (
  courseId: string | string[],
  instructorId: string,
  data: any,
) => {
  const { expectedRevision, syllabus, ...rest } = data;

  const setPayload: Record<string, any> = { ...rest };
  if (syllabus) {
    const aggregates = computeCourseAggregates(syllabus);
    setPayload.syllabus = aggregates.syllabus;
    setPayload.durationHrs = aggregates.durationHrs;
    setPayload.lessonsCount = aggregates.lessonsCount;
  }

  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId, revision: expectedRevision },
    {
      $set: {
        ...setPayload,
        // editing a live course doesn't un-publish it, but flags that the
        // published version is now stale until the instructor republishes
        ...(setPayload && { hasUnpublishedChanges: true }),
      },
      $inc: { revision: 1 },
    },
    { new: true, runValidators: true },
  );

  if (course) return course;

  const exists = await Course.exists({
    _id: courseId,
    instructor: instructorId,
  });
  if (!exists) {
    throw new AppError(
      "Course not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }
  throw new AppError(
    "This course was changed elsewhere. Please refresh and try again.",
    StatusCodes.CONFLICT,
  );
};

async function transitionCourseStatus(
  courseId: string,
  instructorId: string,
  toStatus: CourseStatus,
  extra: { $set?: Record<string, any>; $inc?: Record<string, any> } = {},
) {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });
  if (!course) {
    throw new AppError(
      "Course not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }

  const allowed =
    COURSE_STATUS_TRANSITIONS[course.status as CourseStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(
      `Cannot move a course from '${course.status}' to '${toStatus}'.`,
      StatusCodes.CONFLICT,
    );
  }

  const updated = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId, status: course.status }, // guards concurrent transitions
    {
      $set: { status: toStatus, ...extra.$set },
      $inc: { revision: 1, ...extra.$inc },
    },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new AppError(
      "This course's status changed elsewhere. Please refresh and try again.",
      StatusCodes.CONFLICT,
    );
  }
  return updated;
}

export const submitCourseForReview = async (
  courseId: string | string[],
  instructorId: string,
) => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  });
  if (!course)
    throw new AppError(
      "Course not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );

  const checklist = getPublishChecklist(course);
  const failing = Object.entries(checklist)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);
  if (failing.length > 0) {
    throw new AppError(
      `Course is not ready for review. Missing: ${failing.join(", ")}.`,
      StatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  return transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.IN_REVIEW,
    {
      $set: { reviewNotes: null },
    },
  );
};

// NOTE: gate this behind a reviewer/admin auth middleware once that role exists -
// it intentionally does not filter by `instructor`, since the reviewer isn't the owner.
export const approveCourse = async (courseId: string) => {
  const updated = await Course.findOneAndUpdate(
    { _id: courseId, status: COURSE_STATUS.IN_REVIEW },
    {
      $set: { status: COURSE_STATUS.APPROVED, reviewNotes: null },
      $inc: { revision: 1 },
    },
    { new: true },
  );
  if (!updated)
    throw new AppError("Course is not awaiting review.", StatusCodes.CONFLICT);
  return updated;
};

export const rejectCourse = async (courseId: string, notes: string) => {
  const updated = await Course.findOneAndUpdate(
    { _id: courseId, status: COURSE_STATUS.IN_REVIEW },
    {
      $set: { status: COURSE_STATUS.DRAFT, reviewNotes: notes },
      $inc: { revision: 1 },
    },
    { new: true },
  );
  if (!updated)
    throw new AppError("Course is not awaiting review.", StatusCodes.CONFLICT);
  return updated;
};

export const publishCourse = (
  courseId: string | string[],
  instructorId: string,
) =>
  transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.PUBLISHED,
    {
      $set: {
        publishedAt: new Date(),
        scheduledPublishAt: null,
        hasUnpublishedChanges: false,
      },
      $inc: { version: 1 },
    },
  );

export const schedulePublish = (
  courseId: string | string[],
  instructorId: string,
  scheduledPublishAt: Date,
) => {
  if (scheduledPublishAt.getTime() <= Date.now()) {
    throw new AppError(
      "Scheduled publish date must be in the future.",
      StatusCodes.BAD_REQUEST,
    );
  }
  return transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.SCHEDULED,
    {
      $set: { scheduledPublishAt },
    },
  );
};

export const cancelSchedule = (
  courseId: string | string[],
  instructorId: string,
) =>
  transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.APPROVED,
    {
      $set: { scheduledPublishAt: null },
    },
  );

export const archiveCourse = (
  courseId: string | string[],
  instructorId: string,
) =>
  transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.ARCHIVED,
    {
      $set: { archivedAt: new Date() },
    },
  );

export const restoreCourse = (
  courseId: string | string[],
  instructorId: string,
) =>
  transitionCourseStatus(
    courseId as string,
    instructorId,
    COURSE_STATUS.DRAFT,
    {
      $set: { archivedAt: null },
    },
  );

export const deleteCourse = async (
  courseId: string | string[],
  instructorId: string,
) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId,
      }).session(session);
      if (!course)
        throw new AppError(
          "Course not found or you do not have access to it.",
          StatusCodes.NOT_FOUND,
        );

      if (course.status !== COURSE_STATUS.DRAFT) {
        throw new AppError(
          "Only draft courses can be deleted. Archive it instead.",
          StatusCodes.CONFLICT,
        );
      }
      if (course.enrollmentsCount > 0) {
        throw new AppError(
          "Cannot delete a course with active enrollments.",
          StatusCodes.CONFLICT,
        );
      }

      await Course.deleteOne({ _id: courseId }).session(session);
      await Instructor.findByIdAndUpdate(
        instructorId,
        { $inc: { coursesCount: -1 } },
        { session },
      );
    });
  } finally {
    session.endSession();
  }
};

export const getCourseById = async (
  courseId: string | string[],
  instructorId: string,
) => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  }).populate({
    path: "instructor",
    select: "name email",
  });
  if (!course)
    throw new AppError(
      "Course not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  return course;
};

export const getInstructorCourses = async (
  instructorId: string,
  opts: { search?: string; status?: string; sort?: string } = {},
) => {
  const filter: Record<string, any> = { instructor: instructorId };
  if (opts.status) filter.status = opts.status;
  if (opts.search) filter.title = { $regex: opts.search, $options: "i" };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    students: { enrollmentsCount: -1 },
    rated: { rating: -1 },
  };

  return Course.find(filter)
    .sort(sortMap[opts.sort ?? "newest"])
    .lean();
};
