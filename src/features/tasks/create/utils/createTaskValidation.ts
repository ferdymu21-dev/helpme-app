import type {
  HandleCreateTaskParams,
} from "../types/create-task.types";

export function validateCreateTask(
  data: HandleCreateTaskParams
) {

  if (data.locationMethod === "SEARCH") {

    if (
      !data.selectedLocation ||
      !data.latitude ||
      !data.longitude
    ) {

      return "Pilih lokasi terlebih dahulu";

    }

  }

  if (data.locationMethod === "MANUAL") {

    if (!data.manualAddress.trim()) {

      return "Masukkan alamat manual";

    }

  }

  const scheduledAt =
    new Date(
      `${data.taskDate}T${data.taskTime}`
    );

  if (isNaN(scheduledAt.getTime())) {

    return "Tanggal dan jam pelaksanaan wajib diisi";

  }

  if (
    scheduledAt.getTime() < Date.now()
  ) {

    return "Waktu pelaksanaan tidak boleh di masa lalu";

  }

  return null;

}