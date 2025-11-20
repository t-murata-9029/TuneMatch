'use client'; 

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import main_theme from "@/theme/theme"; 

// 👈 ここでPropsの型を定義します
interface ThemeRegistryProps {
  children: React.ReactNode;
}

// 👈 関数引数に型を適用します
export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeProvider theme={main_theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}