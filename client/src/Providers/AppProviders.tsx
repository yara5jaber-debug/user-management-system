import ReactQueryProvider from "./RreactQueryProvider";
import LanguagesProvider from "./LanguagesProvider";
import React from "react";
interface Props {
  children: React.ReactNode;
}
export default function AppProviders({ children }: Props) {
  return (
    <div>
      <ReactQueryProvider>
        <LanguagesProvider>{children}</LanguagesProvider>
      </ReactQueryProvider>
    </div>
  );
}
