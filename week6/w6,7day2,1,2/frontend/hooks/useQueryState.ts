'use client';

import { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";

type UseQueryStateReturnType<T> = [T, Dispatch<SetStateAction<T>>];

/**
 * Custom hook to sync state with URL query parameters in Next.js
 * Adapted from the react-router-dom pattern to work with Next.js navigation.
 */
const useQueryState = <T>(
  param: string,
  initialValue: T
): UseQueryStateReturnType<T> => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize from URL or initialValue
  const getInitialValue = useCallback(() => {
    const paramValue = searchParams.get(param);
    if (paramValue !== null) {
      try {
        return JSON.parse(paramValue) as T;
      } catch {
        return paramValue as unknown as T;
      }
    }
    return initialValue;
  }, [param, initialValue, searchParams]);

  const [value, setValue] = useState<T>(getInitialValue());

  // Sync state changes to the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (value !== null && value !== undefined && value !== "") {
      const stringified = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);
      params.set(param, stringified);
    } else {
      params.delete(param);
    }

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [value, param, pathname]);

  return [value, setValue];
};

export default useQueryState;
