"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { hydrateAuth, logout } from "./features/auth/authSlice";
import { useLazyGetMeQuery } from "./features/auth/authApi";
import { getAuthToken } from "@/lib/auth/token";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { isInitialized, token } = useAppSelector((state) => state.auth);
  const [triggerGetMe] = useLazyGetMeQuery();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized) {
      const activeToken = token || getAuthToken();
      if (activeToken) {
        triggerGetMe()
          .unwrap()
          .catch((error: { status?: number; originalStatus?: number }) => {
            if (error?.status === 401 || error?.originalStatus === 401) {
              dispatch(logout());
            }
          });
      } else {
        // Explicitly clear local storage & cookies if not logged in
        dispatch(logout());
      }
    }
  }, [isInitialized, token, triggerGetMe, dispatch]);

  return <>{children}</>;
}

