"use client";

import CurrencyInput from "@/components/ui/CurrencyInput";

type Props = {

    budget: string;

    onBudgetChange: (value: string) => void;

};

export default function BudgetInput({

    budget,

    onBudgetChange,

}: Props) {

    return (

        <CurrencyInput

            label="Budget"

            value={budget}

            onChange={onBudgetChange}

            placeholder="50.000"

            required

        />

    );

}