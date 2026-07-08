import mongoose from "mongoose";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Bookmark } from "../models/Bookmark.model";
import { Course } from "../models/Course.model";
import { Goal } from "../models/Goal.model";
import { Learner } from "../models/Learner.model";
import { Todo } from "../models/Todo.model";
import { WorkspaceNote } from "../models/WorkspaceNote.model";
import { IBookmark } from "../schemas/bookmark.schema";
import { IGoal } from "../schemas/goal.schema";
import { ITodo } from "../schemas/todo.schema";
import { IWorkspaceNote } from "../schemas/workspaceNote.schema";

export const getLearnerProfile = async (id: string) => {
  const learner = await Learner.findById(id).select("-password");

  if (!learner) {
    throw new AppError("Learner not found", StatusCodes.NOT_FOUND);
  }
  return learner;
};

export const getCourses = async (
  filters: Record<string, any> = {},
  learnerData: any,
) => {
  const queryFilter: any = {};

  // Category tab assignment filtering
  if (filters.category && filters.category !== "All") {
    queryFilter.category = filters.category;
  }

  // Level classification validation matching
  if (filters.level) {
    queryFilter.level = filters.level;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    queryFilter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }

  const [coursesDocs, learnerDoc] = await Promise.all([
    Course.find(queryFilter)
      .sort({ rating: -1, createdAt: -1 })
      .populate({
        path: "instructor",
        select: "name title email",
      })
      .exec(),
    Learner.findById(learnerData._id || learnerData.id).exec(),
  ]);

  // Safety Fallback: If no learner record exists, return plain courses with 0 progress
  if (!learnerDoc) {
    return coursesDocs.map((doc) => ({
      ...doc.toObject(),
      progress: 0,
    }));
  }

  const learner = learnerDoc.toObject() as any;

  // Map through all courses and inject individual progress metrics from the user document
  const coursesWithProgress = coursesDocs.map((doc) => {
    const course = doc.toObject() as any;

    const tracking = learner.enrolledCourses?.find(
      (item: any) => item.courseId.toString() === course._id.toString(),
    );

    course.progress = tracking ? tracking.progress : 0;

    return course;
  });

  return coursesWithProgress;
};

export const getCourseById = async (
  id: string | string[],
  learnerData: any,
) => {
  const courseDoc = await Course.findById(id)
    .populate({ path: "instructor", select: "name email" })
    .exec();

  if (!courseDoc) return null;

  const learnerId = learnerData._id || learnerData.id;
  const learnerDoc = await Learner.findById(learnerId);
  const course = courseDoc.toObject() as any;

  if (!learnerDoc) {
    course.progress = 0;
    course.isEnrolled = false;
    course.isBookmarked = false;
    return course;
  }

  const learner = learnerDoc.toObject() as any;
  const tracking = learner.enrolledCourses.find(
    (item: any) => item.courseId.toString() === course._id.toString(),
  );

  course.progress = tracking ? tracking.progress : 0;
  course.isEnrolled = Boolean(tracking);
  course.isBookmarked = await Bookmark.exists({
    learner: learnerId,
    course: course._id,
  }).then(Boolean);

  return course;
};

export const bookmarkService = {
  async toggle(
    learnerId: string,
    courseId: string | string[],
    data: {
      title: string;
      type:
        | "lesson"
        | "video"
        | "note"
        | "pdf"
        | "quiz"
        | "discussion"
        | "resource"
        | "course";
      note?: string;
    },
  ) {
    try {
      const existing = await Bookmark.findOne({
        learner: learnerId,
        course: courseId,
      });

      if (existing) {
        await Bookmark.deleteOne({ _id: existing._id });
        return { bookmarked: false };
      }

      const created = await Bookmark.create({
        learner: learnerId,
        course: courseId as string,
        title: data.title,
        type: data.type,
        note: data.note,
      });

      return { bookmarked: true };
    } catch (error: any) {
      // Race condition guard: two rapid clicks could both pass the
      // findOne check before either insert completes. The unique index
      // on the model catches that — surface it as "already bookmarked"
      // instead of a raw 500.
      if (error?.code === 11000) {
        throw new AppError(
          "This course is already bookmarked",
          StatusCodes.CONFLICT,
        );
      }
      throw error;
    }
  },

  async getAll(learnerId: string) {
    try {
      return await Bookmark.find({ learner: learnerId })
        .sort({ createdAt: -1 })
        .populate({ path: "course", select: "title" })
        .exec();
    } catch (error) {
      console.error("Database error inside bookmarkService.getAll:", error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      return await Bookmark.findById(id).lean();
    } catch (error) {
      console.error(
        `Database error inside bookmarkService.getById [${id}]:`,
        error,
      );
      throw error;
    }
  },

  async isBookmarked(learnerId: string, courseId: string) {
    const existing = await Bookmark.exists({
      learner: learnerId,
      course: courseId,
    });
    return Boolean(existing);
  },
};

export const workspaceNoteService = {
  async create(noteData: Partial<IWorkspaceNote>) {
    try {
      const newNote = new WorkspaceNote(noteData);
      const savedNote = await newNote.save();

      return savedNote.toObject();
    } catch (error) {
      console.error(
        "Database error inside workspaceNoteService.create:",
        error,
      );
      throw error;
    }
  },
  async getAll(learner: any) {
    try {
      return await WorkspaceNote.find({ learner: learner.id })
        .sort({ updatedAt: -1 }) // Order chronologically: recently edited notes first
        .populate({ path: "course" })
        .exec();
    } catch (error) {
      console.error(
        "Database error inside workspaceNoteService.getAll:",
        error,
      );
      throw error;
    }
  },
  async getById(id: string | string[]) {
    try {
      return await WorkspaceNote.findById(id).lean();
    } catch (error) {
      console.error(
        `Database error inside workspaceNoteService.getById [${id}]:`,
        error,
      );
      throw error;
    }
  },
};

export const todoService = {
  async create(todoData: Partial<ITodo>) {
    try {
      const newTodo = new Todo(todoData);
      const savedTodo = await newTodo.save();

      return savedTodo.toObject();
    } catch (error) {
      console.error("Database layer error inside todoService.create:", error);
      throw error;
    }
  },
  async getAll(learner: any) {
    try {
      // Sort strategy: Active tasks first, then sort by oldest deadlines
      return await Todo.find({ learner: learner.id })
        .sort({ done: 1, due: 1, createdAt: -1 })
        .lean()
        .exec();
    } catch (error) {
      console.error("Database error within todoService.getAll:", error);
      throw error;
    }
  },
  async update(id: string | string[], updateData: Partial<ITodo>) {
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true, // Return the modified document rather than the original
          runValidators: true, // Ensure the updates still match your schema rules
        },
      ).lean();

      return updatedTodo;
    } catch (error) {
      console.error(
        `Database layer error inside todoService.update [${id}]:`,
        error,
      );
      throw error;
    }
  },
};

