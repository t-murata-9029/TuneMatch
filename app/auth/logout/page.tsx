'use client'

import { createClient } from "@/lib/supabase.cliant";
import { Box, Button, Typography, Stack } from "@mui/material";
import { useRouter } from 'next/navigation';

export default function LogOutForm() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('ログアウトに失敗しました:', error);
            return;
        }
        
        router.push('/auth/login');
    }

    const handleBack = () => {
        router.back()
    }

    return (
        <Box 
            sx={{ 
                maxWidth: 400, 
                margin: 'auto', 
                padding: 4, // パディングを少し増やしてゆったりと
                mt: 8, // 上部のマージンで中央に配置
                borderRadius: 2, // 角を丸く
                boxShadow: 3, // 影をつけて立体感を出す
                bgcolor: 'background.paper' // 背景色を設定
            }}
        >
            <Typography 
                variant="h5" // 見出しを大きく
                component="h1" 
                gutterBottom // 下部にマージン
                align="center"
            >
                ログアウトしますか？
            </Typography>

            <Typography 
                variant="body1" 
                align="center" 
                sx={{ mb: 3 }} // 下部にマージン
            >
                セッションを終了して、ログインページに戻ります。
            </Typography>
            
            {/* ボタンを横並びまたは縦並びに整理するためのStackコンポーネント */}
            <Stack 
                spacing={2} // ボタン間の間隔
                direction="column" // ボタンを縦に並べる
            >
                {/* ログアウトボタン（主たるアクション） */}
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleLogout} // handleSubmitからonClickに変更
                    fullWidth // 幅いっぱいに広げる
                    size="large" // 大きめのボタン
                >
                    ログアウト
                </Button>

                {/* 戻るボタン（二次的なアクション） */}
                <Button 
                    variant="outlined" // 枠線のみで区別
                    color="inherit" // デフォルトの色を使用
                    onClick={handleBack} // pagebackからonClickに変更
                    fullWidth
                    size="large"
                >
                    キャンセル / 戻る
                </Button>
            </Stack>
        </Box>
    );
}