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
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { postReviewState } from '../../types/forms/review';

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

export default function ReviewPage() {

  const dataJson = sessionStorage.getItem('selectedItem');
  const data = dataJson ? JSON.parse(dataJson) : null;

  const router = useRouter();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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
            <Typography variant="h5" fontWeight="bold">
              {'レビュー投稿画面'}
            </Typography>

            {data && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Box
                  sx={(theme) => ({
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `2px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                      }`,
                    flexShrink: 0,
                  })}
                >
                  <img
                    src={data.albumImage || '/noimage.png'}
                    alt="album image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {data.trackName}
                  </Typography>
                  <Box sx={{ height: 8 }} /> {/*空白追加*/}
                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                    {data.artistName}
                  </Typography>
                </Box>
              </Box>
            )}

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
              sx={{ width: '100%' }}
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
    </NoSsr >
  );
}
