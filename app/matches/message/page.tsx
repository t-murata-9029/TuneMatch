'use client';

import {
    Box,
    NoSsr,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    Avatar
} from "@chatscope/chat-ui-kit-react";


export default function Page() {
    const router = useRouter();

    useEffect(() => {
    });

    return (
        <NoSsr>
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
                <div style={{ position: "relative", height: "500px" }}>
                    <MainContainer>
                        <ChatContainer>
                            <MessageList>
                                <Message
                                    model={{
                                        message: "Hello my friend",
                                        sentTime: "just now",
                                        sender: "Joe",
                                        position: "normal",
                                        direction: "incoming"
                                    }}
                                />
                            </MessageList>
                            <MessageInput placeholder="Type message here" />
                        </ChatContainer>
                    </MainContainer>
                </div>
            </Box>
        </NoSsr>
    );
}