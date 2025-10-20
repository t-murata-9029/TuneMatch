'use client'

import Callback from "@/features/routes/auth/spotify/callback/components/Callback";
import { NextApiRequest, NextApiResponse } from "next";
import { getCookie, deleteCookie } from 'cookies-next';
import { supabase } from "@/lib/supabase.cliant";
import { cookies } from "next/dist/server/request/cookies";
import { useRouter, useSearchParams } from "next/navigation";

//クエリパラメーター
type Props = {
    searchParams: {
        code: string;
        state: string;
    }
};

export default  function callback(props: Props, req: NextApiRequest, res: NextApiResponse) {

    const user_id = (await supabase.auth.getUser()).data.user?.id;
    if (user_id === undefined){
        return res.redirect('/#' + new URLSearchParams({ error: 'user_id' }).toString())
    }

    const searchParams = useSearchParams();

    /* パラメーターからcodeとstate取得 */
    const code = searchParams.get("code");
    const state = searchParams.get("state")

    /* Cookieから取得 */
    const cookieStore = cookies();
    const storedState = (await cookieStore).get('spotify_auth_state')?.value;
    const codeVerifier = (await cookieStore).get('spotify_code_verifier')?.value;

    /* Cookieをクリーンアップ */
    deleteCookie('spotify_auth_state', { req, res, path: '/' });
    deleteCookie('spotify_code_verifier', { req, res, path: '/' });

    /* stateを検証 */
    if (state === null || state !== storedState) {
        console.error('State mismatch.');
        return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
    }

    if (codeVerifier === undefined){
        return res.redirect('/#' + new URLSearchParams({ error: 'codeVerifier' }).toString())
    }

    return (
        <Callback code={code} codeVerifier={codeVerifier} user_id={user_id} />
    );
}