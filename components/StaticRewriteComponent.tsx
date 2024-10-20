"use client";
import { useEffect } from "react";

export default function StaticRewriteComponent (props: { uri: string}) {

    const { uri } = props;

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.history.replaceState(
                {},
                "",
                uri
            );
            // window.alert("scrollTo(0,0)");
            window.scrollTo(0,0);
        }
    }, []);

    return (
        <span style={{ visibility: "hidden" }}>
            Update navigation to read {uri}
        </span>
    );
}

