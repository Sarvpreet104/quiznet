import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { getCurrentUser } from "@/lib/auth";
import { FaSignInAlt, FaUserPlus, FaArrowRight } from "react-icons/fa";

type Props = {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
};

const LoginOptions = ({ user }: Props) => {
  return (
    <>
      {user ? (
        <PrimaryButton
          name="Dashboard"
          href={user.role === "admin" ? "/admin" : "/dashboard"}
          icon={FaArrowRight}
          className="py-2 px-4"
        />
      ) : (
        <>
          <SecondaryButton
            name="Login"
            href="/login"
            icon={FaSignInAlt}
            className="flex-1 py-2 px-4"
          />
          <PrimaryButton
            name="Register"
            href="/register"
            icon={FaUserPlus}
            className="flex-1 py-2 px-4"
          />
        </>
      )}
    </>
  );
};

export default LoginOptions;
