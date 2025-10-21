'use client';

// 必要なインポートのみを残し、不必要なものを削除/修正
import { getCookie, deleteCookie } from 'cookies-next'; // Client Componentで使えるCookieライブラリ
import { createClient } from "@/lib/supabase.cliant";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// NextApiRequest, NextApiResponse, cookies (サーバー用) などは削除
import Callback from "@/features/routes/auth/spotify/callback/components/Callback"; // Callbackコンポーネントはそのまま利用

// クエリパラメーターの型定義 (このコンポーネントではPropsではなくuseSearchParamsで取得するので不要な可能性が高い)
// type Props = {
//     searchParams: {
//         code: string;
//         state: string;
//     }
// };

// 💡 1. コンポーネント関数は同期的に定義する (asyncを削除)
export default function CallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // stateは初期値を設定
    const [code, setCode] = useState<string | null>(null);
    const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true); // 処理中を示すState

    useEffect(() => {
        const handleCallbackLogic = async () => {
            setIsLoading(true);

            /* 💡 2. Supabase認証情報の取得と検証をuseEffect内に移動 */
            const supabase = createClient()
            const { data: userData } = await supabase.auth.getUser();
            const currentUserId = userData.user?.id;
            setUserId(currentUserId);
            
            // ユーザーIDがない場合はリダイレクトし、処理を終了
            if (currentUserId === undefined) {
                router.replace('/#' + new URLSearchParams({ error: 'user_id' }).toString());
                setIsLoading(false);
                return;
            }

            /* パラメーターからcodeとstate取得 */
            const paramCode = searchParams.get("code");
            const state = searchParams.get("state");

            // codeを取得
            if (paramCode) {
                setCode(paramCode);
            } else {
                router.replace('/#' + new URLSearchParams({ error: 'no_code' }).toString());
                setIsLoading(false);
                return;
            }

            /* Cookieから値を取得 (cookies-nextを使用) */
            const storedState = getCookie('spotify_auth_state', { path: '/' })?.toString() || null;
            const verifier = getCookie('spotify_code_verifier', { path: '/' })?.toString() || null;
            
            setCodeVerifier(verifier); // verifierをstateにセット

            /* 💡 stateを検証 */
            if (state === null || state !== storedState || storedState === null) {
                console.error('State mismatch or missing stored state.');
                // 必須項目がない場合もリダイレクト
                router.replace('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
                
                // Cookieを削除してから終了
                deleteCookie('spotify_auth_state', { path: '/' });
                deleteCookie('spotify_code_verifier', { path: '/' });
                setIsLoading(false);
                return;
            }
            /* 💡 Code Verifierのチェック */
            if (verifier === null || verifier === undefined) {
                 router.replace('/#' + new URLSearchParams({ error: 'codeVerifier_missing' }).toString());
                 setIsLoading(false);
                 return;
            }
            /* 💡 Cookieをクリーンアップ（削除） */
            // 処理が成功または失敗した場合に削除
            deleteCookie('spotify_auth_state', { path: '/' });
            deleteCookie('spotify_code_verifier', { path: '/' });

            setIsLoading(false); // 全ての処理が完了
        };

        handleCallbackLogic();
    }, [router, searchParams]); // 依存配列にrouterとsearchParamsを含める

    // ローディング中または必須データがない場合はローディング表示
    if (isLoading || code === null || codeVerifier === null || userId === undefined) {
        console.log(codeVerifier)
        return <div>処理中です...</div>;
    }

    // 💡 全ての検証がOKの場合のみCallbackコンポーネントを表示
    return (
        <Callback code={code} codeVerifier={codeVerifier} user_id={userId} />
    );
}