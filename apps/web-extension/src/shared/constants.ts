export const enum LocalMessageEventType {
  PageFunctionSuccess = "page-function-success",
  PageFunctionError = "page-function-error",
  ExecutePageFn = "execute-page-fn",
  PageFnEvent = "page-fn-event",
  PageLoaded = "page-loaded",
  Command = "command",
}

export const enum PageFnEventType {
  Success,
  Error,
  Event,
}
