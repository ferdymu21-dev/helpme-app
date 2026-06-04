import Image from "next/image";

interface Props {
  size?: number;
  showText?: boolean;
}

export default function BrandLogo({
  size = 200,
  showText = false,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.svg"
        alt="HelpMe Logo"
        width={size}
        height={size}
        priority
        className="h-auto w-[120px]"
      />

      {showText && (
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            
          </h1>

          <p className="text-xs text-slate-500">
            
          </p>
        </div>
      )}
    </div>
  );
}