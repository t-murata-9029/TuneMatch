'use client'

import { getCurrentUser } from "@/lib/action";
import { supabase } from "@/lib/supabase.cliant";
import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { User_images } from '@/types/db'
import checkMainProfileImageExists from "@/utils/supabase/checkMainProfileImageExists";

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
            if (userId == undefined) {
                throw new Error('ユーザーIDの取得に失敗しました。');
            }

            // ファイルの保存パスを決定 (例: avatars/user_id/timestamp.ext)
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;
            const mimeType = file.type;

            // SupabaseのStorageにアップロード
            const { error: uploadError } = await supabase.storage
                .from('user_images') // バケット名
                .upload(filePath, file, {
                    upsert: true,
                    contentType: mimeType,
                });

            if (uploadError) {
                throw uploadError;
            }            
            /*
            // ファイルの保存パスを決定 (例: avatars/user_id/timestamp.ext)
            const fileExt = file.name.split('.').pop();
            const now = Date.now();
            const fileName = `${now}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;
            const mimeType = file.type;

            // SupabaseのStorageにアップロード
            const { error: uploadError } = await supabase.storage
                .from('user_images') // バケット名
                .upload(filePath, file, {
                    upsert: true,
                    contentType: mimeType,
                });

            if (uploadError) {
                throw uploadError;
            }

            // DBのテーブルにも登録
            const IsMainImage = await checkMainProfileImageExists(userId) != null;

            const imageData: User_images = {
                id: now,
                user_id: userId,
                image_url: filePath,
                priority: 0,
                is_main_profile_image: IsMainImage
            }

            const { error: insertError } = await supabase.from("user_images").insert(imageData);

            if (insertError){
                throw new Error("DBに画像を保存できませんでした。")
            }
            */
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