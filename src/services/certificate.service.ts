import mongoose from "mongoose";
import { StatusCodes } from "../common/errors/statusCodes";
import { AppError } from "../common/errors/api-error";
import { CertificateTemplate } from "../models/CertificateTemplate.model";
import { CourseCertificate } from "../models/CourseCertificate.model";
import { IssuedCertificate } from "../models/IssuedCertificate.model";
import { Course } from "../models/Course.model";
import { Learner } from "../models/Learner.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";

// ---------- Templates ----------

export const createTemplate = async (instructorId: string, data: any) => {
  try {
    return await CertificateTemplate.create({
      ...data,
      instructor: instructorId,
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError(
        "A template with this name already exists.",
        StatusCodes.CONFLICT,
      );
    }
    throw err;
  }
};

export const updateTemplate = async (
  templateId: string | string[],
  instructorId: string,
  data: any,
) => {
  const template = await CertificateTemplate.findOneAndUpdate(
    { _id: templateId, instructor: instructorId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!template) {
    throw new AppError(
      "Template not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }
  return template;
};

export const duplicateTemplate = async (
  templateId: string | string[],
  instructorId: string,
) => {
  const source = await CertificateTemplate.findOne({
    _id: templateId,
    instructor: instructorId,
  }).lean();
  if (!source) {
    throw new AppError(
      "Template not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }

  const { _id, createdAt, updatedAt, usageCount, name, ...rest } =
    source as any;
  let candidateName = `${name} (copy)`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await CertificateTemplate.create({
        ...rest,
        name: candidateName,
        instructor: instructorId,
        usageCount: 0,
      });
    } catch (err: any) {
      if (err?.code !== 11000) throw err;
      candidateName = `${name} (copy ${Math.random().toString(36).slice(2, 5)})`;
    }
  }
  throw new AppError(
    "Could not duplicate template, please try again.",
    StatusCodes.CONFLICT,
  );
};

export const deleteTemplate = async (
  templateId: string | string[],
  instructorId: string,
) => {
  const template = await CertificateTemplate.findOne({
    _id: templateId,
    instructor: instructorId,
  });
  if (!template) {
    throw new AppError(
      "Template not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }
  if (template.usageCount > 0) {
    throw new AppError(
      "This template is assigned to one or more courses. Reassign those courses to a different template first.",
      StatusCodes.CONFLICT,
    );
  }
  await CertificateTemplate.deleteOne({ _id: templateId });
};

export const getTemplateById = async (
  templateId: string | string[],
  instructorId: string,
) => {
  const template = await CertificateTemplate.findOne({
    _id: templateId,
    instructor: instructorId,
  });
  if (!template) {
    throw new AppError(
      "Template not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }
  return template;
};

export const listTemplates = (instructorId: string) =>
  CertificateTemplate.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .lean();

// ---------- Course certificates (course -> exactly one, template reusable) ----------

export const upsertCourseCertificate = async (
  courseId: string | string[],
  instructorId: string,
  data: {
    templateId: string;
    minCompletionPct: number;
    minQuizScorePct: number;
    requireCapstone: boolean;
    expiresAfterMonths: number;
    autoIssue: boolean;
  },
) => {
  const courseExists = await Course.exists({
    _id: courseId,
    instructor: instructorId,
  });
  if (!courseExists) {
    throw new AppError(
      "Course not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }

  const template = await CertificateTemplate.findOne({
    _id: data.templateId,
    instructor: instructorId,
  });
  if (!template) {
    throw new AppError(
      "Certificate template not found or you do not have access to it.",
      StatusCodes.NOT_FOUND,
    );
  }

  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const existing = await CourseCertificate.findOne({
        course: courseId,
      }).session(session);

      result = await CourseCertificate.findOneAndUpdate(
        { course: courseId, instructor: instructorId },
        {
          $set: {
            template: template._id,
            minCompletionPct: data.minCompletionPct,
            minQuizScorePct: data.minQuizScorePct,
            requireCapstone: data.requireCapstone,
            expiresAfterMonths: data.expiresAfterMonths,
            autoIssue: data.autoIssue,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          session,
        },
      );

      const templateChanged =
        existing && String(existing.template) !== String(template._id);
      if (templateChanged) {
        await CertificateTemplate.findByIdAndUpdate(
          existing!.template,
          { $inc: { usageCount: -1 } },
          { session },
        );
      }
      if (!existing || templateChanged) {
        await CertificateTemplate.findByIdAndUpdate(
          template._id,
          { $inc: { usageCount: 1 } },
          { session },
        );
      }
    });
    return await result.populate({ path: "template" });
  } finally {
    session.endSession();
  }
};

export const getCourseCertificate = async (
  courseId: string | string[],
  instructorId: string,
) =>
  CourseCertificate.findOne({
    course: courseId,
    instructor: instructorId,
  }).populate("template");

export const listCourseCertificates = (instructorId: string) =>
  CourseCertificate.find({ instructor: instructorId })
    .populate("template")
    .populate({ path: "course", select: "title thumbnail status" })
    .sort({ createdAt: -1 })
    .lean();

export const deleteCourseCertificate = async (
  courseId: string | string[],
  instructorId: string,
) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const cert = await CourseCertificate.findOne({
        course: courseId,
        instructor: instructorId,
      }).session(session);
      if (!cert) {
        throw new AppError(
          "No certificate is configured for this course.",
          StatusCodes.NOT_FOUND,
        );
      }
      if (cert.issuedCount > 0) {
        throw new AppError(
          "Certificates have already been issued for this course. Revoke them individually instead of deleting the configuration.",
          StatusCodes.CONFLICT,
        );
      }
      await CertificateTemplate.findByIdAndUpdate(
        cert.template,
        { $inc: { usageCount: -1 } },
        { session },
      );
      await CourseCertificate.deleteOne({ _id: cert._id }).session(session);
    });
  } finally {
    session.endSession();
  }
};

// ---------- Issuance ----------

export const issueCertificate = async (
  courseId: string | string[],
  instructorId: string,
  data: { learnerId: string; score: number }, // was studentId
) => {
  const cert = await CourseCertificate.findOne({
    course: courseId,
    instructor: instructorId,
  });
  if (!cert) {
    throw new AppError(
      "This course has no certificate configured yet. Set one up before issuing.",
      StatusCodes.NOT_FOUND,
    );
  }
  if (data.score < cert.minQuizScorePct) {
    throw new AppError(
      `Score must be at least ${cert.minQuizScorePct}% to meet this course's issue conditions.`,
      StatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [course, learner] = await Promise.all([
    Course.findById(courseId).select("title"),
    Learner.findById(data.learnerId).select("name"),
  ]);
  if (!learner) {
    throw new AppError("Recipient not found.", StatusCodes.NOT_FOUND);
  }

  const expiresAt =
    cert.expiresAfterMonths > 0
      ? new Date(
          Date.now() + cert.expiresAfterMonths * 30 * 24 * 60 * 60 * 1000,
        )
      : null;

  const session = await mongoose.startSession();
  try {
    let issued: any;
    await session.withTransaction(async () => {
      const [created] = await IssuedCertificate.create(
        [
          {
            course: courseId as string,
            instructor: instructorId,
            template: cert.template,
            courseCertificate: cert._id,
            learner: data.learnerId,
            recipientName: (learner as any).name,
            courseTitle: course?.title ?? "",
            score: data.score,
            expiresAt,
          },
        ],
        { session },
      );
      await CourseCertificate.findByIdAndUpdate(
        cert._id,
        { $inc: { issuedCount: 1 } },
        { session },
      );
      issued = created;
    });
    return issued;
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError(
        "This learner already holds a certificate for this course.",
        StatusCodes.CONFLICT,
      );
    }
    throw err;
  } finally {
    session.endSession();
  }
};

export const listIssuedCertificates = (
  instructorId: string,
  opts: { courseId?: string; search?: string } = {},
) => {
  const filter: Record<string, any> = { instructor: instructorId };
  if (opts.courseId) filter.course = opts.courseId;
  if (opts.search)
    filter.recipientName = { $regex: opts.search, $options: "i" };
  return IssuedCertificate.find(filter).sort({ issuedAt: -1 }).lean();
};

export const revokeCertificate = async (
  certificateId: string | string[],
  instructorId: string,
) => {
  const updated = await IssuedCertificate.findOneAndUpdate(
    { _id: certificateId, instructor: instructorId, status: "issued" },
    { $set: { status: "revoked", revokedAt: new Date() } },
    { new: true },
  );
  if (!updated) {
    throw new AppError(
      "Certificate not found or already revoked.",
      StatusCodes.NOT_FOUND,
    );
  }
  return updated;
};

// Public - no instructor scoping, used by the verification page
export const verifyCertificate = async (
  verificationCode: string | string[],
) => {
  const cert = await IssuedCertificate.findOne({ verificationCode })
    .select("recipientName courseTitle score status issuedAt expiresAt")
    .lean();
  if (!cert) {
    throw new AppError(
      "No certificate found for this verification code.",
      StatusCodes.NOT_FOUND,
    );
  }
  const isExpired = cert.expiresAt
    ? new Date(cert.expiresAt).getTime() < Date.now()
    : false;
  return { ...cert, isValid: cert.status === "issued" && !isExpired };
};

export const uploadCertificateAsset = async (
  instructorId: string,
  file: { buffer: Buffer; mimetype: string },
  kind: "logo" | "signature",
) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(
      "Only image files are allowed.",
      StatusCodes.BAD_REQUEST,
    );
  }
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new AppError(
      "AWS_BUCKET_NAME is missing from your server environment variables.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const key = `uploads/lms/certificates/${kind}/${instructorId}/${Date.now()}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  });

  await s3.send(command);

  return {
    url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};

export const getLearnerCertificateOverview = async (learnerId: string) => {
  const learner = await Learner.findById(learnerId)
    .select("enrolledCourses")
    .lean();
  if (!learner) {
    throw new AppError("Learner not found", StatusCodes.NOT_FOUND);
  }

  const enrolledMap = new Map(
    (learner.enrolledCourses ?? []).map((e: any) => [
      String(e.courseId),
      e.progress as number,
    ]),
  );
  const enrolledCourseIds = [...enrolledMap.keys()];

  const [issuedCerts, courseCerts] = await Promise.all([
    IssuedCertificate.find({ learner: learnerId })
      .populate("template")
      .populate({ path: "course", select: "title" })
      .sort({ issuedAt: -1 })
      .lean(),
    CourseCertificate.find({})
      .populate("template")
      .populate({ path: "course", select: "title instructor status" })
      .lean(),
  ]);

  const issuedCourseIds = new Set(
    issuedCerts.map((c: any) => String(c.course?._id ?? c.course)),
  );

  const earned = issuedCerts.map((c: any) => ({
    id: String(c._id),
    courseId: String(c.course?._id ?? c.course),
    courseTitle: c.courseTitle,
    recipientName: c.recipientName,
    score: c.score,
    status: c.status,
    issuedAt: c.issuedAt,
    expiresAt: c.expiresAt,
    verificationCode: c.verificationCode,
    certificateTitle: c.template?.title ?? "Certificate of Completion",
    certificateDescription:
      c.template?.description ?? "has successfully completed",
    backgroundStyle: c.template?.backgroundStyle ?? "aurora",
    logoUrl: c.template?.logoUrl,
    signatureUrl: c.template?.signatureUrl,
  }));

  const inProgress: any[] = [];
  const locked: any[] = [];

  for (const cc of courseCerts as any[]) {
    const courseId = String(cc.course?._id ?? cc.course);
    if (!cc.course || issuedCourseIds.has(courseId)) continue; // already earned, or course was deleted

    if (enrolledMap.has(courseId)) {
      inProgress.push({
        courseId,
        courseTitle: cc.course.title,
        progress: enrolledMap.get(courseId) ?? 0,
        minCompletionPct: cc.minCompletionPct,
      });
    } else {
      locked.push({
        courseId,
        courseTitle: cc.course.title,
      });
    }
  }

  return { earned, inProgress, locked };
};
