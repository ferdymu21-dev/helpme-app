"use client";

import { useState } from "react";

export function useTaskLoading() {

  const [

    loading,

    setLoading,

  ] = useState(false);

  return {

    loading,

    setLoading,

  };

}