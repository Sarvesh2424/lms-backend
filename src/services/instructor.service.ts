import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Assignment } from "../models/Assignment.model";
import { Course } from "../models/Course.model";
import { Instructor } from "../models/Instructor.model";

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
