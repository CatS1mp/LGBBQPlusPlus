import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, TypeOf } from 'zod';

export function useZodForm<T extends ZodSchema>(
  schema: T,
  options?: Omit<UseFormProps<TypeOf<T>>, 'resolver'>
): UseFormReturn<TypeOf<T>> {
  return useForm<TypeOf<T>>({
    resolver: zodResolver(schema),
    ...options,
  });
}

