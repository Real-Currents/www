import "./fonts.css";
import "./globals.css";
import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import { Comfortaa, Inter, Bitter, Montserrat, Roboto } from "next/font/google";
import Link from "next/link";
import { HeaderLayoutProps } from "@/types";
import { metadata } from "@/utils";

const comfortaa = Comfortaa({ subsets: ["latin"] });

// TODO: Use metadata props to build header
function HeaderLayout ({ title, description, subtitles }: HeaderLayoutProps) {
  return (
      <header>
          <div id={"trademark"}>
              {(!!subtitles && subtitles.length > 0) ?
                  subtitles.map((s, i) => (<><span key={`sub-${i}`}>{s}</span><br /></>)) :
                  <br />
              }
          </div>

          <div id={"title"} className={"titles"}>
              <Link href={"/"}><h1>
                  {(!!title && title.length > 0) ?
                      title.split("~").map((t, i) => {
                          // console.log(t);
                          return (i % 2 < 1) ?
                              <span key={`title-${i}`} style={{color: "#00FF00"}}>{t}</span> :
                              <span key={`title-${i}`} style={{color: "rgb(17,187,255)"}}>~{t}</span>
                      }) :
                      <></>
                  }
              </h1></Link>
          </div>
      </header>
  );
}

function FooterLayout () {
  return (
      <footer>
          <p id="copyright"></p>
          <p id="built_with">
              ...built with <a href="https://nextjs.org/docs" target="_blank">Next.js</a> 
              & <a href="https://quarto.org/docs/get-started/" target="_blank">Quarto</a>
          </p>
      </footer>
  );
}

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    // console.log(metadata);

  return (
    <html lang="en">
      <body className={comfortaa.className}>

      <div id={"background_container"}>
          <div id={"background_app"} role={"main"} style={{minWidth: "100vw"}}>
          </div>

          <FooterLayout></FooterLayout>
      </div>
      
      <div id={"transparent_background"}></div>
      
      <div id={"home_screen"}>
          <HeaderLayout title={metadata["title"]!}
                        subtitles={metadata["subtitles"]!}
                        description={metadata["description"]!}></HeaderLayout>

          <div id={"content"}>
              {children}
          </div>

      </div>
      </body>
    </html>
  );
}
