import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const loginUser = async (email, password) => {
    const response = await axios.post(
        `${API_URL}/auth/login`,
        {
            email: email,
            password: password,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );

    return response.data;
};


export const signupUser = async (
    full_name,
    username,
    email,
    password
) => {
    const response = await axios.post(
        `${API_URL}/auth/signup`,
        {
            full_name,
            username,
            email,
            password,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );

    return response.data;
};