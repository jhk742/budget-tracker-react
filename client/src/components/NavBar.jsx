import { useContext } from "react";
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {

    const { user, logoutUser } = useContext(AuthContext)
    const location = useLocation()

    return (
        <div className="Navbar">
            <span className="nav-app-name">Budget Tracker</span>
            {user && <span className="nav-logged-user">Logged in as {user.name}</span>}
            {user ? (
                //if user is logged in
                <div>
                    {
                        (
                            location.pathname === "/category-management" ||
                            location.pathname === "/transaction-management" ||
                            location.pathname === "/account-balance" ||
                            location.pathname === "/totals"
                        ) &&
                        <Link 
                            to="/"
                            className="nav-link"
                        >
                            Home
                        </Link>
                    }
                    <Link
                        to="/login"
                        onClick={logoutUser}
                        className="nav-link"
                    >
                        Logout
                    </Link>
                </div>
                ) : (
                    //If user is not logged-in
                    <div className="navbar-items">
                        {location.pathname === "/register" && <Link
                            to="/login"
                            className="nav-link"
                        >
                            Login
                        </Link>}
                        {location.pathname === "/login" && <Link
                            to="/register"
                            className="nav-link"
                        >
                            Register
                        </Link>}
                    </div>
                )
            }
        </div>
    )
}