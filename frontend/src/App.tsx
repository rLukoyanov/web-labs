import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getToken } from "@utils/localStorage";
import Navigation from "./components/Navigation/Navigation";
import LoginPage from "@pages/Login/LoginPage";
import { RegisterPage } from "@pages/Register/RegisterPage";
import EventsPage from "@pages/Events/EventsPage";
import NotFoundPage from "@pages/NotFound/NotFoundPage";
import {Profile} from "@pages/Profile/Profile";
import "./App.css";
import { useEffect } from "react";
import { setUser } from "./store/slices/userSlice";
import { getCurrentUser } from "@api/auth";
import { useDispatch } from "react-redux";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  if (token) {
    return <Navigate to="/events" />;
  }
  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const is404Page = !["/", "/login", "/register", "/events"].includes(
    location.pathname
  );

   useEffect(() => {
      (async function() {
  
        const res = await getCurrentUser()
        if (res.user) {
          dispatch(setUser(res.user))
        }
      })()
    }, [location.pathname]);

  return (
    <div className="app">
      {!is404Page && <Navigation />}
      <main className={`main ${is404Page ? "no-padding" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <EventsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
