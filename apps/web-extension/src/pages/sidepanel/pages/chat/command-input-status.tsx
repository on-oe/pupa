import { Tag } from 'antd';
import {
  currentAppAtom,
  currentCommandAtom,
  currentCommandValOptsAtom,
  currentOptionAtom,
} from './state';
import { useAtom, useAtomValue } from 'jotai';

export function CommandInputStatus() {
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom);
  const [currentCommand, setCurrentCommand] = useAtom(currentCommandAtom);
  const currentCommandValOpts = useAtomValue(currentCommandValOptsAtom);
  const [, setCurrentOption] = useAtom(currentOptionAtom);

  const handleCloseAppTag = () => {
    setCurrentApp(null);
  };

  const handleCloseCommandTag = () => {
    setCurrentCommand(null);
  };

  const selectOptionByIndex = (index: number) => {
    const option = currentCommandValOpts[index];
    setCurrentOption(option);
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
          {currentCommandValOpts.map((opt, i) => (
            <Tag
              key={opt.name}
              className="cursor-pointer"
              onClick={() => selectOptionByIndex(i)}
            >
              {opt.name}:{opt.value || ''}
            </Tag>
          ))}
        </>
      )}
    </div>
  );
}
