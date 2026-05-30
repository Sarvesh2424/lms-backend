import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { CommunityPost } from "../models/CommunityPost.model";
import { StudyGroup } from "../models/StudyGroup.model";

export const createPost = async (postData: any) => {
  // Relational Integrity Check: Ensure target group name/id exists before creating post
  const groupExists = await StudyGroup.findOne({
    _id: postData.group,
    active: true,
  });

  if (!groupExists) {
    throw new AppError(
      `Cannot post to group '${postData.group}': Group does not exist or is inactive.`,
      StatusCodes.NOT_FOUND,
    );
  }

  const createdPost = await CommunityPost.create(postData);

  // Hydrate the document reference fields (populate creator details) before returning to user
  const populatedPost = await createdPost.populate({
    path: "author",
    select: "name email initials title",
  });

  const result = await populatedPost.populate({
    path: "group",
    select: "name members active",
  });

  return result;
};

export const getPosts = async ({
  group,
  page,
  limit,
}: {
  group: string | undefined;
  page: number;
  limit: number;
}) => {
  // Construct dynamic matching filters based on client context
  const queryFilter: any = {};
  if (group) {
    queryFilter.group = group;
  }

  // Calculate skipping offsets for standard window pagination
  const skipOffset = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    CommunityPost.find(queryFilter)
      .sort({ trending: -1, createdAt: -1 }) // Prioritize hot trends and newest posts
      .skip(skipOffset)
      .limit(limit)
      .populate({
        path: "author",
        select: "name email initials title",
      })
      .populate({
        path: "replies.userId",
        select: "name initials title",
      })
      .populate({
        path: "group",
        select: "name members active",
      })
      .exec(),
    CommunityPost.countDocuments(queryFilter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    posts,
    totalCount,
    totalPages,
  };
};
