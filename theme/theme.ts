import { createTheme } from "@mui/material";

const main_theme = createTheme({
    palette: {
        primary: {
            main: '#FF69B4',
            contrastText: '#ffffffff',
        },
        secondary: {
            main: '#FF7F50',
            contrastText: '#ffffffff',
        },
        background: {
            default: '#ffffffff',
        },
        text: { primary: '#000000' },
    },
    typography: {
        h1: {
            color: "#FF7F50",
        },
        h2: {
            color: "#FF7F50",
        },
        h3: {
            color: "#FF7F50",
        },
        h4: {
            color: "#FF7F50",
        },
        h5: {
            color: "#FF7F50",
        },
        h6: {
            color: "#FF7F50",
        },
    },
    components: {
        // 既存のボタン設定
        MuiButton: {
            defaultProps: {
                color: 'primary',
            },
        },
        // テキストフィールドのデフォルトを primary に変更
        MuiTextField: {
            defaultProps: {
                color: 'primary',
            },
        },
        // チェックボックスのデフォルトを primary に変更
        MuiCheckbox: {
            defaultProps: {
                color: 'primary',
            },
        },
        MuiIcon: {
            defaultProps: {
                color: 'secondary'
            }
        },
        MuiSvgIcon: {
            defaultProps: {
                // デフォルトの color prop を secondary (今のテーマでは #FF7F50) に設定
                color: 'secondary',
            },
        },
        MuiCard: {
            styleOverrides: {
                // styleOverrides はテーマを受け取る関数形式で書くのがベストプラクティス
                root: ({ theme }) => ({
                    transition: theme.transitions.create(['box-shadow', 'transform' ], {
                        duration: theme.transitions.duration.standard,
                    }),
                    '&:hover': {
                        boxShadow: theme.shadows[6], 
                        transform: 'translateY(-5px)', 
                    },
                }),
            },
        },
    },
});

export default main_theme;