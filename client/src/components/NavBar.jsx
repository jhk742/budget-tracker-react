import { useContext } from "react";
import { Link } from 'react-router-dom'
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {

    const { user } = useContext(AuthContext)

    return (
        <div>
            NAVBAR
        </div>
    )
}