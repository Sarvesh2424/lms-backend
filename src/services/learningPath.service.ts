import { Course } from "../models/Course.model";
import { Learner } from "../models/Learner.model";
import { LearningPath } from "../models/LearningPath.model";

export const learningPathService = {
  async create(pathData: any) {
    try {
      const courseIds = pathData.steps.map((step: any) => step.courseId);

      // Fetch all matching courses from the database
      const fetchedCourses = await Course.find({ _id: { $in: courseIds } });

      // Map the fetched courses back to match the order of IDs sent in the payload
      const enrichedSteps = pathData.steps.map((step: any) => {
        const matchingCourse = fetchedCourses.find(
          (c) => c._id.toString() === step.courseId.toString(),
        );

        if (!matchingCourse) {
          throw new Error(
            `Course with ID ${step.courseId} not found in database.`,
          );
        }

        // Map the required step fields using live data from the course document
        return {
          title: matchingCourse.title,
          description: matchingCourse.description,
          courseId: matchingCourse._id,
          status: "locked", // Default state for incoming paths
          durationHrs: matchingCourse.durationHrs || 0,
          level: matchingCourse.level || "Intermediate",
        };
      });

      // Overwrite the raw payload steps with your fully populated steps array
      const finalizedPathData = {
        ...pathData,
        steps: enrichedSteps,
      };

      const newPath = new LearningPath(finalizedPathData);
      const savedPath = await newPath.save();

      return savedPath.toObject();
    } catch (error) {
      console.error("Database error inside learningPathService.create:", error);
      throw error;
    }
  },
  async existsByTitle(title: string): Promise<boolean> {
    const count = await LearningPath.countDocuments({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });
    return count > 0;
  },

  async getAll(learnerData: any) {
    try {
      // Fetch all learning paths with populated course configurations
      const paths = await LearningPath.find()
        .populate(
          "steps.courseId",
          "title description level durationHrs thumbnail",
        )
        .lean();

      const userProgressRecords = await Learner.findById(learnerData.id).lean();

      // Create a quick-lookup map: [courseId -> isCompleted]
      const completedCoursesMap = new Map<string, boolean>();

      userProgressRecords.enrolledCourses.forEach((record: any) => {
        const courseRef = record.courseId?._id || record.courseId;
        if (!courseRef) return;

        const totalMinutes = (record.durationHrs || 0) * 60;
        const minutesLearned = record.progress || 0;

        // A course is complete if explicitly flagged, or if learned minutes meet total duration
        const isCompleted =
          record.isCompleted ||
          (totalMinutes > 0 && minutesLearned >= totalMinutes);

        completedCoursesMap.set(courseRef.toString(), isCompleted);
      });

      // Map over paths and dynamically compute sequential step statuses
      return paths.map((path: any,) => {
        let hasHitLock = false;
        let completedStepsCount = 0;

        const dynamicSteps = (path.steps || []).map((step: any) => {
          const courseDoc = step.courseId;
          const courseIdStr =
            courseDoc?._id?.toString() || courseDoc?.toString();

          const isCourseDone = courseIdStr
            ? !!completedCoursesMap.get(courseIdStr)
            : false;
          let calculatedStatus: "done" | "active" | "locked" = "locked";

          if (isCourseDone) {
            calculatedStatus = "done";
            completedStepsCount++;
          } else if (!hasHitLock) {
            // This is the very first incomplete course in the timeline chain
            calculatedStatus = "active";
            hasHitLock = true; // Any course after this automatically becomes locked
          } else {
            calculatedStatus = "locked";
          }

          return {
            ...step,
            status: calculatedStatus,
          };
        });

        // 4. Calculate overall learning path progress percentage based on completed steps
        const totalSteps = dynamicSteps.length;
        const calculatedPathProgress =
          totalSteps > 0
            ? Math.min(
                Math.round((completedStepsCount / totalSteps) * 100),
                100,
              )
            : 0;

        return {
          ...path,
          progress: calculatedPathProgress,
          steps: dynamicSteps,
        };
      });
    } catch (error) {
      console.error("Database error inside learningPathService.getAll:", error);
      throw error;
    }
  },

  async getById(id: string | string[]) {
    try {
      return await LearningPath.findById(id)
        .populate(
          "steps.courseId",
          "title description level durationHrs thumbnail",
        )
        .lean();
    } catch (error) {
      console.error(
        `Database error inside learningPathService.getById [${id}]:`,
        error,
      );
      throw error;
    }
  },
};
