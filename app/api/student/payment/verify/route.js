// app/api/student/payment/verify/route.js

import crypto from "crypto";
import Payment from "@/Model/Payment";
import StudentFee from "@/Model/StudentFee";
import { connectDB } from "@/lib/mongo";
import { cookieStudent } from "@/lib/verifyCookie";
import { NextResponse } from "next/server";
import Student from "@/Model/Student";
import Course from "@/Model/Course";

export async function POST(req) {
  try {
    await cookieStudent(req);
    await connectDB();

    const studentId = req.cookies.get("student")?.value;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    // 🔐 verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    // ✅ find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      studentId,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 },
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // ✅ update payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "PAID";
    await payment.save();

    //update student current semester if payment is for current semester
    const totalsem = await Course.findOne({ courseCode: payment.courseCode })
      .select("totalSemesters")
      .lean();
    if (payment.semester > totalsem.totalSemesters) {
      return NextResponse.json(
        { success: false, message: "Invalid semester number" },
        { status: 400 },
      );
    }

    // ✅ update student fee
    const studentFee = await StudentFee.findOne({
      studentId: payment.studentId,
      courseCode: payment.courseCode,
      semester: payment.semester,
    });

    if (studentFee) {
      studentFee.amountPaid += payment.amount;

      const remaining = studentFee.SemesterFees - studentFee.amountPaid;

      if (remaining <= 0) {
        studentFee.status = "PAID";
        studentFee.amountPaid = studentFee.SemesterFees;
      } else {
        studentFee.status = "PARTIAL";
      }

      await studentFee.save();
    }

    const student = await Student.findById(studentId).select("currentSemester");

    if (
      payment.semester === student.currentSemester &&
      student.currentSemester < totalsem.totalSemesters
    ) {
      await Student.findByIdAndUpdate(studentId, {
        $inc: { currentSemester: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 },
    );
  }
}
