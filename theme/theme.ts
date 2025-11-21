import { createTheme } from "@mui/material";

const main_theme = createTheme({
    palette: {
        primary: {
            main: '#FF69B4',
            contrastText: '#ffffffff',
        },
        background: {
            default: '#ffffffff',
        },
        text: { primary: '#000000' },
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
    },
});

export default main_theme;