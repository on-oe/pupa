import { Tag } from "antd";
import { useSnapshot } from "valtio";
import { sendingCommandStore, store } from "./store";

export function CommandInputStatus() {
  const { currentApp, currentCommand } = useSnapshot(store.state);
  const { dataOptions } = useSnapshot(sendingCommandStore.state);

  const handleCloseAppTag = () => {
    store.state.currentApp = null;
  };

  const handleCloseCommandTag = () => {
    store.state.currentCommand = null;
  };

  return (
    <div className=" mb-2">
      {currentApp && (
        <Tag
          bordered={false}
          color="processing"
          closeIcon
          onClose={handleCloseAppTag}
        >
          @{currentApp.name}
        </Tag>
      )}
      {currentCommand && (
        <>
          <Tag
            bordered={false}
            color="processing"
            closeIcon
            onClose={handleCloseCommandTag}
          >
            {`/${currentCommand.name} `}
          </Tag>
          {dataOptions.map((opt, i) => (
            <Tag
              key={opt.name}
              className="cursor-pointer"
              onClick={() => sendingCommandStore.selectedOptionByIndex(i)}
            >
              {opt.name}:{opt.value || (opt.required ? "required" : "optional")}
            </Tag>
          ))}
        </>
      )}
    </div>
  );
}
