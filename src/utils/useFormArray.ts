import { createContext, useContext } from "react";
import { type FieldValues, type ArrayPath, type UseFormProps, useForm, useFieldArray } from "react-hook-form";
import { type FormArrayMethods } from "./AllFormMethodsProvider";

export const Context = createContext<FormArrayMethods<FieldValues, ArrayPath<FieldValues>> | null>(null);

export const useFormArrayContext = <
  T extends FieldValues = FieldValues,
  K extends ArrayPath<T> = ArrayPath<T>
>() => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useFormArrayContext must be used within FormArrayProvider");
  return ctx as unknown as FormArrayMethods<T, K>;
};

export const useFormWithArray = <
  T extends FieldValues,
  K extends ArrayPath<T>
>(props: UseFormProps<T>, name: K): FormArrayMethods<T, K> => {
  const methods = useForm<T>(props);
  const array = useFieldArray<T, K>({ control: methods.control, name });
  return { ...methods, ...array };
};