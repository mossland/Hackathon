"use client";

export default function Storage({ token }: { token: string}) {
    if (typeof window !== "undefined") {
        if (token && window.sessionStorage.getItem('token') !== token) {
            window.sessionStorage.setItem('token', token);
        }
    }
    
    return <></>;
}