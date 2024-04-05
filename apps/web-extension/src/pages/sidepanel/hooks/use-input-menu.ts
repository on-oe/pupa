import { useState } from "react";

export function useInputMenu(options: {
  length: number;
  onSelect: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onKeydown = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? setSelectedIndex.length - 1 : prev - 1,
        );
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === options.length - 1 ? 0 : prev + 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (e.repeat) return;
        options.onSelect(selectedIndex);
        break;
    }
  };

  return { selectedIndex, onKeydown };
}
