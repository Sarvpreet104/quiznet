import { IconType } from "react-icons";
import { Badge } from "@/components/ui/badge";

type MyBadgeProps = {
  icon: IconType | string;
  label: string;
  iconColor?: string;
};

const MyBadge = ({
  icon: Icon,
  label,
  iconColor = "text-secondary",
}: MyBadgeProps) => {
  return (
    <Badge
      variant="default"
      className="text-xs sm:text-sm h-fit w-fit px-4 py-2"
    >
      <span className={`${iconColor}`}>
        <Icon />
      </span>{" "}
      {label}
    </Badge>
  );
};

export default MyBadge;
