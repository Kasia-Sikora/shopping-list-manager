import {createContext, useContext} from "react";
import type { FieldValues, UseFieldArrayReturn, UseFormReturn } from "react-hook-form";

type AllFormMethods<TFieldValues extends FieldValues = FieldValues> = UseFormReturn<TFieldValues> &
  UseFieldArrayReturn;

const FieldArrayFormContext = createContext<AllFormMethods | null>(null);

FieldArrayFormContext.displayName = "RHFArrayContext";

// eslint-disable-next-line react-refresh/only-export-components
export const useFieldArrayFormContext = <TFieldValues extends FieldValues>(): AllFormMethods<
  TFieldValues
> => {
  return useContext(FieldArrayFormContext) as AllFormMethods<TFieldValues>;
};

export declare type FieldArrayFormProviderProps<TFieldValues extends FieldValues = FieldValues> = {
  children: React.ReactNode;
} & AllFormMethods<TFieldValues>;

export const FieldArrayFormProvider = <TFieldValues extends FieldValues>({
  children,
  ...props
}: FieldArrayFormProviderProps<TFieldValues>) => {
  return (
    <FieldArrayFormContext.Provider value={{ ...props } as AllFormMethods}>
      {children}
    </FieldArrayFormContext.Provider>
  );
};