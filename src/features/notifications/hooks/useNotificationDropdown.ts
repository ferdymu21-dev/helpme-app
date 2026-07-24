"use client";

import {

  useEffect,

  useRef,

  useState,

} from "react";

export function useNotificationDropdown() {

  const [

    open,

    setOpen,

  ] = useState(false);

  const ref =
    useRef<HTMLDivElement>(null);

  function toggle() {

    setOpen((prev) => !prev);

  }

  function close() {

    setOpen(false);

  }

  useEffect(() => {

    function handleClickOutside(

      event: MouseEvent

    ) {

      if (

        ref.current &&

        !ref.current.contains(

          event.target as Node

        )

      ) {

        setOpen(false);

      }

    }

    document.addEventListener(

      "mousedown",

      handleClickOutside

    );

    return () =>

      document.removeEventListener(

        "mousedown",

        handleClickOutside

      );

  }, []);

  return {

    open,

    toggle,

    close,

    ref,

  };

}