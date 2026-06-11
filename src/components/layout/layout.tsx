import { Outlet } from "react-router-dom";
import { SessionProvider } from "../provider/session";

const Layout = () => {
    return (
      <>
      <Outlet />
      <SessionProvider />
      </>
    );
}

export default Layout;