'use client'

import React, { useState, useEffect, useCallback } from 'react';

import {
    Avatar,
    Button,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { supabase } from '@/lib/supabase.cliant';

interface AvatarUploadProps {
    userId: string; // ユーザーのID
    defaultAvatarPath: string | null; // 現在のプロフィール画像のStorageパス
    onUploadSuccess: (path: string) => void; // アップロード成功時のコールバック
}

const BUCKET_NAME = 'user_images'; // 作成したバケット名

export default function UploadUserImage({
    userId,
    defaultAvatarPath,
    onUploadSuccess,
}: AvatarUploadProps) {
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Storageから画像のURLを取得する関数
    const getAvatarUrl = useCallback(async (path: string) => {
        try {
            setLoading(true);
            // Supabase Storageから公開URLを取得
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
            console.log("storageUrl : " + data)

            setAvatarUrl(data.publicUrl);
        } catch (error) {
            console.error('Error fetching avatar URL:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // 既存のパスがあればURLを取得
        if (defaultAvatarPath) {
            getAvatarUrl(defaultAvatarPath);
        }
    }, [defaultAvatarPath, getAvatarUrl]);

    // ファイル選択時の処理 (画像アップロード)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            const file = event.target.files?.[0];

            if (!file) {
                throw new Error('画像ファイルを選択してください。');
            }

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

            // アップロード成功後、新しいURLを取得し、親コンポーネントにパスを通知
            getAvatarUrl(filePath);
            onUploadSuccess(filePath); // 新しいパスをデータベースに保存するために親に通知

            // ファイルインプットをリセット
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('画像のアップロード中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* 1. プロフィール画像表示 */}
            <Avatar
                src={avatarUrl || ''} // URLがあれば表示
                alt={avatarUrl ? 'プロフィール画像' : 'アバターなし'}
                sx={{ width: 100, height: 100, mb: 2 }}
            />

            {/* 2. 画像選択ボタン */}
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
        </Box>
    );
}