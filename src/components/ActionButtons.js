import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function ActionButtons(props) {
  const { user } = useContext(UserContext);
  return (
    <div className="flex" style={{ gap: "10px" }}>
      {Array.isArray(props.children) ? (
        React.Children.map(
          props.children.filter((item) => item !== null),
          (child) => {
            if (child?.props?.code) {
              return <>{user?.authorityCodes?.includes(child?.props?.code) && child}</>;
            } else {
              if (Array.isArray(child?.props.children)) {
                return React.Children.map(child.props.children, (subChild) => {
                  if (subChild.props?.code) {
                    return <>{user?.authorityCodes?.includes(subChild?.props?.code) && subChild}</>;
                  }
                });
              } else {
                return <>{user?.authorityCodes?.includes(child?.props?.children?.props?.code) && child.props.children}</>;
              }
            }
          }
        )
      ) : (
        <>{user?.authorityCodes?.includes(props.children.props?.code) && props.children}</>
      )}
    </div>
  );
}
