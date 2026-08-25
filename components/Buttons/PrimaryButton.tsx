import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  href?: string;
  icon?: IconType;
};

const PrimaryButton = ({
  name,
  href,
  icon: Icon,
  className,
  ...props
}: PrimaryButtonProps) => {
  if (href) {
    return (
      <Button
        asChild
        variant="default"
        size="lg"
        className={cn("gap-2", className)}
      >
        <Link href={href}>
          <span>{name}</span>
          {Icon && <Icon className="size-5" />}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="lg"
      className={cn("gap-2", className)}
      {...props}
    >
      {name && <span>{name}</span>}
      {Icon && <Icon className="size-5" />}
    </Button>
  );
};

export default PrimaryButton;
