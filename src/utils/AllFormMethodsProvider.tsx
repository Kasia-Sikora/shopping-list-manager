import { type ReactNode } from "react";
import {
  type FieldValues,
  type UseFieldArrayReturn,
  type UseFormReturn,
  type ArrayPath,
} from "react-hook-form";
import { Context } from "./useFormArray";

export type FormArrayMethods<
  T extends FieldValues = FieldValues,
  K extends ArrayPath<T> = ArrayPath<T>
> = UseFormReturn<T> & UseFieldArrayReturn<T, K>;


export const FormArrayProvider = <
  T extends FieldValues,
  K extends ArrayPath<T>
>({ children, ...methods }: { children: ReactNode } & FormArrayMethods<T, K>) => (
  <Context.Provider value={methods as unknown as FormArrayMethods<FieldValues, ArrayPath<FieldValues>>}>
    {children}
  </Context.Provider>
);


