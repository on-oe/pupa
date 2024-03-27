/* eslint-disable react/jsx-props-no-spreading */
import type { ComponentType, ReactElement } from "react";
import { Component } from "react";

class ErrorBoundary extends Component<
  {
    children: ReactElement;
    fallback: ReactElement;
  },
  {
    hasError: boolean;
  }
> {
  constructor(props: { children: ReactElement; fallback: ReactElement }) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;
    if (hasError) {
      return fallback;
    }

    return children;
  }
}

export default function withErrorBoundary<T extends Record<string, unknown>>(
  Component: ComponentType<T>,
  ErrorComponent: ReactElement,
) {
  return function WithErrorBoundary(props: T) {
    return (
      <ErrorBoundary fallback={ErrorComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
