import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  bookmarkService,
  getCourseById,
  getCourses,
  getLearnerProfile,
  goalService,
  todoService,
  workspaceNoteService,
} from "../services/learner.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { learningPathService } from "../services/learningPath.service";
import { assignmentService } from "../services/assignment.service";

export const getLearnerProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = (req as any).user.id;
    const learner = await getLearnerProfile(id);
    returnSuccessResponse(res, StatusCodes.OK, learner);
  },
);

export const getCoursesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filters = req.query;
    const learnerData = req.user;
    const courses = await getCourses(filters, learnerData);

    returnSuccessResponse(res, StatusCodes.OK, courses);
  },
);

export const getCourseByIdController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const learnerData = req.user;

    const course = await getCourseById(courseId, learnerData);

    if (!course) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Course not found",
      });
    }

    returnSuccessResponse(res, StatusCodes.OK, course);
  },
);

export const getLearningPathsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const paths = await learningPathService.getAll(user);

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Learning paths retrieved successfully",
      learningPaths: paths,
    });
  },
);

export const getLearningPathByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const path = await learningPathService.getById(id);

    if (!path) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Learning path framework with reference ID [${id}] could not be found.`,
      });
      return;
    }

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Learning path details retrieved successfully",
      learningPath: path,
    });
  },
);

export const getAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignments = await assignmentService.getAll();

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Assignments retrieved successfully",
      assignments,
    });
  },
);

export const createBookmarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newBookmark = await bookmarkService.create(validatedData);

    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Bookmark saved successfully",
      bookmark: {
        id: newBookmark._id, // Normalize standard database reference key
        ...newBookmark,
      },
    });
  },
);

export const getBookmarksController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const bookmarks = await bookmarkService.getAll(user);

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Bookmarks directory compiled successfully",
      bookmarks,
    });
  },
);

export const createWorkspaceNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newNote = await workspaceNoteService.create(validatedData);

    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Note saved to workspace successfully",
      note: {
        id: newNote._id, // Normalize database primary key field
        title: newNote.title,
        excerpt: newNote.excerpt,
        course: newNote.course,
        updated: newNote.updatedAt, // Map Mongoose timestamp directly back to your frontend expectations
      },
    });
  },
);

export const getWorkspaceNotesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const learner = req.user;
    const rawNotes = await workspaceNoteService.getAll(learner);

    // Transform Mongoose 'updatedAt' field to map cleanly to the frontend 'updated' property structure
    const notes = rawNotes.map((note) => ({
      id: note._id,
      title: note.title,
      excerpt: note.excerpt,
      course: note.course,
      updated: note.updatedAt,
    }));

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Workspace notes directory compiled successfully",
      notes,
    });
  },
);

export const getWorkspaceNoteByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const note = await workspaceNoteService.getById(id);

    if (!note) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Workspace note with reference ID [${id}] could not be found.`,
      });
      return;
    }

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Workspace note details retrieved successfully",
      note: {
        id: note._id,
        title: note.title,
        excerpt: note.excerpt,
        course: note.course,
        updated: note.updatedAt,
      },
    });
  },
);

export const createTodoController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newTodo = await todoService.create(validatedData);

    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Task item added to planner array successfully",
      todo: {
        id: newTodo._id,
        label: newTodo.label,
        done: newTodo.done,
        due: newTodo.due || null, // Delivers standard ISO format dates back to client queries
      },
    });
  },
);

export const getTodosController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const learner = req.user;
    const rawTodos = await todoService.getAll(learner);

    // Re-map the structure cleanly to mirror what your frontend route expect
    const dynamicTodos = rawTodos.map((t: any) => ({
      id: t._id,
      label: t.label,
      done: t.done,
      due: t.due ? new Date(t.due).toISOString() : null,
    }));

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Workspace task lists loaded successfully.",
      todos: dynamicTodos,
    });
  },
);

export const updateTodoController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = req.body;

    const updatedTodo = await todoService.update(id, validatedData);

    if (!updatedTodo) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Task tracking point with ID [${id}] could not be found.`,
      });
      return;
    }

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Task item updated successfully.",
      todo: {
        id: updatedTodo._id,
        label: updatedTodo.label,
        done: updatedTodo.done,
        due: updatedTodo.due || null,
      },
    });
  },
);

export const createGoalController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newGoal = await goalService.create(validatedData);

    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Learning goal created successfully.",
      goal: {
        id: newGoal._id, // Map standard BSON object identification string keys
        label: newGoal.label,
        current: newGoal.current,
        target: newGoal.target,
        unit: newGoal.unit,
      },
    });
  },
);

export const getGoalsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const learner = req.user;
    const rawGoals = await goalService.getAll(learner);

    // Map the database structure cleanly to match your frontend Goal interface
    const goals = rawGoals.map((g: any) => ({
      id: g._id,
      label: g.label,
      current: g.current,
      target: g.target,
      unit: g.unit,
    }));

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Workspace metrics directory compiled successfully.",
      goals,
    });
  },
);
