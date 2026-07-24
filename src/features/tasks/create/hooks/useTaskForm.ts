"use client";

import { useState } from "react";

export function useTaskForm() {

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("Belanja");

  const [
    budget,
    setBudget,
  ] = useState("");

  const [
    taskDate,
    setTaskDate,
  ] = useState("");

  const [
    taskTime,
    setTaskTime,
  ] = useState("");

  const [
    isUrgent,
    setIsUrgent,
  ] = useState(false);

  return {

    title,
    setTitle,

    description,
    setDescription,

    category,
    setCategory,

    budget,
    setBudget,

    taskDate,
    setTaskDate,

    taskTime,
    setTaskTime,

    isUrgent,
    setIsUrgent,

  };

}