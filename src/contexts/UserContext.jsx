import { createContext } from "react";


const UserContext = createContext({
    user: null,
    setUser: () => {},
    cartCount: 0,
    setCartCount: () => {},
})

export default UserContext;