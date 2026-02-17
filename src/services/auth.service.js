export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const login = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", "mock-token-" + Date.now());
    return user;
};

export const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};
