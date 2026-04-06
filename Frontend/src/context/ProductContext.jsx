import { createContext, useContext, useReducer, useCallback } from "react";
import api from "../utils/api";

const productReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null };
        case "SET_LIST":
            return { ...state, loading: false, list: action.payload.products, total: action.payload.total, pages: action.payload.pages };
        case "SET_CURRENT":
            return { ...state, loading: false, current: action.payload };
        case "SET_MY_ADS":
            return { ...state, myAds: action.payload };
        case "ADD":
            return { ...state, loading: false, myAds: [action.payload, ...state.myAds], success: "Ad posted successfully!" };
        case "REMOVE":
            return {
                ...state,
                list: state.list.filter((p) => p._id !== action.payload),
                myAds: state.myAds.filter((p) => p._id !== action.payload),
                success: "Ad deleted!",
            };
        case "ERROR":
            return { ...state, loading: false, error: action.payload };
        case "CLEAR":
            return { ...state, error: null, success: null };
        default:
            return state;
    }
};

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(productReducer, {
        list: [],
        myAds: [],
        current: null,
        total: 0,
        pages: 1,
        loading: false,
        error: null,
        success: null,
    });

    const fetchProducts = useCallback(async (params = {}) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get("/products", { params });
            dispatch({ type: "SET_LIST", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Failed to load products" });
        }
    }, []);

    const fetchProductById = useCallback(async (id) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get(`/products/${id}`);
            dispatch({ type: "SET_CURRENT", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    }, []);

    const fetchMyProducts = useCallback(async () => {
        try {
            const res = await api.get("/products/my");
            dispatch({ type: "SET_MY_ADS", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    }, []);

    const createProduct = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch({ type: "ADD", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
            return false;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            dispatch({ type: "REMOVE", payload: id });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    };

    const clearMessages = () => dispatch({ type: "CLEAR" });

    return (
        <ProductContext.Provider value={{
            ...state,
            fetchProducts,
            fetchProductById,
            fetchMyProducts,
            createProduct,
            deleteProduct,
            clearMessages,
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
