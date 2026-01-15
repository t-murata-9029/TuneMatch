'use client'

import { useEffect, useState } from "react"
import { getRecommendsList } from "../endpoints"
import { Avatar, Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import { Recommends } from "../types";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import { error } from "console";
import MatchOverlay from "./MatchOverlay";

/**
 * おすすめの人を表示するよ
 */
export default function RecommendsList() {
    const [recommendsList, setRecommendsList] = useState<Recommends[]>();
    const [myUserId, setMyUserId] = useState("");

    // マッチしたか判断するための変数、中身は相手のuserId
    const [isMatched, setIsMatched] = useState<string | null>(null);

    useEffect(() => {
        const setData = async () => {
            // おすすめの人のリストを取得
            const list = await getRecommendsList();
            setRecommendsList(list)

            // 自分のuserIdを取得
            const user = await getCurrentUser();
            if (user?.id) {
                setMyUserId(user?.id);
            }
        }
        setData();
        console.log(recommendsList)
    }, [])

    /*--- ユーザーがLike押したときの処理 ---*/
    const handleLike = async (targetId: string, match_percentage: number) => {
        // DBに登録
        const { error: insertError } = await supabase.from("swipe_actions").insert({
            swiper_id: myUserId,
            swiped_id: targetId,
            action_type: "LIKE",
        });

        if (insertError) {
            console.log(insertError)
            throw new Error("DBに登録しようとしたらエラー起きましたよ。")
        }

        // 相手がLIKEしてるか確認
        const { count, error: getError } = await supabase
            .from("swipe_actions")
            .select('*', { count: 'exact', head: true })
            .eq("swiper_id", targetId)
            .eq("swiped_id", myUserId)
            .eq("action_type", "LIKE");

        if (getError) {
            console.log("getERRRR")
            console.log(getError);
            console.log(count)
            throw new Error("DBからデータを取得しようとしたらエラーになりました。")
        }

        // マッチしたら
        if (count != null && count > 0) {

            // UUIDの順番を保証する
            const [user1_id, user2_id] =
                myUserId < targetId
                    ? [myUserId, targetId]
                    : [targetId, myUserId]

            // DBに登録
            const { error: matchError } = await supabase.from("matches").insert({
                user1_id: user1_id,
                user2_id: user2_id,
                vibe_match_percentage: match_percentage,
            })

            if (matchError) {
                console.log(matchError);
                throw new Error("DBに登録しようとしたらエラーが起きました。")
            }

            setIsMatched(targetId);

            return;
        }

        // 選択したユーザーをリストから消す
        setRecommendsList(prev =>
            prev?.filter(r => r.user.id !== targetId)
        );

        return;
    };

    /*--- ユーザーがDislike押したときの処理 ---*/
    const handleDislike = async (targetId: string) => {
        // DBに登録
        const { error: insertError } = await supabase.from("swipe_actions").insert({
            swiper_id: myUserId,
            swiped_id: targetId,
            action_type: "SKIP",
        });

        // 選択したユーザーをリストから消す
        setRecommendsList(prev =>
            prev?.filter(r => r.user.id !== targetId)
        );
    }


    if (isMatched) {
        // recommendsListからマッチしたユーザーを取り出す
        const targetUser = recommendsList?.filter(r => r.user.id == isMatched)[0].user;

        // マッチングオーバーレイコンポーネントを呼び出す
        if (targetUser) {
            return <MatchOverlay targetUser={targetUser} />;
        }
    }


    if (recommendsList?.length == 0) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center" // 縦方向の中央揃え
                alignItems="center"     // 横方向の中央揃え
                minHeight="80vh"       // 画面いっぱいの高さにする（または '300px' など任意の高さ）
                gap={2}
            >
                <Typography variant="h6">
                    おすすめの人はいないみたいです...
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box display="flex" flexDirection="column" gap={2}>
                {recommendsList?.map((recommend) => (
                    <Card key={recommend.user.id} sx={{ minWidth: 575, maxWidth: 720, mx: "auto" }} >
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>

                                {/* 左：アバター */}
                                <Avatar
                                    src={`https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/${recommend.user.id}/${recommend.user.id}`}
                                    alt={recommend.user.username}
                                    sx={{ width: 56, height: 56, flexShrink: 0 }}
                                />

                                {/* 中央：テキスト */}
                                <Box flexGrow={1}>
                                    <Typography variant="h6" component="a" href={"/user/" + recommend.user.id}>
                                        {recommend.user.username}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        類似度: {recommend.similarityScore}
                                    </Typography>

                                    <Typography variant="body2">
                                        一致した項目：{recommend.matchReasons.mostSimilarKeys[0]}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {recommend.user.profile_text}
                                    </Typography>
                                </Box>

                                {/* 右：アクション */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                >
                                    <IconButton
                                        color="success"
                                        onClick={() => handleLike(recommend.user.id, recommend.similarityScore)}
                                    >
                                        <ThumbUpOffAltIcon
                                            fontSize="large"
                                            sx={{ cursor: "pointer", color: "success.main" }}
                                        />
                                    </IconButton>
                                    <IconButton
                                        color="success"
                                        onClick={() => handleDislike(recommend.user.id)}
                                    >
                                        <ThumbDownOffAltIcon
                                            fontSize="large"
                                            sx={{ cursor: "pointer", color: "error.main" }}
                                        />
                                    </IconButton>
                                </Box>

                            </Box>
                        </CardContent>
                    </Card>

                ))}
            </Box>
        </>
    );
}