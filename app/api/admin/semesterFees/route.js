import { NextResponse } from "next/server";
import SemesterFee from "@/Model/SemesterFee";
import { connectDB } from "@/lib/mongo";
import { cookieAdmin } from "@/lib/verifyCookie";
import StudentFee from "@/Model/StudentFee";

//to create a new semester fee record
export async function POST(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { courseCode, semester, totalFees } = await req.json();
    if (!courseCode || !semester || !totalFees) {
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 400 },
      );
    }

    const existingSemesterFee = await SemesterFee.findOne({
      courseCode: courseCode.toUpperCase(),
      semester,
    });

    if (existingSemesterFee) {
      return NextResponse.json(
        {
          message: "Semester fee for this course and semester already exists",
          success: false,
        },
        { status: 409 },
      );
    }

    const semesterFee = new SemesterFee({
      courseCode: courseCode.toUpperCase(),
      semester,
      totalFees,
    });

    await semesterFee.save();

    return NextResponse.json(
      {
        message: "Semester fee created successfully",
        success: true,
        semesterFee,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating semester fee:", error);
    return NextResponse.json(
      { message: "Failed to create semester fee", success: false },
      { status: 500 },
    );
  }
}

//to delete semester fee record

export async function DELETE(req) {
  try {
    await cookieAdmin(req);
    await connectDB();

    const { courseCode, semester } = await req.json();

    if (!courseCode || !semester) {
      return NextResponse.json({
        message: "courseCode and semester are required",
        success: false,
      });
    }

    const deletedFee = await SemesterFee.findOneAndDelete({
      courseCode: courseCode.toUpperCase(),
      semester,
    });

    if (!deletedFee) {
      return NextResponse.json(
        {
          message: "Semester fee not found",
          success: false,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Deleted Successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting semester fee:", error);
    return NextResponse.json(
      { message: "Failed to delete semester fee", success: false },
      { status: 500 },
    );
  }
}

//to update semester fee record
export async function PUT(req) {
  try {
    await cookieAdmin(req);
    await connectDB();
    const { courseCode, semester, totalFees } = await req.json();

    if (!courseCode || !semester || !totalFees) {
      return NextResponse.json(
        {
          message: "courseCode, semester and totalFees are required",
          success: false,
        },
        { status: 400 },
      );
    }

    await StudentFee.findOneAndUpdate(
      {
        courseCode: courseCode.toUpperCase(),
        semester,
      },
      {
        SemesterFees: totalFees,
      },
    );

    const updatedSemesterFee = await SemesterFee.findOneAndUpdate(
      { courseCode: courseCode.toUpperCase(), semester },
      { totalFees },
      { new: true },
    );

    if (!updatedSemesterFee) {
      return NextResponse.json(
        {
          message: "Semester fee not found",
          success: false,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Semester fee updated successfully",
        success: true,
        updatedSemesterFee,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating semester fee:", error);
    return NextResponse.json(
      { message: "Failed to update semester fee", success: false },
      { status: 500 },
    );
  }
}

//to get all semester fee records
export async function GET(req) {
  try {
    await connectDB();

    const semesterFees = await SemesterFee.find().sort({
      courseCode: 1,
      semester: 1,
    });

    return NextResponse.json(
      {
        success: true,
        data: semesterFees,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching semester fees:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch semester fees" },
      { status: 500 },
    );
  }
}
