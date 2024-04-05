import { List, Tag } from "antd";
import { useSnapshot } from "valtio";
import { applicationStore } from "../../store";

export function CommandMenu(props: {
  selectedIndex: number;
  onSelect: (key: string) => void;
}) {
  const { selectedIndex, onSelect } = props;
  const allCommands = useSnapshot(applicationStore.allCommands);

  return (
    <List size="small" split={false}>
      {allCommands.map((cmd, i) => (
        <List.Item
          key={getCommandKey(cmd.applicationId, cmd.id)}
          className={`hover:bg-slate-200 cursor-pointer ${selectedIndex === i ? "bg-slate-200" : ""}`}
          onClick={() => onSelect(getCommandKey(cmd.applicationId, cmd.id))}
        >
          <List.Item.Meta
            title={
              <p>
                <span>/{cmd.name} </span>
                {(cmd.options || []).map((opt) => (
                  <Tag key={opt.name} bordered={false} className="scale-75">
                    {opt.name}:{" "}
                  </Tag>
                ))}
              </p>
            }
            description={cmd.description}
          />
        </List.Item>
      ))}
    </List>
  );
}

export function getCommandKey(appId: string, cmdId: string) {
  return `${appId}-${cmdId}`;
}
