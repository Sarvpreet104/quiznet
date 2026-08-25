import { IconType } from "react-icons";
import { InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  icon?: IconType;
  label: string;
  ID: string;
  error?: string;
  classNameInput?: string;
};

const Input = ({
  icon: Icon,
  label,
  ID,
  name,
  placeholder,
  type = "text",
  required = false,
  error,
  classNameInput,
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor={ID} className="pl-2 text-sm text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          type={type}
          name={name}
          id={ID}
          placeholder={placeholder ?? label}
          required={required}
          className={`w-full rounded-xl border border-border bg-secondary py-3 pl-12 pr-4 outline-none transition-all duration-300 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-destructive" : ""
          } ${classNameInput ?? ""}`}
        />

        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-foreground">
            <Icon />
          </div>
        )}
      </div>

      {error && <p className="pl-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default Input;
