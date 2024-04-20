import React from "react";
import { Button, Select } from "antd";
import { parse } from "marked";
import "github-markdown-css";
import {
  MessageElementType,
  type Message,
  type MessageElement,
} from "@pupa/universal/types";

interface MessageProps {
  message: Message;
}

export function MessageComponent({ message }: MessageProps) {
  const elements = message.elements || [];

  return (
    <div className="px-1 py-[6px] rounded-lg text-stone-900 my-1 text-sm">
      {message.content}
      {elements.map((element, index) => {
        return (
          <div key={index} className="my-1">
            <MessageElementComponent element={element} />
          </div>
        );
      })}
    </div>
  );
}

export function MessageElementComponent({
  element,
}: {
  element: MessageElement;
}) {
  function handleBtnClick() {
    console.log("Button clicked");
  }

  function handleSelectChange(value: string) {
    console.log("Selected:", value);
  }

  switch (element.type) {
    case MessageElementType.Column:
      return (
        <div className="flex">
          {element.elements?.map((el, index) => (
            <MessageElementComponent key={index} element={el} />
          ))}
        </div>
      );
    case MessageElementType.Markdown:
      return (
        <div
          className="markdown-body"
          style={{ fontSize: "14px" }}
          dangerouslySetInnerHTML={{ __html: parse(element.content || "") }}
        />
      );
    case MessageElementType.Button:
      return (
        <div>
          <Button onClick={handleBtnClick}>{element.label}</Button>
        </div>
      );
    case MessageElementType.Select:
      return (
        <Select>
          {element.options?.map((option, index) => (
            <Select.Option key={index} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
  }
}
