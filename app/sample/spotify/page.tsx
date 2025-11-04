import { getCurrentUser } from "@/lib/action";
import { createClient } from "@/lib/supabase.server";
import { Typography } from "@mui/material";

export default async function page(){
    // userData取得
    const userData = await getCurrentUser();
    if(userData == null){
        return
    }

    // DBからSpotifyのトークン取得
    const supabase = await createClient()
    const data = await supabase.from("users").select("*").eq("id", userData.id)

    // SpotifyのAPIを呼び出し
    return(
        <>
            <Typography>{userData? userData.id : ""}</Typography>
        </>
    );
}