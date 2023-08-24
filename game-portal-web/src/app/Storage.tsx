"use client";

const { useEffect } = require("react");


export default function Storage({ token }: { token: string}) {
    useEffect(() => {
        if (token && window.sessionStorage.getItem('token') !== token) {
            window.sessionStorage.setItem('token', token);
        }
    }, [window.sessionStorage.getItem('token')]);
    
    return <></>;
}