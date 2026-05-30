import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Course } from "../models/Course.model";
import { Learner } from "../models/Learner.model";

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
