'use client'

/**
 * アプリに紐づいたSpotifyのトークンを取得する
 * @returns token
 */
export default async function getToken(){
    try {
            const response = await fetch('/api/spotify/get-token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            return data.token;
        } catch (e) {
            throw e;
        }
}