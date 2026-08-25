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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-4 px-0 sm:px-4">
        <div className="flex gap-4 flex-col md:flex-row">
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

        <div className="flex gap-4 flex-col md:flex-row">
          <Input
            {...register("password")}
            icon={FaLock}
            label="Password"
            ID="password"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            error={errors.password?.message}
          />

          <Input
            {...register("confirm_password")}
            icon={FaLock}
            label="Confirm Password"
            ID="confirmpassword"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            error={errors.confirm_password?.message}
          />
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <PrimaryButton
          name={isSubmitting ? "Creating Account..." : "Register"}
          type="submit"
          disabled={isSubmitting}
          className="h-12 text-lg mt-8"
          icon={FaSignInAlt}
        />
      </div>
    </form>
  );
};

export default RegisterForm;
