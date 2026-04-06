import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api";
import { saveToken, getToken, clearToken } from "../utils/tokenStorage";

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null };
        case "SUCCESS":
            return { ...state, loading: false, user: action.payload, token: action.payload.token ?? state.token, error: null };
        case "ERROR":
            return { ...state, loading: false, error: action.payload };
        case "UPDATE":
            return { ...state, loading: false, user: { ...state.user, ...action.payload } };
        case "LOGOUT":
            return { ...state, user: null, token: null };
        case "CLEAR":
            return { ...state, error: null };
        default:
            return state;
    }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        token: getToken(),
        loading: false,
        error: null,
    });

    const register = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/auth/register", formData);
            saveToken(res.data.token);
            dispatch({ type: "SUCCESS", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Registration failed" });
            return false;
        }
    };

    const fetchMe = async () => {
        const token = getToken();
        if (!token) return;
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get("/auth/me");
            dispatch({ type: "SUCCESS", payload: res.data });
        } catch (err) {
            clearToken();
            dispatch({ type: "LOGOUT" });
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/auth/login", formData);
            saveToken(res.data.token);
            dispatch({ type: "SUCCESS", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Login failed" });
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            clearToken();
            dispatch({ type: "LOGOUT" });
        }
    };

    const updateProfile = async (data) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.put("/users/profile", data);
            dispatch({ type: "UPDATE", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
            return false;
        }
    };

    const addRole = async (role) => {
        try {
            const res = await api.put("/users/add-role", { role });
            dispatch({ type: "UPDATE", payload: { roles: res.data.roles } });
            return res.data.message;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    };

    const hasRole = (role) => state.user?.roles?.includes(role);
    const clearError = () => dispatch({ type: "CLEAR" });

    return (
        <AuthContext.Provider value={{
            ...state,
            register,
            login,
            logout,
            updateProfile,
            addRole,
            hasRole,
            clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
