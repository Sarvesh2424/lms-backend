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
    .populate({
      path: "instructor",
      select: "name email",
    })
    .exec();

  const learnerDoc = await Learner.findById(learnerData.id);
  if (!courseDoc) return null;

  // Convert the Mongoose Document to a plain JavaScript object so we can add properties
  const course = courseDoc.toObject() as any;
  const learner = learnerDoc.toObject() as any;

  // Find if this user has a progress record matching this course's ID
  const tracking = learner.enrolledCourses.find(
    (item: any) => item.courseId.toString() === course._id.toString(),
  );

  // Inject the progress field directly into the backend response layout
  course.progress = tracking ? tracking.progress : 0;

  return course;
};

export const bookmarkService = {
  async create(bookmarkData: Partial<IBookmark>) {
    try {
      const newBookmark = new Bookmark(bookmarkData);
      const savedBookmark = await newBookmark.save();

      return savedBookmark.toObject();
    } catch (error) {
      console.error("Database error inside bookmarkService.create:", error);
      throw error;
    }
  },

  async getAll(learner: any) {
    try {
      const data = await Bookmark.find({ learner: learner.id })
        .sort({ savedAt: -1 })
        .populate({ path: "course", select: "title" })
        .exec(); // Order chronologically: newest saved bookmarks first
      return data;
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
  }
};
