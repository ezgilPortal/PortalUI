/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import { CSSTransition } from "react-transition-group";
import classNames from "classnames";

import { AppTopbar } from "./AppTopbar";
import TheContent from "./TheContent";
import pageURL from "../utils/pageUrls";
import { AppMenu } from "./AppMenu";
import { Authority } from "../utils/authority";
import { UserContext } from "../context/UserContext";
import { AppContext } from "../context/AppContext";

export default function TheLayout() {
  const [layoutMode] = useState("static");
  const [layoutColorMode] = useState("light");
  const [inputStyle] = useState("outlined");
  const [ripple] = useState(true);
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
  const { user } = useContext(UserContext);
  const [sideMenu, setSideMenu] = useState([]);
  const { store } = useContext(AppContext);
  const { mode } = store;

  let menuClick = false;
  let mobileTopbarMenuClick = false;

  useEffect(() => {
    const themeHref = `${process.env.REACT_APP_SITE_URL}/assets/themes/${mode === "dark" ? "lara-dark-blue" : "lara-light-blue"}/theme.css`;
    document.querySelector("#theme-link").href = themeHref;
  }, [mode]);

  useEffect(() => {
    if (mobileMenuActive) {
      addClass(document.body, "body-overflow-hidden");
    } else {
      removeClass(document.body, "body-overflow-hidden");
    }
  }, [mobileMenuActive]);

  const onWrapperClick = (event) => {
    if (!menuClick) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }

    if (!mobileTopbarMenuClick) {
      setMobileTopbarMenuActive(false);
    }

    mobileTopbarMenuClick = false;
    menuClick = false;
  };

  const onToggleMenuClick = (event) => {
    menuClick = true;

    if (isDesktop()) {
      if (layoutMode === "overlay") {
        if (mobileMenuActive === true) {
          setOverlayMenuActive(true);
        }

        setOverlayMenuActive((prevState) => !prevState);
        setMobileMenuActive(false);
      } else if (layoutMode === "static") {
        setStaticMenuInactive((prevState) => !prevState);
      }
    } else {
      setMobileMenuActive((prevState) => !prevState);
    }

    event.preventDefault();
  };

  const onMobileTopbarMenuClick = (event) => {
    mobileTopbarMenuClick = true;

    setMobileTopbarMenuActive((prevState) => !prevState);
    event.preventDefault();
  };

  const isDesktop = () => {
    return window.innerWidth >= 992;
  };

  const addClass = (element, className) => {
    if (element.classList) element.classList.add(className);
    else element.className += " " + className;
  };

  const removeClass = (element, className) => {
    if (element.classList) element.classList.remove(className);
    else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
  };

  const onMenuItemClick = (event) => {
    if (!event.item.items) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
  };

  const onSidebarClick = () => {
    menuClick = true;
  };

  const wrapperClass = classNames("layout-wrapper", {
    "layout-overlay": layoutMode === "overlay",
    "layout-static": layoutMode === "static",
    "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
    "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
    "layout-mobile-sidebar-active": mobileMenuActive,
    "p-input-filled": inputStyle === "filled",
    "p-ripple-disabled": ripple === false,
    "layout-theme-light": layoutColorMode === "light",
  });

  const menu = [
    { code: Authority.Home, label: "Yangın Alarm & Hata Bildirim İzleme ", icon: "pi pi-fw pi-home", to: pageURL.home },
    {
      code: Authority.ProductManagment,
      label: "Ürün Yönetimi",
      icon: "pi pi-th-large",
      items: [
        { code: Authority.IOTDeviceManagment, label: "IOT İzleme Cihaz Yönetimi", to: pageURL.ProductIOT },
        { code: Authority.IOTDeviceManagment, label: "IOT Ekranlı Cihaz Yönetimi", to: pageURL.ProductIOTDisplay },
        { code: Authority.IOTDisplayDeviceManagment, label: "IOT Olmayan Cihaz Yönetimi", to: pageURL.ProductNonIOT },
        { code: Authority.IOTDeviceModelManagment, label: "IOT Cihaz Model Yönetimi", to: pageURL.ProductIOTModel },
      ],
    },
    { code: Authority.DeviceLog, label: "IOT Cihazları Durum izleme", icon: "pi pi-box", to: pageURL.deviceLog },
    { code: Authority.DeviceLog, label: "Alarm Hata Logları Rapor", icon: "pi pi-box", to: pageURL.deviceReport },
    { code: Authority.ServiceLog, label: "Servis Raporu", icon: "pi pi-box", to: pageURL.report },
    { code: Authority.WorkSchedule, label: "İş Takvimi", icon: "pi pi-box", to: pageURL.workSchedule },
    {
      code: Authority.LocationManagment,
      label: "Mahal Yönetimi",
      to: pageURL.Location,
      icon: "pi pi-th-large",
    },
    {
      code: Authority.SystemManagment,
      label: "Sistem Yönetimi",
      icon: "pi pi-th-large",
      items: [
        { code: Authority.UserManagment, label: "Kullanıcı Yönetimi", to: pageURL.UserManagement },
        { code: Authority.RoleManagement, label: "Rol Yönetimi", to: pageURL.RoleManagement },
        { code: Authority.AuthorityManagment, label: "Yetki Yönetimi", to: pageURL.Authority,
        },
      ],
    },
  ];

  useEffect(() => {
    const filterMenu = menu
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const subItems = [];
          item.items.map((sub) => {
            if (user?.authorityCodes.includes(sub.code)) {
              subItems.push(sub);
            }
          });

          if (user?.authorityCodes.includes(item.code)) {
            return { ...item, items: subItems };
          }
        } else {
          if (user?.authorityCodes.includes(item.code)) {
            return item;
          }
        }
      })
      .filter((item) => typeof item !== "undefined");

    setSideMenu([{ items: filterMenu }]);
  }, [user]);

  return (
    <div className={wrapperClass} onClick={onWrapperClick}>
      <AppTopbar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode} mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} />

      <div className="layout-sidebar" onClick={onSidebarClick}>
        <AppMenu user={user} model={sideMenu} onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode} />
      </div>

      <TheContent />

      <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={mobileMenuActive} unmountOnExit>
        <div className="layout-mask p-component-overlay"></div>
      </CSSTransition>
    </div>
  );
}
