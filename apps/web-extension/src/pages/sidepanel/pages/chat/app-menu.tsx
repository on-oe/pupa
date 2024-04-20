import { Avatar, List } from 'antd';
import { useApplication } from '../../hooks/use-application';

export function AppMenu(props: { selectedIndex: number }) {
  const { selectedIndex } = props;
  const { applications } = useApplication();

  return (
    <List size="small" split={false}>
      {applications.map((app, i) => (
        <List.Item
          key={app.id}
          className={`hover:bg-slate-300 cursor-pointer ${selectedIndex === i ? 'bg-slate-300' : ''}`}
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
