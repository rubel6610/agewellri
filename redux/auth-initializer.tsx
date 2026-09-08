"use client";

import React, { useEffect, useRef } from "react";
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
  const { isInitialized, token, user } = useAppSelector((state) => state.auth);
  const [triggerGetMe] = useLazyGetMeQuery();
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized) {
      const activeToken = token || getAuthToken();
      if (activeToken && !hasFetchedProfile.current) {
        hasFetchedProfile.current = true;
        triggerGetMe()
          .unwrap()
          .catch((error: { status?: number; originalStatus?: number }) => {
            if (error?.status === 401 || error?.originalStatus === 401) {
              dispatch(logout());
            }
          });
      }
    }
  }, [isInitialized, token, triggerGetMe, dispatch]);

  return <>{children}</>;
}
