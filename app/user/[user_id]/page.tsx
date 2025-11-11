import { supabase } from "@/lib/supabase.cliant";
import { User } from "@/types/db";
import { Typography } from "@mui/material";

interface UserPageProps {
  params: {
    user_id: string;
  };
}

export default function PostPage({ params }: UserPageProps) {
  const user_id = params.user_id;

  const userData = supabase.from("users").select("*").eq("id", user_id);
  const token = supabase.from("users").select("spotify_token").eq("id", user_id);

  const user: User = {
    id: "aaa",
    gender: "female",
    username: "adafs"
  }
  
  return (
    <div>
      <h1>User ID: {user_id}</h1>
      {/* 投稿データを取得・表示する処理 */}
      
    </div>
  );
}