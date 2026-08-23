"use client";

import { useTaskLocation } from "./useTaskLocation";

import { useTaskLoading } from "./useTaskLoading";

import { useRouter } from "next/navigation";

import { useTaskForm } from "./useTaskForm";

import { useLocationSearch } from "./useLocationSearch";

import { useOwnerLocation } from "./useOwnerLocation";

import { useTaskPremium } from "./useTaskPremium";

import { useCreateTask } from "./useCreateTask";

export function useCreateTaskPage() {
  const router = useRouter();

  const {
    ownerLatitude,

    ownerLongitude,
  } = useOwnerLocation();

  const {
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
  } = useTaskForm();

  const {
    loading,

    setLoading,
  } = useTaskLoading();

  const {
    premiumServices,

    hasPremiumService,

    totalPremiumAmount,
  } = useTaskPremium({
    isUrgent,
  });

  const {
    locationMethod,

    setLocationMethod,

    locationQuery,

    setLocationQuery,

    selectedLocation,

    setSelectedLocation,

    latitude,

    setLatitude,

    longitude,

    setLongitude,

    manualAddress,

    setManualAddress,
  } = useTaskLocation();

  const {
    searchResults,

    setSearchResults,

    locationSearch,

    setLocationSearch,

    searchingLocation,

    searchLocation,
  } = useLocationSearch();

  const {
    handleCreateTask,

    result,

    closeResult,

    orderId,

    paymentAmount,

    paymentType,

    taskId,
  } = useCreateTask({
    router,

    ownerLatitude,

    ownerLongitude,
  });

  return {
    title,

    description,

    category,

    budget,

    taskDate,

    taskTime,

    isUrgent,

    premiumServices,

    hasPremiumService,

    totalPremiumAmount,

    loading,

    locationMethod,

    locationQuery,

    latitude,

    longitude,

    locationSearch,

    searchResults,

    searchingLocation,

    selectedLocation,

    manualAddress,

    onTitleChange: setTitle,

    onDescriptionChange: setDescription,

    onCategoryChange: setCategory,

    onBudgetChange: setBudget,

    onTaskDateChange: setTaskDate,

    onTaskTimeChange: setTaskTime,

    onUrgentChange: setIsUrgent,

    onLocationMethodChange: setLocationMethod,

    onLocationSearchChange: setLocationSearch,

    onManualAddressChange: setManualAddress,

    onSelectedLocationChange: setSelectedLocation,

    onSearchResultsChange: setSearchResults,

    onLatitudeChange: setLatitude,

    onLongitudeChange: setLongitude,

    onLocationQueryChange: setLocationQuery,

    onSubmit: (e: React.FormEvent) =>
      handleCreateTask(
        e,

        {
          title,

          description,

          category,

          budget,

          taskDate,

          taskTime,

          isUrgent,

          premiumServices,

          locationMethod,

          locationQuery,

          latitude,

          longitude,

          manualAddress,

          selectedLocation,

          setLoading,
        },
      ),

    onSearchLocation: searchLocation,

    onBack: () => router.back(),

    paymentResult: result,

    closePaymentResult: closeResult,

    paymentOrderId: orderId,

    paymentAmount,

    paymentType,

    taskId,
  };
}