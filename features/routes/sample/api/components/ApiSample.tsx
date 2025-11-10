'use client'

import getToken from "@/utils/spotify/getToken";
import { Typography } from "@mui/material";
import { useEffect } from "react";

export default async function ApiSample() {

    useEffect(() => {
        const gToken = async () => {
            const token = await getToken()
            const data = await token.json();
            console.log(data)
            console.log(data.token)
        }

        gToken();
    }, [])

    return (
        <>

        </>
    );
}