export const goalService = {
  async create(goalData: Partial<IGoal>) {
    try {
      const newGoal = new Goal(goalData);
      const savedGoal = await newGoal.save();

      return savedGoal.toObject();
    } catch (error) {
      console.error("Database error inside goalService.create:", error);
      throw error;
    }
  },
  async getAll(learner: any) {
    try {
      return await Goal.find({ learner: learner.id })
        .sort({ createdAt: -1 }) // Sort chronologically: newest targets first
        .lean()
        .exec();
    } catch (error) {
      console.error("Database error inside goalService.getAll:", error);
      throw error;
    }
  },
};

export const enrollInCourse = async (
  learnerId: string,
  courseId: string | string[],
) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new AppError("Course not found", StatusCodes.NOT_FOUND);
      }

      const learner = await Learner.findById(learnerId).session(session);
      if (!learner) {
        throw new AppError("Learner not found", StatusCodes.NOT_FOUND);
      }

      const alreadyEnrolled = learner.enrolledCourses.some(
        (e: any) => e.courseId.toString() === courseId,
      );
      if (alreadyEnrolled) {
        throw new AppError(
          "Already enrolled in this course",
          StatusCodes.CONFLICT,
        );
      }

      learner.enrolledCourses.push({
        courseId: course._id,
        progress: 0,
      } as any);

      // Keep the learner's "Courses" stat card in sync
      const coursesStat = learner.stats.find((s: any) => s.label === "Courses");
      if (coursesStat) coursesStat.value += 1;

      await learner.save({ session });

      course.enrollmentsCount = (course.enrollmentsCount || 0) + 1;
      await course.save({ session });

      result = { course, progress: 0 };
    });
    return result;
  } finally {
    session.endSession();
  }
};

export const updateCourseProgress = async (
  learnerId: string,
  courseId: string | string[],
  progress: number,
) => {
  const learner = await Learner.findOne({
    _id: learnerId,
    "enrolledCourses.courseId": courseId,
  });

  if (!learner) {
    throw new AppError(
      "You are not enrolled in this course",
      StatusCodes.NOT_FOUND,
    );
  }

  const updated = await Learner.findOneAndUpdate(
    { _id: learnerId, "enrolledCourses.courseId": courseId },
    { $set: { "enrolledCourses.$.progress": progress } },
    { new: true, runValidators: true },
  );

  const tracking = updated?.enrolledCourses.find(
    (e: any) => e.courseId.toString() === courseId,
  );

  // Bump the "Completed" pathway: if this crosses 100%, increment Certificates stat
  if (progress === 100 && updated) {
    const certStat = updated.stats.find((s: any) => s.label === "Certificates");
    if (certStat) {
      certStat.value += 1;
      await updated.save();
    }
  }

  return { courseId, progress: tracking?.progress ?? progress };
};

export const unenrollFromCourse = async (
  learnerId: string,
  courseId: string | string[],
) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const learner = await Learner.findById(learnerId).session(session);
      if (!learner) {
        throw new AppError("Learner not found", StatusCodes.NOT_FOUND);
      }

      const index = learner.enrolledCourses.findIndex(
        (e: any) => e.courseId.toString() === courseId,
      );
      if (index === -1) {
        throw new AppError(
          "Not enrolled in this course",
          StatusCodes.NOT_FOUND,
        );
      }

      learner.enrolledCourses.splice(index, 1);
      const coursesStat = learner.stats.find((s: any) => s.label === "Courses");
      if (coursesStat && coursesStat.value > 0) coursesStat.value -= 1;
      await learner.save({ session });

      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { enrollmentsCount: -1 } },
        { session },
      );

      result = { courseId };
    });
    return result;
  } finally {
    session.endSession();
  }
};
