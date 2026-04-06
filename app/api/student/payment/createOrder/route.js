import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { connectDB } from "@/lib/mongo";
import { cookieStudent } from "@/lib/verifyCookie";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import Student from "@/Model/Student";
import Course from "@/Model/Course";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await cookieStudent(req);
    await connectDB();

    const studentId = req.cookies.get("student")?.value;
    if (!studentId) {
      return NextResponse.json(
        { message: "Student not authenticated", success: false },
        { status: 401 },
      );
    }
    const { semester, courseCode, amount } = await req.json();

    const sem = await Course.findOne({ courseCode }).select("totalSemesters");

    if (sem && (semester < 1 || semester > sem.totalSemesters)) {
      return NextResponse.json(
        { success: false, message: "Invalid semester number" },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 },
      );
    }

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    const paymentrecord = new Payment({
      studentId,
      courseCode,
      semester,
      razorpayOrderId: order.id,
      amount,
      razorpayPaymentId: "", // Temporary, will be updated after payment verification
      razorpaySignature: "", // Temporary, will be updated after payment verification
    });
    await paymentrecord.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Order creation failed" },
      { status: 500 },
    );
  }
}
