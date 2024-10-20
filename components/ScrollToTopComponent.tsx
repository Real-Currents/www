"use client";
import { useEffect } from "react";

export default function ScrollToTopComponent () {

    useEffect(() => {
        if (typeof window !== "undefined") {
            // window.alert("scrollTo(0,0)");
            window.scrollTo(0,0);
        }
    }, []);

    return (
        <span style={{ visibility: "hidden" }}>
            Scroll to top of window
        </span>
    );
}

