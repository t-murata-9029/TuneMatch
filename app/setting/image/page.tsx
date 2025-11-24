'use client'

import { getCurrentUser } from "@/lib/action";
import { supabase } from "@/lib/supabase.cliant";
import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";

// supabaseのバケット名
const BUCKET_NAME = "user_images";

export default function ProfileEditPage() {

    const [loading, setLoading] = useState(false);

    // ファイル選択時の処理 (画像アップロード)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            const file = event.target.files?.[0];

            if (!file) {
                throw new Error('画像ファイルを選択してください。');
            }

            // userIdを取得
            const user = await getCurrentUser();
            const userId = user?.id;

            // ファイルの保存パスを決定 (例: avatars/user_id/timestamp.ext)
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // Supabase Storageにアップロード
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600', // キャッシュ設定
                    upsert: true, // 既存のファイルを上書き
                });

            if (uploadError) {
                throw uploadError;
            }
            // ファイルインプットをリセット
            event.target.value = '';
            console.log("upload成功");
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('画像のアップロード中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                component="label" // クリックでファイル選択ダイアログを開く
                startIcon={loading ? <CircularProgress size={20} /> : <PhotoCamera />}
                disabled={loading}
            >
                {loading ? 'アップロード中...' : '画像を選択'}
                {/* 隠されたファイルインプット */}
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileUpload}
                />
            </Button>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                PNGまたはJPEGファイルを選択してください。
            </Typography>
        </>
    );
}