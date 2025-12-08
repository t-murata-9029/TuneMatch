'use client'

import { useEffect, useState } from "react"
import { getRecommendsList } from "../endpoints"
import { Box, Typography } from "@mui/material";
import { Recommends } from "../types";

/**
 * おすすめの人を表示するよ
 */
export default function RecommendsList() {
    const [recommendsList, setRecommendsList] = useState<Recommends[]>();

    useEffect( () => {
        const setData = async () => {
            const list = await getRecommendsList();
            setRecommendsList(list)
        }

        setData();
        console.log(recommendsList)
    },[])

    return(
        <>
            <Box>
                
            </Box>
        </>
    );
}