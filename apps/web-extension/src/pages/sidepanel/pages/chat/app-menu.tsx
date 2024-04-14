import { Avatar, List } from "antd";
import { useSnapshot } from "valtio";
import { applicationStore } from "../../store";

export function AppMenu(props: { selectedIndex: number }) {
  const { selectedIndex } = props;
  const { applications } = useSnapshot(applicationStore.state);
  console.log(applications);

  return (
    <List size="small" split={false}>
      {applications.map((app, i) => (
        <List.Item
          key={app.id}
          className={`hover:bg-slate-300 cursor-pointer ${selectedIndex === i ? "bg-slate-300" : ""}`}
        >
          <List.Item.Meta
            title={app.name}
            avatar={<Avatar src={app.icon} size="small" />}
            description={app.description}
          />
        </List.Item>
      ))}
    </List>
  );
}
