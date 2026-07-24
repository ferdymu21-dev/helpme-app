"use client";

import CreateTaskPageUI
from "@/features/tasks/create/CreateTaskPageUI";

import {
    useCreateTaskPage,
} from "@/features/tasks/create/hooks/useCreateTaskPage";

export default function CreateTaskPage() {

    const props =
        useCreateTaskPage();

    return (

        <CreateTaskPageUI

            {...props}

        />

    );

}