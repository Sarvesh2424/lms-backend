import { Assignment } from "../models/Assignment.model";

export const assignmentService = {
  async getAll() {
    try {
      return await Assignment.find()
        .sort({ due: 1 })
        .populate({ path: "course" }) // Order chronologically by default
        .lean();
    } catch (error) {
      console.error("Database error inside assignmentService.getAll:", error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      return await Assignment.findById(id).lean();
    } catch (error) {
      console.error(
        `Database error inside assignmentService.getById [${id}]:`,
        error,
      );
      throw error;
    }
  },
};
