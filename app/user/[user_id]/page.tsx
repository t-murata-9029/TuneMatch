import { getCurrentUser } from "@/lib/action";
import { supabase } from "@/lib/supabase.cliant";
import { User } from "@/types/db";
import { Box, Divider, Link, Typography } from "@mui/material";

interface UserPageProps {
  params: {
    user_id: string;
  };
}

export default async function PostPage({ params }: UserPageProps) {
  // URLからuser_idを取得
  const user_id = params.user_id;

  // DBからユーザーの情報を取得
  const { data, error } = await supabase.from("users").select("*").eq("id", user_id).single()
  if (error) {
    console.error("DBのアクセスに失敗しました。")
  }
  const user: User = data as User;

  // mypageか特定
  const userData = await getCurrentUser();
  if (!userData) {
    console.error("userData取得できませんでした。")
  }
  const isMypage = userData?.id == data.id;

  // 性別を取得、色を変更
  let color = "blue"
  if (user.gender == 'female') {
    color = 'red';
  }

  return (
    <Box>
      <Typography variant="h5">
        <Box component="span" color={color}>
          {user.username}
        </Box>
        さん
      </Typography>
      <Divider />
      {
      }
      <Link href={"#"}>プロフィール画像をアップロードする</Link>
    </Box>
  );
}