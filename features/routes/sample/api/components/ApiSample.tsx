'use client'

import getToken from "@/utils/spotify/getToken";
import { Typography } from "@mui/material";
import { useEffect } from "react";

export default async function ApiSample() {

    useEffect(() => {
        const gToken = async () => {
            const token = await getToken()
            
            console.log(token)
        }

        gToken();
    }, [])

    return (
        <>

        </>
    );
}