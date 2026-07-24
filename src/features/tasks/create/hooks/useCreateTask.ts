"use client";

import type { FormEvent } from "react";

import { createTask } from "@/features/tasks/services/task.service";

import {
  usePayment,
} from "@/features/payments/hooks/usePayment";

import {
  useMidtrans,
} from "@/features/payments/hooks/useMidtrans";

import type {
  HandleCreateTaskParams,
} from "../types/create-task.types";

import {
  validateCreateTask,
} from "../utils/createTaskValidation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePaymentResult,
} from "@/features/payments/hooks/usePaymentResult";

import {
  usePaymentStatus,
} from "@/features/payments/hooks/usePaymentStatus";

type Params = {
  router: any;
  ownerLatitude: number | null;
  ownerLongitude: number | null;
};

export function useCreateTask({
  router,

  ownerLatitude,

  ownerLongitude,

}: Params) {

  const [

    paymentType,

    setPaymentType,

  ] = useState<
    "DONATION" | "URGENT_TASK" | null
  >(null);

  const {

    createPayment,

  } = usePayment();

  const {

    openPayment,

  } = useMidtrans();

  const {

    result,

    openResult,

    closeResult,

  } = usePaymentResult();

  const [

    orderId,

    setOrderId,

  ] = useState("");

  const [

    paymentAmount,

    setPaymentAmount,

  ] = useState(0);

  const {

    status,

    taskId,

  } = usePaymentStatus({

    enabled: orderId !== "",

    orderId,

  });

  const handledResultRef = useRef(false);

  function handleCloseResult() {

    closeResult();

    setOrderId("");

    setPaymentAmount(0);

    setPaymentType(null);

  }

  useEffect(() => {

    if (!orderId) {

      return;

    }

    if (handledResultRef.current) {

      return;

    }

    if (status === "PENDING") {

      return;

    }

    handledResultRef.current = true;

    switch (status) {

      case "PAID":

        openResult(

          "SUCCESS",

          orderId,

          paymentAmount,

        );

        break;

      case "FAILED":

        openResult(

          "FAILED",

          orderId,

          paymentAmount,

        );

        break;

      case "EXPIRED":

        openResult(

          "EXPIRED",

          orderId,

          paymentAmount,

        );

        break;

      case "CANCELLED":

        openResult(

          "CANCELLED",

          orderId,

          paymentAmount,

        );

        break;

      default:

        handledResultRef.current = false;

        break;

    }

  }, [

    status,

    orderId,

    paymentAmount,

    openResult,

  ]);

  async function handleCreateTask(
    e: FormEvent,
    data: HandleCreateTaskParams
  ) {
    e.preventDefault();

    const {
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
    } = data;

    const validationError =
      validateCreateTask(data);

    if (validationError) {

      alert(validationError);

      return;

    }

    try {

      setLoading(true);

      const scheduledAt = new Date(
        `${taskDate}T${taskTime}`
      );

      if (isNaN(scheduledAt.getTime())) {
        alert(
          "Tanggal dan jam pelaksanaan wajib diisi"
        );

        setLoading(false);

        return;
      }

      if (scheduledAt.getTime() < Date.now()) {

        alert(
          "Waktu pelaksanaan tidak boleh di masa lalu"
        );

        setLoading(false);

        return;
      }

      if (premiumServices.length > 0) {

        const payment =
          await createPayment({

            paymentType:
              premiumServices[0].type,

            amount:
              premiumServices[0].amount,

            metadata: {

              title,

              description,

              category,

              budget: Number(budget),

              taskDate,

              taskTime,

              isUrgent,

              locationMethod,

              locationQuery,

              latitude,

              longitude,

              manualAddress,

              ownerLatitude,
              
              ownerLongitude,

            },

          });

        setOrderId(payment.orderId);

        setPaymentAmount(
          premiumServices[0].amount
        );

        setPaymentType(
          premiumServices[0].type
        );

        handledResultRef.current = false;

        await openPayment({

          snapToken: payment.snapToken,

          onSuccess() {

            // Belum melakukan apa-apa.
            // Status final akan berasal dari server.

          },

          onPending() {

            // Menunggu polling.

          },

          onError() {

            /*
             Midtrans gagal membuka popup
             atau terjadi error client.
        
             Status final tetap berasal
             dari webhook + polling.
            */

          },

          onClose() {

            // User menutup popup.
            // Polling akan tetap berjalan pada step berikutnya.

          },

        });

        return;

      }

      await createTask({
        title,
        description,
        category,

        budget: Number(budget),

        location_type: locationMethod,

        location_name:
          locationMethod === "SEARCH"
            ? locationQuery
            : null,

        latitude:
          locationMethod === "SEARCH"
            ? latitude
            : null,

        longitude:
          locationMethod === "SEARCH"
            ? longitude
            : null,

        manual_address:
          locationMethod === "MANUAL"
            ? manualAddress
            : null,

        owner_latitude: ownerLatitude,

        owner_longitude: ownerLongitude,

        scheduled_at:
          scheduledAt.toISOString(),

        is_urgent: isUrgent,
      });

      alert("Task berhasil dibuat");

      router.push("/home");
    } catch (error) {
      console.error(error);

      alert("Gagal membuat task");
    } finally {
      setLoading(false);
    }
  }

  return {

    handleCreateTask,

    result,

    closeResult: handleCloseResult,

    orderId,

    paymentAmount,

    paymentType,

    taskId,

  };

}