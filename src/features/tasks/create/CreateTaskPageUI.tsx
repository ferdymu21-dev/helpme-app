"use client";

import { useRouter } from "next/navigation";

import type {
    CreateTaskPageUIProps,
} from "./types/create-task.types";

import Header from "./components/Header";

import IntroSection from "./components/IntroSection";

import BasicInformationSection from "./components/BasicInformationSection";

import CategorySection from "./components/CategorySection";

import BudgetScheduleSection from "./components/BudgetScheduleSection";

import UrgentSection from "./components/UrgentSection";

import LocationSection from "./components/location/LocationSection";

import ActionBar from "./components/ActionBar";

import PaymentResultDialog
    from "@/features/payments/components/dialog/PaymentResultDialog";

export default function CreateTaskPageUI({

    title,
    description,
    category,
    budget,

    taskDate,
    taskTime,

    isUrgent,

    loading,

    paymentResult,
    paymentOrderId,
    paymentAmount,
    paymentType,
    taskId,

    closePaymentResult,

    locationMethod,
    locationSearch,

    searchResults,
    searchingLocation,

    selectedLocation,
    manualAddress,

    onLocationMethodChange,

    onLocationSearchChange,

    onManualAddressChange,

    onSelectedLocationChange,

    onSearchResultsChange,

    onLatitudeChange,

    onLongitudeChange,

    onLocationQueryChange,

    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onBudgetChange,

    onTaskDateChange,
    onTaskTimeChange,

    onUrgentChange,

    onSubmit,

    onSearchLocation,

    onBack,

}: CreateTaskPageUIProps) {

    const router = useRouter();

    return (
        <main className="min-h-screen bg-slate-50/70 pb-28 sm:pb-12">
            <div className="mx-auto w-full max-w-3xl">

                {/* HEADER */}
                <Header onBack={onBack} />

                {/* INTRO */}
                <IntroSection />

                {/* FORM */}
                <form
                    id="create-task-form"
                    onSubmit={onSubmit}
                    className="
                      space-y-4
                      px-4
                      sm:px-6
                    "
                >

                    {/* DETAIL TASK */}
                    <section
                        className="
                          rounded-3xl
                          border
                        border-slate-200/80
                        bg-white
                          p-5
                          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                          sm:p-6
                        "
                    >
                        <BasicInformationSection
                            title={title}
                            description={description}
                            onTitleChange={onTitleChange}
                            onDescriptionChange={onDescriptionChange}
                        />

                        {/* CATEGORY */}
                        <CategorySection
                            category={category}
                            onCategoryChange={onCategoryChange}
                        />
                    </section>

                    {/* BUDGET & SCHEDULE */}
                    <BudgetScheduleSection
                        budget={budget}
                        taskDate={taskDate}
                        taskTime={taskTime}
                        onBudgetChange={onBudgetChange}
                        onTaskDateChange={onTaskDateChange}
                        onTaskTimeChange={onTaskTimeChange}
                    />

                    {/* URGENT */}
                    <UrgentSection
                        isUrgent={isUrgent}
                        onUrgentChange={onUrgentChange}
                    />

                    {/* LOCATION M */}
                    <LocationSection

                        locationMethod={locationMethod}

                        locationSearch={locationSearch}

                        searchingLocation={searchingLocation}

                        searchResults={searchResults}

                        selectedLocation={selectedLocation}

                        manualAddress={manualAddress}

                        onLocationMethodChange={
                            onLocationMethodChange
                        }

                        onLocationSearchChange={
                            onLocationSearchChange
                        }

                        onManualAddressChange={
                            onManualAddressChange
                        }

                        onSelectedLocationChange={
                            onSelectedLocationChange
                        }

                        onSearchResultsChange={
                            onSearchResultsChange
                        }

                        onLatitudeChange={
                            onLatitudeChange
                        }

                        onLongitudeChange={
                            onLongitudeChange
                        }

                        onLocationQueryChange={
                            onLocationQueryChange
                        }

                        onSearchLocation={
                            onSearchLocation
                        }

                    />

                    {/* ACTION BAR */}
                    <ActionBar
                        loading={loading}
                    />

                </form>

            </div>

            <PaymentResultDialog
                open={paymentResult.status !== "IDLE"}
                status={paymentResult.status}
                amount={paymentAmount}
                orderId={paymentOrderId}
                paymentType={paymentType}
                taskId={taskId}
                onClose={() => {
                    closePaymentResult();
                    router.push("/home");
                }}
                onHistory={() => {
                    closePaymentResult();
                    router.push("/payments/history");
                }}
                onViewTask={(taskId) => {
                    closePaymentResult();
                    router.push(`/tasks/${taskId}`);
                }}
            />

        </main>
    );
}