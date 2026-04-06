import { connectDB } from "@/lib/mongo";
import { NextResponse } from "next/server";
import Admin from "@/Model/Admin";
import { hashPassword } from "@/lib/auth";
import { cookieAdmin } from "@/lib/verifyCookie";
//to create a new admin
export async function POST(req) {
  // admin1@gmail.com admin123
  try {
    await connectDB();
    await cookieAdmin(req);
    const { email, password, superAdmin } = await req.json();

    if (email === "" || password === "") {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 },
      );
    }

    const Nemail = email.trim();
    const Npassword = password.trim();

    //regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Nemail)) {
      return NextResponse.json(
        { message: "Invalid email format", success: false },
        { status: 400 },
      );
    }

    // password validation for 6 characters
    if (Npassword.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters long",
          success: false,
        },
        { status: 400 },
      );
    }

    // Check if an admin with the same email already exists

    const existingAdmin = await Admin.findOne({ email: Nemail });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists", success: false },
        { status: 409 },
      );
    }

    const pass = await hashPassword(Npassword);

    const admin = new Admin({
      email: Nemail,
      password: pass,
      superAdmin: superAdmin || false,
    });

    await admin.save();

    return NextResponse.json(
      { message: "Admin created successfully", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}

//to get all the admins
export async function GET(req) {
  try {
    await connectDB();
    const admins = await Admin.find({}, { password: 0 });
    if (admins.length === 0) {
      return NextResponse.json(
        { message: "No admins found", success: false },
        { status: 204 },
      );
    }
    return NextResponse.json(
      { admins, success: true, message: "Admins fetched successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { message: "Error fetching admins", success: false },
      { status: 500 },
    );
  }
}

//to delete an admin by email
export async function DELETE(req) {
  try {
    await connectDB();
    await cookieAdmin(req);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const { email } = await req.json();

    if (email === "") {
      return NextResponse.json(
        { message: "Email is required", success: false },
        { status: 400 },
      );
    }

    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: "Invalid email format", success: false },
        { status: 400 },
      );
    }

    const deletedAdmin = await Admin.findOneAndDelete({ email: email.trim() });
    if (!deletedAdmin) {
      return NextResponse.json(
        { message: "Admin not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Admin deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { message: "Error deleting admin", success: false },
      { status: 500 },
    );
  }
}
