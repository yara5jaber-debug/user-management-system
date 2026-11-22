import React from "react";
import { NextIntlClientProvider } from "next-intl";
import LocaleSwitcher from "@/shared/components/atoms/LocaleSwitcher";
import { changeLocaleAction } from "@/i18n/locale";
interface Props {
  children: React.ReactNode;
}
export default function LanguagesProvider({ children }: Props) {
  return (
    <div>
      <NextIntlClientProvider>
        {children}
        <LocaleSwitcher changeLocaleAction={changeLocaleAction} />
      </NextIntlClientProvider>
    </div>
  );
}
