'use client'

import { getCurrentUser } from "@/lib/action";
import { PhotoCamera, Edit, Save, Close } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Link,
    Typography,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { User, User_images } from "@/types/db";
import { supabase } from "@/lib/supabase.cliant";

const BUCKET_NAME = "user_images";

interface UserProfile {
    username: string;
    bio: string;
}

export default function ProfileEditPage() {
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userImage, setUserImage] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profileText, setProfileText] = useState<string>("");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>({
        username: "",
        bio: "",
    });
    const [saveLoading, setSaveLoading] = useState(false);

    // 初期化：ユーザー情報を読み込む
    useEffect(() => {
        const initializeUser = async () => {
            try {
                const user = await getCurrentUser();

                console.log(user);

                if (user?.id) {
                    setUserId(user.id);

                    // usersテーブルからプロフィール情報取得
                    const { data, error: err } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id);

                    if (err || !data) {
                        console.error('users情報取得時エラー', err);
                    }

                    const userData: User = data?.[0] as unknown as User;

                    console.log(userData);

                    setUsername(userData?.username || "");
                    setProfileText(userData?.profile_text || "");
                    // 画像URLを正しく設定
                    setUserImage(
                        `https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/${user.id}/${user.id}`
                    );
                }
            } catch (error) {
                console.error("Error initializing user:", error);
            }
        };
        initializeUser();
    }, []);

    // ファイル選択時の処理 (画像アップロード)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            const file = event.target.files?.[0];

            if (!file) {
                throw new Error("画像ファイルを選択してください。");
            }

            if (!userId) {
                throw new Error("ユーザーIDが見つかりません。");
            }

            // ファイルの保存パスを決定
            const fileName = userId;
            const filePath = `${userId}/${fileName}`;
            const mimeType = file.type;

            // SupabaseのStorageにアップロード
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: "1",
                    upsert: true,
                    contentType: mimeType,
                });

            if (uploadError) {
                throw uploadError;
            }

            // 画像URLを更新
            setUserImage(
                `https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/${userId}/${userId}?
                t=${Date.now()}`
            );

            // ファイルインプットをリセット
            event.target.value = "";
            console.log("Upload成功");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("画像のアップロード中にエラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    // プロフィール編集ダイアログを開く
    const handleOpenEditDialog = () => {
        setEditedProfile({
            username: username,
            bio: profileText,
        });
        setEditDialogOpen(true);
    };

    // プロフィール編集ダイアログを閉じる
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
    };

    // プロフィール情報を保存
    const handleSaveProfile = async () => {
        try {
            setSaveLoading(true);
            if (!userId) {
                throw new Error("ユーザーIDが見つかりません。");
            }

            // プロフィール更新情報登録
            const { error: err } = await supabase
                .from('users')
                .update({
                    'username': editedProfile.username,
                    'profile_text': editedProfile.bio
                })
                .eq('id', userId);

            if (err) {
                console.log('usersテーブル更新時エラー：', err);
            }

            setUsername(editedProfile.username);
            setProfileText(editedProfile.bio);
            setEditDialogOpen(false);
            // alert("プロフィールを更新しました。");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("プロフィール更新中にエラーが発生しました。");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 3 }}>
            {/* ヘッダー */}
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                プロフィール設定
            </Typography>

            {/* 画像セクション */}
            <Box sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            mb: 2,
                            backgroundColor: "#f0f0f0",
                            fontSize: "48px",
                        }}
                        alt="user image"
                        src={userImage}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={loading ? <CircularProgress size={20} /> : <PhotoCamera />}
                        disabled={loading}
                        sx={{ mb: 1 }}
                    >
                        {loading ? "アップロード中..." : "プロフィール画像を変更"}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Typography variant="caption" color="textSecondary">
                        PNGまたはJPEGファイル（最大5MB）
                    </Typography>
                </Box>
            </Box>

            {/* プロフィール情報セクション */}
            <Box sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        プロフィール情報
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={handleOpenEditDialog}
                    >
                        編集
                    </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>
                        ニックネーム
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {username || "未設定"}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>
                        プロフィール
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 400,
                            color: profileText ? "text.primary" : "text.secondary",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {profileText || "プロフィールを追加"}
                    </Typography>
                </Box>
            </Box>

            {/* アカウント管理セクション */}
            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    アカウント管理
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button
                    component={Link}
                    href="/auth/delete"
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ textTransform: "none" }}
                >
                    アカウントを削除
                </Button>
            </Box>

            {/* プロフィール編集ダイアログ */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>プロフィール編集</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="ニックネーム"
                        fullWidth
                        value={editedProfile.username}
                        onChange={(e) =>
                            setEditedProfile({ ...editedProfile, username: e.target.value })
                        }
                        placeholder="ニックネームを入力"
                        margin="normal"
                        maxRows={1}
                    />
                    <TextField
                        label="プロフィール"
                        fullWidth
                        value={editedProfile.bio}
                        onChange={(e) =>
                            setEditedProfile({ ...editedProfile, bio: e.target.value })
                        }
                        placeholder="プロフィールを入力（最大200文字）"
                        margin="normal"
                        multiline
                        rows={4}
                        maxRows={4}
                        inputProps={{ maxLength: 200 }}
                        helperText={`${editedProfile.bio.length}/200`}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCloseEditDialog}
                        startIcon={<Close />}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSaveProfile}
                        variant="contained"
                        disabled={saveLoading}
                        startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                    >
                        {saveLoading ? "保存中..." : "保存"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}