export function defineBridgeEvent<D>(type: string) {
  const create = (data?: D) => {
    return {
      type,
      data,
    };
  };

  return { create, type };
}

export type BridgeEventPayload = ReturnType<
  ReturnType<typeof defineBridgeEvent>["create"]
>;

export type BridgeEvent<D> = ReturnType<typeof defineBridgeEvent<D>>;
