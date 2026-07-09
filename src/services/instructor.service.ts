import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Assignment } from "../models/Assignment.model";
import { Course } from "../models/Course.model";
import { Instructor } from "../models/Instructor.model";

export const getInstructorProfile = async (instructorId: string) => {
  const instructor = await Instructor.findById(instructorId)
    .select("-password")
    .lean();

  if (!instructor) {
    throw new AppError("Instructor not found", StatusCodes.NOT_FOUND);
  }

  // Aggregate stats from the Course collection rather than storing
  // denormalized counters on the instructor doc — courses/ratings change
  // independently, so compute them live rather than risk drift.
  const stats = await Course.aggregate([
    { $match: { instructor: instructor._id } },
    {
      $group: {
        _id: null,
        coursesCount: { $sum: 1 },
        totalEnrollments: { $sum: "$enrollmentsCount" },
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: "$reviews" },
      },
    },
  ]);

  const agg = stats[0] || {
    coursesCount: 0,
    totalEnrollments: 0,
    avgRating: 0,
    totalReviews: 0,
  };

  return {
    ...instructor,
    coursesCount: agg.coursesCount,
    studentsCount: agg.totalEnrollments,
    avgRating: agg.avgRating ? Math.round(agg.avgRating * 10) / 10 : 0,
    reviewsCount: agg.totalReviews,
  };
};

export const updateInstructorProfile = async (
  instructorId: string,
  updates: Partial<{
    name: string;
    title: string;
    bio: string;
    location: string;
    website: string;
    expertise: string[];
  }>,
) => {
  const updated = await Instructor.findByIdAndUpdate(
    instructorId,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .select("-password")
    .lean();

  if (!updated) {
    throw new AppError("Instructor not found", StatusCodes.NOT_FOUND);
  }

  return updated;
};

export const createCourse = async (courseData: any) => {
  // Relational Validation: Verify the targeted instructor exists in your database
  const instructorExists = await Instructor.findById(courseData.instructor);
  if (!instructorExists) {
    throw new AppError(
      `Assignment failed: Instructor with ID '${courseData.instructor}' does not exist.`,
      StatusCodes.NOT_FOUND,
    );
  }

  // Check for duplicate course titles to safeguard collection unique indices
  const duplicateTitle = await Course.findOne({ title: courseData.title });
  if (duplicateTitle) {
    throw new AppError(
      "A course with this title already exists.",
      StatusCodes.CONFLICT,
    );
  }

  const newCourse = await Course.create(courseData);

  return await newCourse.populate({
    path: "instructor",
    select: "name email", // Pull safe public presentation details
  });
};

export const assignmentService = {
  async create(assignmentData: any) {
    try {
      const courseExists = await Course.findById(assignmentData.course);
      if (!courseExists) {
        throw new AppError(
          `Assignment failed: Instructor with ID '${assignmentData.course}' does not exist.`,
          StatusCodes.NOT_FOUND,
        );
      }
      const newAssignment = new Assignment(assignmentData);
      const savedAssignment = await newAssignment.save();

      return savedAssignment.toObject();
    } catch (error) {
      throw new AppError(
        "Database error inside assignmentService.create:" + error,
        StatusCodes.BAD_REQUEST,
      );
    }
  },
};
