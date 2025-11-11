// app/account/delete/DeleteForm.tsx (クライアントコンポーネント)

'use client'

import { getCurrentUser } from "@/lib/action";
// createClient は不要になります
import { Box, Button, Typography, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteForm() {
    const router = useRouter();
    const [openDialog, setOpenDialog] = useState(false);
    // 処理中の状態を管理するstateを追加
    const [isDeleting, setIsDeleting] = useState(false); 

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // 実際の削除処理（APIルートを呼び出す）
    const handleDelete = async () => {
        setIsDeleting(true); // 削除処理開始
        handleCloseDialog(); // ダイアログを閉じる

        // 1. ユーザーIDの取得 (現在のセッション情報から)
        const userData = await getCurrentUser();
        if(!userData){
            console.error('ユーザー情報が見つかりません');
            setIsDeleting(false);
            // ユーザーへのフィードバック処理
            return
        }

        try {
            // 2. サーバーサイドのAPIルートを呼び出す
            const response = await fetch('/api/auth/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // ユーザーIDをサーバーに送信
                body: JSON.stringify({ userId: userData.id }),
            });

            if (!response.ok) {
                // APIルートからのエラーレスポンスを処理
                const errorData = await response.json();
                throw new Error(errorData.error || 'アカウント削除に失敗しました');
            }
            
            // 3. 削除成功後の処理
            alert('アカウントを削除しました。');
            router.push('/auth/login');

        } catch (e) {
            console.error('アカウント削除エラー:', e);
            alert(`アカウント削除に失敗しました: ${e instanceof Error ? e.message : '不明なエラー'}`);
        } finally {
            setIsDeleting(false); // 処理終了
        }
    }

    const handleBack = () => {
        router.back()
    }

    return (
        <>
            <Box 
                sx={{ 
                    maxWidth: 400, 
                    margin: 'auto', 
                    padding: 4,
                    mt: 8,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography 
                    variant="h5"
                    component="h1" 
                    gutterBottom
                    align="center"
                    color="error"
                >
                    アカウントを削除します
                </Typography>

                <Typography 
                    variant="body1" 
                    align="center" 
                    sx={{ mb: 3 }}
                >
                この操作は元に戻せません。
                    <br />
                    お客様の全てのアカウントデータが永続的に失われます。
                </Typography>
                
                <Stack 
                    spacing={2}
                    direction="column"
                >
                    {/* 削除ボタン */}
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={handleOpenDialog}
                        fullWidth
                        size="large"
                        disabled={isDeleting} // 処理中は無効化
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null} // ローディング表示
                    >
                        {isDeleting ? '削除中...' : 'アカウントを削除する'}
                    </Button>

                    {/* 戻るボタン */}
                    <Button 
                        variant="outlined"
                        color="inherit"
                        onClick={handleBack}
                        fullWidth
                        size="large"
                        disabled={isDeleting}
                    >
                        キャンセル / 戻る
                    </Button>
                </Stack>
            </Box>

            {/* 確認ダイアログ (変更なし) */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: 'error.main' }}>
                    {"最終確認：アカウントを完全に削除しますか？"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        このアクションは取り消せません。削除を実行すると、お客様のユーザーデータ、および関連する全ての情報が永続的に失われます。
                        本当にアカウントを削除してもよろしいですか？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" variant="outlined" disabled={isDeleting}>
                        キャンセル
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained" 
                        autoFocus
                        disabled={isDeleting}
                    >
                        完全に削除する
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}