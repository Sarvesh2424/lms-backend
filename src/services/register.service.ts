import bcrypt from "bcrypt";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Learner } from "../models/Learner.model";
import { LearnerProfileInput } from "../schemas/learner.schema";
import { Instructor } from "../models/Instructor.model";

export const registerLearner = async (payload: LearnerProfileInput) => {
  const { email, name, password, initials } = payload;

  const existingLearner = await Learner.findOne({
    email: email.toLowerCase(),
  });
  if (existingLearner) {
    throw new AppError(
      "A user with this email already exists",
      StatusCodes.CONFLICT,
    );
  }

  // Hash the plain text password safely
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const formattedInitials = initials
    ? initials.toUpperCase()
    : name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3);

  const learner = await Learner.create({
    name,
    password: hashedPassword,
    initials: formattedInitials,
    email: email.toLowerCase(),
  });

  // Convert to object and strip the password out before passing to controller
  const learnerObject = learner.toObject();
  delete learnerObject.password;

  return learnerObject;
};

export const registerInstructor = async (payload: any) => {
  const { email, name, password, initials } = payload;

  const existingInstructor = await Instructor.findOne({
    email: email.toLowerCase(),
  });
  if (existingInstructor) {
    throw new AppError(
      "A user with this email already exists",
      StatusCodes.CONFLICT,
    );
  }

  // Hash the plain text password safely
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const instructor = await Instructor.create({
    name,
    password: hashedPassword,
    email: email.toLowerCase(),
  });

  // Convert to object and strip the password out before passing to controller
  const instructorObject = instructor.toObject();
  delete instructorObject.password;

  return instructorObject;
};
