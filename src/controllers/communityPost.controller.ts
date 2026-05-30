import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { returnSuccessResponse } from "../utils/apiout";
import { createPost, getPosts } from "../services/communityPost.service";

export const createPostController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Ensure user context was injected safely by authMiddleware
    // if (!req.user || !req.user.id) {
    //   throw new AppError("Authentication required to post", StatusCodes.UNAUTHORIZED);
    // }

    // Prep data payload—assigning the authenticated user's ID as the post author
    const postPayload = {
      ...req.body,
    //   author: req.user.id,
      replies: [], 
      likes: 0,
      trending: false,
    };

    const newPost = await createPost(postPayload);

    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Community post published successfully",
      post: newPost,
    });
  }
);

export const getPostsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const group = req.query.group as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { posts, totalCount, totalPages } = await getPosts({ group, page, limit });

    returnSuccessResponse(res, StatusCodes.OK, {
      posts,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  }
);