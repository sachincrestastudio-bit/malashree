"use server";

import { connectToDatabase } from "../database/mongoose";
import { User } from "../models/User";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { LoginSchema, RegisterSchema } from "../schemas/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const registerUser = async (formData: any) => {
  try {
    const validated = RegisterSchema.safeParse({
      ...formData,
      email: formData.email?.trim().toLowerCase(),
    });

    if (!validated.success) {
      return { error: "Invalid input data. Ensure email is valid and password is at least 6 characters." };
    }

    const { name, email, phone, password } = validated.data;

    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, "i") },
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existingUser) {
      return { error: "An account with this email or phone number already exists." };
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone ? phone.trim() : "",
      passwordHash,
      role: "customer",
      address: formData.address || "",
    });

    const token = await generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    await setAuthCookie(token);

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: error.message || "Internal Server Error" };
  }
};

export const loginUser = async (formData: any) => {
  try {
    if (!formData || typeof formData !== "object") {
      return { error: "Invalid login form submission." };
    }

    const rawEmail = (formData.email || "").trim().toLowerCase();
    const rawPassword = formData.password || "";

    const validated = LoginSchema.safeParse({
      email: rawEmail,
      password: rawPassword,
    });

    if (!validated.success) {
      return { error: "Invalid email format or password (minimum 6 characters)." };
    }

    const { email, password } = validated.data;

    await connectToDatabase();

    // Case-insensitive email search
    let user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });

    // Auto-create default admin account if logging in as default admin and doesn't exist yet
    if (!user && email === "admin@malashree.in" && password === "admin123") {
      const defaultHash = await hashPassword("admin123");
      user = await User.create({
        name: "Malashree Admin",
        email: "admin@malashree.in",
        phone: "+91 99999 88888",
        passwordHash: defaultHash,
        role: "admin",
      });
    }

    if (!user) {
      return { error: "Invalid email or password." };
    }

    if (!user.passwordHash) {
      return { error: "Account security update required. Please reset your password." };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT and set HttpOnly Cookie
    const token = await generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    await setAuthCookie(token);

    // Sync kitchen cookie if user has assignedKitchen
    if (user.assignedKitchen) {
      try {
        const cookieStore = await cookies();
        cookieStore.set("assigned_kitchen", user.assignedKitchen.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      } catch (e) {
        console.error("Cookie sync error on login:", e);
      }
    }

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { error: error.message || "Internal Server Error" };
  }
};

export const logoutUser = async () => {
  await clearAuthCookie();
  try {
    revalidatePath("/");
  } catch (e) {}
};

export const createAdminUser = async (formData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  try {
    if (!formData.name || !formData.email || !formData.password) {
      return { error: "Name, email, and password are required." };
    }
    if (formData.password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    await connectToDatabase();

    const existing = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, "i") });
    if (existing) {
      return { error: "An account with that email already exists." };
    }

    const passwordHash = await hashPassword(formData.password);

    await User.create({
      name: formData.name.trim(),
      email: cleanEmail,
      phone: formData.phone?.trim() || "",
      passwordHash,
      role: "admin",
    });

    try {
      revalidatePath("/admin/admins");
    } catch (e) {}

    return { success: true };
  } catch (error: any) {
    console.error("Create Admin Error:", error);
    return { error: error.message || "Internal Server Error" };
  }
};
