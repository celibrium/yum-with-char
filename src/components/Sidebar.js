import './Sidebar.css'
import pfp from '../assets/mofusand.png';
import { IoHomeOutline } from "react-icons/io5";
import { FaBook } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";

function Sidebar() {
    return (

        // aside is common element used for sidebars
        <aside className = "Sidebar">
            <div className = "profile-container">
                <img src={pfp} alt="Mofusand" className = "profile"/>
                <h3> Charmaine Lee </h3>
            </div>

            <nav>
                <a href = '#'><IoHomeOutline className = "nav-icon" /> Home </a>
                <a href = '#'><IoBookOutline className = "nav-icon"/> My Recipes </a>
                <a href = '#'><MdFavoriteBorder className = "nav-icon" /> Favourites </a>
                <a href = '#'><IoPersonOutline className = "nav-icon" />About me </a>

            </nav>

        </aside>


    );
}

export default Sidebar;