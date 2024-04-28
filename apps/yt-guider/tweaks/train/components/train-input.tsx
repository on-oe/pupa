/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState, useRef } from 'react';
import { ArrowPathIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Translation } from './translation';
import { speaker } from '../utils/speaker';
import { PressButton } from './press-button';

interface TrainInputProps {
  transcript: {
    text: string;
  };
  onDone: () => void;
  onReplay: () => void;
}

const enum CheckStatus {
  Default,
  Correct,
  Incorrect,
  Skip,
}

interface InputWord {
  value: string;
  status: CheckStatus;
}

export function TrainInput({ transcript, onDone, onReplay }: TrainInputProps) {
  const [words, setWords] = useState<string[]>([]);
  const [inputWords, setInputWords] = useState<InputWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const trainRef = useRef<HTMLDivElement>(null);
  const inputItemsRef = useRef<HTMLInputElement[]>([]);

  const inputCompleted = inputWords.every(
    (word) => word.status !== CheckStatus.Default,
  );

  useEffect(() => {
    const words = transcript.text.split(' ');
    setWords(words);
    const _inputWords =
      getTrainCache(transcript.text) ||
      words.map(() => ({ value: '', status: CheckStatus.Default }));
    setInputWords(_inputWords);
    const index = _inputWords.findIndex(
      (word) => word.status === CheckStatus.Default,
    );
    setCurrentWordIndex(index);
  }, [transcript.text]);

  useEffect(() => {
    focusCurrentWord(currentWordIndex);
  }, [currentWordIndex]);

  function focusCurrentWord(index: number) {
    const input = inputItemsRef.current[index];
    if (!input) return;
    input.focus();
    moveCursorToEndOfInput(input);
  }

  function onWordChange(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const newWords = [...inputWords];
    const value = e.target.value;
    newWords[i].value = value;

    const expectedWord = removePunctuation(words[i]).toUpperCase();
    const actualWord = removePunctuation(value).toUpperCase();

    if (actualWord && expectedWord.length === actualWord.length) {
      const status =
        expectedWord === actualWord
          ? CheckStatus.Correct
          : CheckStatus.Incorrect;
      newWords[i].status = status;
    } else {
      newWords[i].status = CheckStatus.Default;
    }

    setInputWords(newWords);
  }

  function onWordKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    e.nativeEvent.stopImmediatePropagation();

    if (currentWordIndex !== i) return;

    const inputWord = inputWords[i];

    switch (e.key) {
      case ' ':
        e.preventDefault();

        if (!inputWord.value) {
          inputWord.status = CheckStatus.Skip;
          inputWord.value = words[i];
          setInputWords([...inputWords]);
        }

        if (i < words.length - 1) {
          const index = inputWords.findIndex(
            (word) => word.status === CheckStatus.Default,
          );
          setCurrentWordIndex(index === i ? i + 1 : index);
          inputWord.value && speaker.speak(inputWord.value);
        } else {
          setCurrentWordIndex(-1);
        }

        break;

      case 'ArrowLeft':
      case 'Backspace':
        if (i === 0) return;
        if (isCursorAtStartOfInput(e.currentTarget)) {
          e.preventDefault();
          setCurrentWordIndex(i - 1);
        }
        break;

      case 'ArrowRight':
        if (i === words.length - 1) return;
        if (isCursorAtEndOfInput(e.currentTarget)) {
          e.preventDefault();
          setCurrentWordIndex(i + 1);
        }
        break;

      case 'Enter':
        e.preventDefault();
        _onReplay();
        break;

      default:
        break;
    }
  }

  function onWordKeyUp(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
    const shouldCompleted =
      inputCompleted &&
      [CheckStatus.Correct, CheckStatus.Skip].includes(inputWords[i].status) &&
      !['ArrowLeft', 'ArrowRight'].includes(e.key);
    if (shouldCompleted) {
      speaker.speak(inputWords[i].value);
      focusTrainWrap();
    }
  }

  function onWordFocus(e: React.FocusEvent<HTMLSpanElement>, i: number) {
    setCurrentWordIndex(i);
  }

  function onWordBlur(e: React.FocusEvent<HTMLSpanElement>, i: number) {
    const inputWord = inputWords[i];

    if (inputWord.value === '') return;
    else if (
      removePunctuation(inputWord.value).length !==
      removePunctuation(words[i]).length
    ) {
      inputWord.status = CheckStatus.Incorrect;
      setInputWords([...inputWords]);
    }
  }

  function inputWordColorName(status: CheckStatus) {
    switch (status) {
      case CheckStatus.Correct:
        return 'text-green-500';
      case CheckStatus.Incorrect:
        return 'text-red-500';
      default:
        return 'text-white';
    }
  }

  function handleWrapKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== trainRef.current) return;
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
  }

  function handleWrapKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== trainRef.current) return;
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
    switch (e.key) {
      case ' ':
        _onReplay();
        break;
      case 'Enter':
        if (inputCompleted) {
          _onDone();
        }
        break;
      case 'ArrowLeft':
        setCurrentWordIndex(inputWords.length - 1);
        break;
      default:
        break;
    }
  }

  function _onReplay() {
    speaker.stop();
    setTrainCache(transcript.text, inputWords);
    onReplay();
  }

  function _onDone() {
    speaker.stop();
    onDone();
  }

  function handleReplayBtnClick() {
    _onReplay();
  }

  function handlePlayBtnClick() {
    _onDone();
  }

  function focusTrainWrap() {
    trainRef.current?.focus();
  }

  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return (
    <div
      ref={trainRef}
      tabIndex={0}
      className="text-center mx-6 relative outline-none"
      onKeyDownCapture={handleWrapKeyDown}
      onKeyUpCapture={handleWrapKeyUp}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className={`relative inline-block mx-2 px-1 py-[1px] text-3xl text-transparent border-b-2 transition-colors ${currentWordIndex === i ? 'border-primary' : 'border-white'}`}
        >
          {word}
          <input
            ref={(el) => (inputItemsRef.current[i] = el)}
            className={`absolute left-0 top-0 w-full h-full text-center bg-transparent border-none outline-none shadow-none m-0 px-1 py-[1px] text-3xl border-b-2 border-transparent ${inputWordColorName(inputWords[i].status)}`}
            value={inputWords[i].value}
            onChange={(e) => onWordChange(e, i)}
            onKeyDownCapture={(e) => {
              onWordKeyDown(e, i);
            }}
            onKeyUpCapture={(e) => {
              onWordKeyUp(e, i);
            }}
            onFocus={(e) => onWordFocus(e, i)}
            onBlur={(e) => onWordBlur(e, i)}
          />
        </span>
      ))}
      <span>
        {inputCompleted && (
          <PressButton
            label="Enter"
            icon={<PlayIcon className="w-4 h-4" />}
            onClick={handlePlayBtnClick}
          />
        )}
        <PressButton
          label={inputCompleted ? 'Space' : 'Enter'}
          icon={<ArrowPathIcon className="w-4 h-4" />}
          onClick={handleReplayBtnClick}
        />
      </span>
      <Translation text={transcript.text} />
    </div>
  );
}

function isCursorAtStartOfInput(element: HTMLInputElement) {
  return element.selectionStart === 0 && element.selectionEnd === 0;
}

function isCursorAtEndOfInput(element: HTMLInputElement) {
  return (
    element.selectionStart === element.value.length &&
    element.selectionEnd === element.value.length
  );
}

function moveCursorToEndOfInput(element: HTMLInputElement) {
  element.setSelectionRange(element.value.length, element.value.length);
}

// ignore dots and commas
function removePunctuation(text: string) {
  return text.replace(/(,|\.|\?)$/, '');
}

const trainCache = new Map<string, InputWord[]>();
function getTrainCache(text: string) {
  return trainCache.get(text);
}
function setTrainCache(text: string, inputWords: InputWord[]) {
  const _inputWords = inputWords.map((word) => {
    const isCorrect = word.status === CheckStatus.Correct;
    return isCorrect ? word : { value: '', status: CheckStatus.Default };
  });
  trainCache.set(text, _inputWords);
}
