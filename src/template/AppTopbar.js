import classNames from "classnames";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { UserContext } from "../context/UserContext";
import { ToggleButton } from "primereact/togglebutton";
import { AppContext } from "../context/AppContext";

export const AppTopbar = (props) => {
  const { logout } = useContext(UserContext);
  const { store, actions } = useContext(AppContext);

  const handleThemeMode = (e) => {
    actions.changeTheme(e.value ? "dark" : "light");
  };

  return (
    <div className="layout-topbar">
      <Link to="/" className="layout-topbar-logo flex justify-content-center">
        <img className="w-10" src={"/ezgil-logo.svg"} alt="logo" />
      </Link>

      <button type="button" className="p-link  layout-menu-button layout-topbar-button" onClick={props.onToggleMenuClick}>
        <i className="pi pi-bars" />
      </button>

      <button type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={props.onMobileTopbarMenuClick}>
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul className={classNames("layout-topbar-menu lg:flex origin-top align-items-center", { "layout-topbar-menu-mobile-active": props.mobileTopbarMenuActive })}>
        <li className="flex align-items-center">
          <ToggleButton className="mr-2" checked={store?.mode === "light" ? false : true} onChange={(e) => handleThemeMode(e)} onIcon="pi pi-moon" offIcon="pi pi-sun" onLabel="" offLabel="" />
        </li>
        <li>
          <Button label="Çıkış Yap" onClick={() => logout()} aria-controls="popup_menu" aria-haspopup icon="pi pi-sign-out" iconPos="right" />
        </li>
      </ul>
    </div>
  );
};
