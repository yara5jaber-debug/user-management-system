import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/cn";
interface ImageFooterProps {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}
export default function Images({
  src,
  alt,
  className,
  width,
  height,
}: ImageFooterProps) {
  const baseClasses = "flex justify-center items-center p-4 rounded-md";

  return (
    <div className={cn(baseClasses, className)}>
      <Image src={src} alt={alt} quality={100} width={width} height={height} />
    </div>
  );
}
