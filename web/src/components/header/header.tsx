
import Image from "next/image";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from "./header.module.css";
export const Header = () => {
  const router = useRouter();
  const [showLogo, setShowLogo] = useState(router.pathname !== "/");
  useEffect(() => {
    setShowLogo(router.pathname !== "/");
  }, [router.pathname]);
  let headerClasses = `${styles.header} row align-center`;
  if (showLogo) {
    headerClasses += ' justify-between';
  } else {
    headerClasses += ' justify-end';
  }
  return (
    <div
      className={headerClasses}
    >
      {showLogo && <Image
        src="/logo.png"
        width="198"
        height="42"
        alt="Moby IT"
        style={{ cursor: "pointer" }}
        onClick={() => router.replace("/")}
      />}
      <span>
        Made By{" "}
        <a href="https://moby-it.com" target="_black">
          Moby IT
        </a>
      </span>
    </div>
  );
};
