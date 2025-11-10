'use client'
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
            const token = data.token
            return response;  
        } catch (e) {
            throw e;
        }
}