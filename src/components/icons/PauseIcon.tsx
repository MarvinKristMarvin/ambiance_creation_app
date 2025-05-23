export default function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 277.338 277.338"
      width="48px"
      height="48px"
      className={`${className}`}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M14.22,45.665v186.013c0,25.223,16.711,45.66,37.327,45.66c20.618,0,37.339-20.438,37.339-45.66V45.665
		c0-25.211-16.721-45.657-37.339-45.657C30.931,0,14.22,20.454,14.22,45.665z"
      />
      <path
        d="M225.78,0c-20.614,0-37.325,20.446-37.325,45.657V231.67c0,25.223,16.711,45.652,37.325,45.652s37.338-20.43,37.338-45.652
		V45.665C263.109,20.454,246.394,0,225.78,0z"
      />
    </svg>
  );
}
