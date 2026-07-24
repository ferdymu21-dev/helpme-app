"use client";

import { useMemo } from "react";

import type {
    PremiumTaskService,
} from "../types/create-task.types";

type Params = {

    isUrgent: boolean;

};

export function useTaskPremium({

    isUrgent,

}: Params) {

    const premiumServices =
        useMemo<PremiumTaskService[]>(() => {

            const services: PremiumTaskService[] = [];

            if (isUrgent) {

                services.push({

                    type: "URGENT_TASK",

                    amount: 1000,

                });

            }

            return services;

        }, [isUrgent]);

    return {

        premiumServices,

        hasPremiumService:
            premiumServices.length > 0,

        totalPremiumAmount:
            premiumServices.reduce(

                (total, service) =>

                    total + service.amount,

                0,

            ),

    };

}