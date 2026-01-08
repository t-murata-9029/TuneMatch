'use client';
// MusicReviewList.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Pagination,
    Stack,
    MenuItem,
    Select,
    Typography,
    SelectChangeEvent,
    Divider,
} from '@mui/material';
import { MusicReviewCard } from './MusicReviewCard';
import { Music_reviews } from '@/types/db';

// ----------------------------------------------------
// 1. 定数定義
// ----------------------------------------------------

const ITEMS_PER_PAGE = 5;
// ★【修正点 1】カードの最大幅と同じ値をリスト全体の最大幅として定義
const CARD_MAX_WIDTH = 500;

// ソートオプションの型とリスト (省略)
// ... (前回のコードのまま)
type SortKey = 'created_at' | 'rating' | 'review_text';
type SortOrder = 'asc' | 'desc';

interface SortOption {
    value: string; // 'key-order' (例: 'rating-desc')
    label: string;
    key: SortKey;
    order: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
    { value: 'created_at-desc', label: '新しい順 (投稿日)', key: 'created_at', order: 'desc' },
    { value: 'created_at-asc', label: '古い順 (投稿日)', key: 'created_at', order: 'asc' },
    { value: 'rating-desc', label: '評価が高い順', key: 'rating', order: 'desc' },
    { value: 'rating-asc', label: '評価が低い順', key: 'rating', order: 'asc' },
];

// ----------------------------------------------------
// 2. コンポーネント定義
// ----------------------------------------------------

interface MusicReviewListProps {
    reviews: Music_reviews[];
    noTitle?: boolean;
    noMusicPlayer?: boolean;
}

export const MusicReviewList = ({ reviews, noTitle=false, noMusicPlayer=false }: MusicReviewListProps) => {
    // ステート管理 (省略)
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);

    // ソートキーと順序を更新するハンドラ (省略)
    const handleSortChange = useCallback((event: SelectChangeEvent<string>) => {
        const selectedOption = SORT_OPTIONS.find(opt => opt.value === event.target.value);
        if (selectedOption) {
            setSortOption(selectedOption);
            setCurrentPage(1);
        }
    }, []);

    // ページネーションハンドラ (省略)
    const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    }, []);

    // ソートとページネーションロジック (useMemo) (省略)
    const sortedAndPaginatedReviews = useMemo(() => {
        // ... (前回のコードのまま)
        const sortedReviews = [...reviews].sort((a, b) => {
            let comparison = 0;
            const key = sortOption.key;

            if (key === 'created_at') {
                const dateA = new Date(a[key].toString()).getTime();
                const dateB = new Date(b[key].toString()).getTime();
                comparison = dateA - dateB;
            } else if (key === 'rating') {
                comparison = a[key] - b[key];
            }
            return sortOption.order === 'asc' ? comparison : -comparison;
        });

        const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

        return {
            paginatedReviews,
            totalPages,
        };
    }, [reviews, currentPage, sortOption]);

    // データがない場合の表示 (省略)
    if (reviews.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    まだレビューがありません。
                </Typography>
            </Box>
        );
    }

    return (
        // ★【修正点 2】最上位のBoxで最大幅を制限し、中央寄せする
        <Box
            sx={{
                maxWidth: CARD_MAX_WIDTH, // カードの最大幅に合わせる
                margin: '0 auto',         // 中央寄せ
                width: '100%',            // 親コンテナの幅全体を使用（ただしmaxWidthで制限される）
                p: 2
            }}
        >

            {/* ソートUIと件数表示 */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                mb={2}
                spacing={{ xs: 1, sm: 0 }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    全 {reviews.length} 件のレビュー
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">
                        並び替え:
                    </Typography>
                    <Select
                        value={sortOption.value}
                        onChange={handleSortChange}
                        size="small"
                        sx={{ minWidth: 150 }}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* レビューカードのリスト */}
            <Stack spacing={3}>
                {/* Card自体は既に中央寄せされているため、ここでは中央寄せのスタイルは不要 */}
                {sortedAndPaginatedReviews.paginatedReviews.map((review) => (
                    // MusicReviewCardは内部で 'margin: 16px auto' を持っているので、そのまま使えます。
                    // ただし、Listコンポーネントで幅を制限したことで、見た目上の「広がり」は解決されます。
                    <MusicReviewCard
                        key={review.id}
                        review={review}
                        noTitle={noTitle}
                        noMusicPlayer={noMusicPlayer}
                    />
                ))}
            </Stack>

            {/* ページネーション (省略) */}
            {sortedAndPaginatedReviews.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={sortedAndPaginatedReviews.totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

        </Box>
    );
};