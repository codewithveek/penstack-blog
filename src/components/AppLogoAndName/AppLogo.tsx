import { Image } from "@chakra-ui/react";

export const AppLogo = ({
  size,
  src,
  bg,
}: {
  src: string;
  size: string;
  bg?: string;
}) => {
  return src ? (
    <Image
      srcSet={`${src} 1x`}
      bg={bg}
      w={"auto"}
      h={size}
      loading="lazy"
      src={src}
      alt="Logo"
      className="object-contain"
    />
  ) : (
    <DefaultLogo />
  );
};

const DefaultLogo = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1_15)">
        <path
          d="M26 0H6C2.68629 0 0 2.68629 0 6V26C0 29.3137 2.68629 32 6 32H26C29.3137 32 32 29.3137 32 26V6C32 2.68629 29.3137 0 26 0Z"
          fill="#4F46E5"
        />
        <path
          d="M5 6V26H15C19 26 21 24 21 21C21 18.5 19.5 17 17 16.5C19 16 20.5 14.5 20.5 12C20.5 9 18.5 6 14.5 6H5Z"
          fill="white"
        />
        <path
          d="M10 11H14C15.5 11 16.5 11.5 16.5 13C16.5 14.5 15.5 15 14 15H10V11Z"
          fill="#4F46E5"
        />
        <path
          d="M10 17H14.5C16 17 17 17.5 17 19C17 20.5 16 21 14.5 21H10V17Z"
          fill="#4F46E5"
        />
        <path d="M26 6L26 26" stroke="white" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="clip0_1_15">
          <rect width="32" height="32" rx="4" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
