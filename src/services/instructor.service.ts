import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Course } from "../models/Course.model";
import { Instructor } from "../models/Instructor.model";

export const createCourse = async (courseData: any) => {
  // Relational Validation: Verify the targeted instructor exists in your database
  const instructorExists = await Instructor.findById(courseData.instructor);
  if (!instructorExists) {
    throw new AppError(
      `Assignment failed: Instructor with ID '${courseData.instructor}' does not exist.`,
      StatusCodes.NOT_FOUND
    );
  }

  // Check for duplicate course titles to safeguard collection unique indices
  const duplicateTitle = await Course.findOne({ title: courseData.title });
  if (duplicateTitle) {
    throw new AppError(
      "A course with this title already exists.",
      StatusCodes.CONFLICT
    );
  }

  const newCourse = await Course.create(courseData);

  return await newCourse.populate({
    path: "instructor",
    select: "name email", // Pull safe public presentation details
  });
};