import { NextResponse } from "next/server";

export const successResponse = (data: any, message = "Success", statusCode = 200) => {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
};

export const errorResponse = (message = "Internal Server Error", statusCode = 500) => {
  return NextResponse.json({ success: false, error: message }, { status: statusCode });
};

export const paginationMeta = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
