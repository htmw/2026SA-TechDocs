import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Recommend endpoint is working"
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    message: "Recommendation endpoint working",
    received: body
  });
}