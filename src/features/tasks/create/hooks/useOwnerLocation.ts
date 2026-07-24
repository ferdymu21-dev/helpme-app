"use client";

import {
    useEffect,
    useState,
} from "react";

export function useOwnerLocation() {

    const [
        ownerLatitude,
        setOwnerLatitude,
    ] = useState<number | null>(
        null
    );

    const [
        ownerLongitude,
        setOwnerLongitude,
    ] = useState<number | null>(
        null
    );

    useEffect(() => {

        navigator.geolocation
            .getCurrentPosition(

                (position) => {

                    setOwnerLatitude(
                        position.coords.latitude
                    );

                    setOwnerLongitude(
                        position.coords.longitude
                    );

                }

            );

    }, []);

    return {

        ownerLatitude,

        ownerLongitude,

    };

}