import React from "react";
import { Route, Redirect } from "react-router-dom";

const PublicRoute = ({ component: Component, restricted, ...rest }) => {
    const token = localStorage.getItem("token");

    return <Route {...rest} render={(props) => (token ? <Redirect to="/" /> : <Component {...props} />)} />;
};

export default PublicRoute;
