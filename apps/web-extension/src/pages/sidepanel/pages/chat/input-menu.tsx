import { List } from "antd";
import { useEffect, useState } from "react";

interface InputMenuProps<T> {
  list: T[];
  onSelect: (item: T) => void;
  Meta: (item: T, index: number) => JSX.Element;
}

let onArrowSelect: ((e: React.KeyboardEvent<HTMLElement>) => void) | null;

export function interceptKeydown<T extends React.KeyboardEvent<HTMLElement>>(handler: (e: T) => void) {
  return (e: T) => {
    if (onArrowSelect) {
      onArrowSelect(e);
    }
    handler(e);
  }
}


export function InputMenu({ list, onSelect, Meta }: InputMenuProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    onArrowSelect = (e) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? list.length - 1 : prev - 1,
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === list.length - 1 ? 0 : prev + 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (e.repeat) return;
          onSelect(list[selectedIndex]);
          break;
      }
    }
    return () => {
      onArrowSelect = null;
    }
  }, [selectedIndex, list, onSelect]);

  return (
    <List size="small" split={false}>
      {list.map((app, i) => (
        <List.Item
          key={app.id}
          className={`hover:bg-slate-300 cursor-pointer ${selectedIndex === i ? 'bg-slate-300' : ''}`}
          onMouseEnter={() => setSelectedIndex(i)}
          onClick={() => onSelect(app)}
        >
          {Meta(app, i)}
        </List.Item>
      ))}
    </List>
  )
}
