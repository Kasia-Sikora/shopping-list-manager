import { createContext, useContext } from "react";
import type { FieldValues, UseFieldArrayReturn, UseFormReturn, ArrayPath } from "react-hook-form";

type AllFormMethods<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>
> = UseFormReturn<TFieldValues> & UseFieldArrayReturn<TFieldValues, TFieldArrayName>;

const FieldArrayFormContext = createContext<AllFormMethods<FieldValues, ArrayPath<FieldValues>> | null>(null);

FieldArrayFormContext.displayName = "RHFArrayContext";

// eslint-disable-next-line react-refresh/only-export-components
export const useFieldArrayFormContext = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>
>(): AllFormMethods<TFieldValues, TFieldArrayName> => {
  const context = useContext(FieldArrayFormContext);
  if (!context) {
    throw new Error("useFieldArrayFormContext must be used within a FieldArrayFormProvider");
  }
  return context as unknown as AllFormMethods<TFieldValues, TFieldArrayName>;
};

export type FieldArrayFormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>
> = {
  children: React.ReactNode;
} & AllFormMethods<TFieldValues, TFieldArrayName>;

export const FieldArrayFormProvider = <
  TFieldValues extends FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues>
>({
  children,
  ...props
}: FieldArrayFormProviderProps<TFieldValues, TFieldArrayName>) => {
  return (
    <FieldArrayFormContext.Provider value={props as unknown as AllFormMethods<FieldValues, ArrayPath<FieldValues>>}>
      {children}
    </FieldArrayFormContext.Provider>
  );
};