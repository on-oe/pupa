import { useEffect, useRef } from "react";

export function AutoSizeTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    minHeight?: number;
    maxHeight?: number;
  },
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { value, minHeight, maxHeight, ...otherProps } = props;

  useEffect(() => {
    const textarea = textareaRef.current!;
    textarea.style.height = "auto";
    const less = minHeight
      ? Math.max(minHeight, textarea.scrollHeight)
      : textarea.scrollHeight;
    const height = maxHeight ? Math.min(maxHeight, less) : less;
    textarea.style.height = `${height}px`;
  }, [maxHeight, minHeight, value]);

  return <textarea {...otherProps} value={value} ref={textareaRef} />;
}
