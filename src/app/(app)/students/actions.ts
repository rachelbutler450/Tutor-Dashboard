"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_STATUSES, type ReviewStatus } from "@/lib/types";

export interface FormState {
  error?: string;
  success?: boolean;
}

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function parseStudentFields(formData: FormData) {
  const name = text(formData, "name");

  const feeRaw = text(formData, "hourly_fee");
  const hourly_fee = feeRaw === null ? null : Number(feeRaw);

  const lessonsRaw = text(formData, "lessons_per_week");
  const lessons_per_week = lessonsRaw === null ? 1 : Number(lessonsRaw);

  const reviewRaw = String(formData.get("review_status") ?? "Not Asked");
  const review_status: ReviewStatus = REVIEW_STATUSES.includes(
    reviewRaw as ReviewStatus,
  )
    ? (reviewRaw as ReviewStatus)
    : "Not Asked";

  return {
    name,
    grade_year: text(formData, "grade_year"),
    timezone: text(formData, "timezone"),
    parent_contact: text(formData, "parent_contact"),
    curriculum: text(formData, "curriculum"),
    hourly_fee:
      hourly_fee === null || Number.isNaN(hourly_fee) ? null : hourly_fee,
    lessons_per_week:
      Number.isNaN(lessons_per_week) || lessons_per_week < 0
        ? 0
        : Math.trunc(lessons_per_week),
    preply_link: text(formData, "preply_link"),
    review_status,
  };
}

export async function createStudent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parseStudentFields(formData);
  if (!fields.name) {
    return { error: "Student name is required." };
  }

  const { data, error } = await supabase
    .from("students")
    .insert({ ...fields, tutor_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/students/${data.id}`);
}

export async function updateStudent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = text(formData, "id");
  if (!id) return { error: "Missing student id." };

  const fields = parseStudentFields(formData);
  if (!fields.name) {
    return { error: "Student name is required." };
  }

  const { error } = await supabase
    .from("students")
    .update(fields)
    .eq("id", id)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/students/${id}`);
  return { success: true };
}

export async function updateReviewStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = text(formData, "id");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !REVIEW_STATUSES.includes(statusRaw as ReviewStatus)) {
    return;
  }

  await supabase
    .from("students")
    .update({ review_status: statusRaw as ReviewStatus })
    .eq("id", id)
    .eq("tutor_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/students/${id}`);
}

export async function deleteStudent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = text(formData, "id");
  if (!id) return;

  await supabase
    .from("students")
    .delete()
    .eq("id", id)
    .eq("tutor_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

