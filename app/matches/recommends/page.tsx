'use client'

import { getCurrentUser } from "@/lib/action";
import { Typography } from "@mui/material";
import { useEffect } from "react";

export default function page() {

    useEffect( ()=>{
        const getData = async () =>{
            const user = await getCurrentUser();
            const userId = user?.id;
            
            if(!userId){
                console.error("おわりだよー")
            }

            const response = await fetch(`/api/recommends/get-recommends?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            const userList = await response.json();
            console.log(userList["targetUserId"]);
            console.log(userList["users"]);
            console.log(userList["results"]);
        };

        getData()
        console.log("wa")

    }, []);

    return (
        <Typography variant="h5">hi</Typography>
    )
}