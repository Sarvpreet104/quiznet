"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FaEnvelope,
  FaIdCard,
  FaLock,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";

import Input from "@/components/Forms/Input";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

import { registerUser } from "@/app/actions/auth";

import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

const RegisterForm = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div className="flex flex-col gap-4">
        {/* Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            {...register("first_name")}
            icon={FaUser}
            label="First Name"
            ID="firstname"
            type="text"
            autoComplete="given-name"
            placeholder="Rick"
            error={errors.first_name?.message}
          />

          <Input
            {...register("last_name")}
            icon={FaUser}
            label="Last Name"
            ID="lastname"
            type="text"
            autoComplete="family-name"
            placeholder="Sanchez"
            error={errors.last_name?.message}
          />
        </div>

        {/* College ID */}
        <Input
          {...register("college_id")}
          icon={FaIdCard}
          label="College ID"
          ID="collegeid"
          type="text"
          autoComplete="username"
          placeholder="232XXXX"
          error={errors.college_id?.message}
        />

        {/* Email */}
        <Input
          {...register("email")}
          icon={FaEnvelope}
          label="Email"
          ID="email"
          type="email"
          autoComplete="email"
          placeholder="rick@morty.com"
          error={errors.email?.message}
        />

        {/* Password */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            {...register("password")}
            icon={FaLock}
            label="Password"
            ID="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
          />

          <Input
            {...register("confirm_password")}
            icon={FaLock}
            label="Confirm Password"
            ID="confirmpassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirm_password?.message}
          />
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="
              rounded-xl
              border
              border-destructive/20
              bg-destructive/10
              px-4
              py-3
              text-sm
              leading-5
              text-destructive
            "
          >
            {serverError}
          </div>
        )}

        {/* Submit */}
        <PrimaryButton
          name={isSubmitting ? "Creating Account..." : "Create Account"}
          type="submit"
          disabled={isSubmitting}
          className="
            mt-4
            h-12
            w-full
            text-base
            font-semibold
          "
          icon={FaSignInAlt}
        />
      </div>
    </form>
  );
};

export default RegisterForm;
