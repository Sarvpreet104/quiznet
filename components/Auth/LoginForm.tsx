"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

import Input from "@/components/Forms/Input";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

import { loginUser } from "@/app/actions/auth";

import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

const LoginForm = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);

    try {
      const result = await loginUser(data);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div className="flex flex-col gap-5">
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
        <Input
          {...register("password")}
          icon={FaLock}
          label="Password"
          ID="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
        />

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
          name={isSubmitting ? "Logging in..." : "Login"}
          href=""
          type="submit"
          disabled={isSubmitting}
          className="
            mt-2
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

export default LoginForm;
