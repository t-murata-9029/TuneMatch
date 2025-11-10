'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  Box,
  Button,
  TextField,
  Rating,
  NoSsr,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { postReviewState } from '../types/forms/review';
import { getCurrentUser } from '@/lib/action';
import { supabase } from '@/lib/supabase.cliant';

const labels: { [index: number]: string } = {
  1: '聞くに値しない',
  2: '10年に一度なら',
  3: 'まぁまぁ',
  4: '月に一回なら',
  5: '毎日きける',
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

async function getMusic() {

  // userData取得
  const userData = await getCurrentUser();

  if (userData == null) {
    return
  }

  //仮でユーザidから取得してる、でき次第書き換え(下の/連続まで)
  const user_id = userData.id;

  let spotify_access_token;

  try {

    const { data, error } = await supabase
      .from('users')
      .select('spotify_access_token')
      .eq('id', user_id)
      .single()

    if (error || !data) {
      console.error('トークン取得失敗', error)
      return
    }

    spotify_access_token = data.spotify_access_token;

  } catch (err) {
    console.error('Supabase select failed users', err);
  }

  console.log("acccesstoken:" + spotify_access_token);

  /////////////////////////////////////////////////////////////////////

  const query = 'UVERworld,EPIPHANY';

  const type = 'album';

  const limit = '3';

  const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`;

  const result = await fetch(url, {
    headers: {
      Authorization: `Bearer ${spotify_access_token}`
    }
  }
  )

  const text = await result.text();
  console.log('Spotify raw response:', text);

  try {
    const data = JSON.parse(text);
    console.log('Parsed JSON:', data);
  } catch (err) {
    console.error('Not valid JSON:', text);
  }
}


export default function ReviewPage() {
  const router = useRouter();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 🔹 テーマ内で TextField の border スタイルを統一
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: prefersDarkMode ? 'dark' : 'light' },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#ffffff' : '#000000',
                  borderWidth: 2,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#64b5f6' : '#42a5f5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#2196f3' : '#1565c0',
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode]
  );

  React.useEffect(() => {
    const fetchMusic = async () => {
      try {
        await getMusic();
      } catch (e) {
        console.error('getMusic failed:', e);
      }
    };

    fetchMusic();
  }, []);


  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState<number | null>(2);
  const [hover, setHover] = React.useState(-1);

  const handleSubmit = () => {
    const reviewData: postReviewState = {
      review: text,
      rating: rating ?? 1,
    };
    sessionStorage.setItem('reviewData', JSON.stringify(reviewData));
    router.push('/review/analysis');
  };

  return (
    <NoSsr>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '80%', maxWidth: 500 }}>
            <h2>レビュー投稿画面</h2>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name="hover-feedback"
                value={rating}
                precision={1}
                getLabelText={getLabelText}
                onChange={(event, value) => setRating(value)}
                onChangeActive={(event, hoverValue) => setHover(hoverValue)}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              {rating !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>}
            </Box>

            <TextField
              label="レビュー"
              multiline
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ width: '100%' }} // 枠線はテーマに任せる
            />

            <Button
              variant="outlined"
              onClick={handleSubmit}
              sx={{ width: 'auto', alignSelf: 'flex-end', px: 3, py: 1.5 }}
            >
              レビュー投稿
            </Button>
          </Box>
        </Box>
      </ThemeProvider>
    </NoSsr>
  );
}
