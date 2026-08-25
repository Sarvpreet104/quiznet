import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconType } from "react-icons";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  href?: string;
  icon?: IconType;
};

const SecondaryButton = ({
  name,
  href,
  icon: Icon,
  className,
  ...props
}: SecondaryButtonProps) => {
  if (href) {
    return (
      <Button
        asChild
        variant="outline"
        size="lg"
        className={cn("gap-2 text-foreground", className)}
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
      variant="outline"
      size="lg"
      className={cn("gap-2 text-foreground", className)}
      {...props}
    >
      {name && <span>{name}</span>}
      {Icon && <Icon className="size-5" />}
    </Button>
  );
};

export default SecondaryButton;
