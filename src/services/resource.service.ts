import mongoose from "mongoose";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Resource } from "../models/Resource.model";
import { Course } from "../models/Course.model";
import crypto from "crypto";

const toCourseId = (course?: string) => {
  if (!course || course === "all") return null;
  if (!mongoose.Types.ObjectId.isValid(course)) {
    throw new AppError("Invalid course id", StatusCodes.BAD_REQUEST);
  }
  return new mongoose.Types.ObjectId(course);
};

export const createUploadedResource = async (
  instructorId: string,
  payload: {
    name: string;
    type: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    course?: string;
  },
) => {
  const courseId = toCourseId(payload.course);
  if (courseId) {
    const course = await Course.findOne({
      _id: courseId,
      instructor: instructorId,
    });
    if (!course)
      throw new AppError(
        "Course not found or not owned by you",
        StatusCodes.NOT_FOUND,
      );
  }

  return Resource.create({
    instructor: instructorId,
    course: courseId,
    name: payload.name,
    type: payload.type,
    mimeType: payload.mimeType,
    sizeBytes: payload.sizeBytes,
    url: payload.url,
    isExternalLink: false,
  });
};

export const createLinkResource = async (
  instructorId: string,
  payload: { name: string; url: string; course?: string },
) => {
  const courseId = toCourseId(payload.course);
  if (courseId) {
    const course = await Course.findOne({
      _id: courseId,
      instructor: instructorId,
    });
    if (!course)
      throw new AppError(
        "Course not found or not owned by you",
        StatusCodes.NOT_FOUND,
      );
  }

  return Resource.create({
    instructor: instructorId,
    course: courseId,
    name: payload.name,
    type: "link",
    mimeType: "",
    sizeBytes: 0,
    url: payload.url,
    isExternalLink: true,
  });
};

export const listResources = async (
  instructorId: string,
  filters: {
    course?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
) => {
  const query: Record<string, any> = { instructor: instructorId };

  if (filters.course && filters.course !== "all") {
    query.course = toCourseId(filters.course);
  }
  if (filters.type) query.type = filters.type;
  if (filters.search) query.name = { $regex: filters.search, $options: "i" };

  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Resource.find(query)
      .populate({ path: "course", select: "title" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Resource.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getResourceStats = async (instructorId: string) => {
  const stats = await Resource.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$sizeBytes" },
      },
    },
  ]);

  const byType: Record<string, number> = {
    pdf: 0,
    doc: 0,
    video: 0,
    image: 0,
    link: 0,
    other: 0,
  };
  let totalCount = 0;
  let totalBytes = 0;

  for (const row of stats) {
    byType[row._id] = row.count;
    totalCount += row.count;
    totalBytes += row.totalSize;
  }

  return { byType, totalCount, totalBytes };
};

const assertOwnership = async (instructorId: string, resourceId: string) => {
  const resource = await Resource.findOne({
    _id: resourceId,
    instructor: instructorId,
  });
  if (!resource)
    throw new AppError("Resource not found", StatusCodes.NOT_FOUND);
  return resource;
};

export const deleteResource = async (
  instructorId: string,
  resourceId: string | string[],
) => {
  const resource = await assertOwnership(instructorId, resourceId as string);
  await resource.deleteOne();
  // Note: this does not delete the underlying S3 object. Add an S3 DeleteObjectCommand
  // call here (keyed off the stored url) if you want storage reclaimed on delete.
};

export const toggleResourceShare = async (
  instructorId: string,
  resourceId: string | string[],
) => {
  const resource = await assertOwnership(instructorId, resourceId as string);

  if (resource.shareToken) {
    resource.shareToken = null;
    await resource.save();
    return { shared: false, shareToken: null };
  }

  resource.shareToken = crypto.randomBytes(16).toString("hex");
  await resource.save();
  return { shared: true, shareToken: resource.shareToken };
};

export const recordResourceDownload = async (
  instructorId: string,
  resourceId: string | string[],
) => {
  const resource = await assertOwnership(instructorId, resourceId as string);
  resource.downloadCount += 1;
  await resource.save();
  return resource;
};
