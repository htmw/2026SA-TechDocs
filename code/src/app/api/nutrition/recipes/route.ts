import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    return NextResponse.json({ message: "ROUTE NOT IMPLEMENTED" }, { status: 501 });
}