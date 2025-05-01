import React, { useContext } from "react";
import './Header.css';
import { Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import Swal from "sweetalert2";
import axios from "axios";
import {VITE_SERVER_HOST} from "../api/api"
import{ FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";

function Header() {

    const {user, setUser, cartCount} = useContext(UserContext);

    // 로그아웃 처리
    const logoutHandler = async () => {
        try {
            await axios.post(VITE_SERVER_HOST+"/logout", null, {withCredentials: true});
            setUser(null);
            window.location.href = `${VITE_SERVER_HOST}/`;
        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "에러가 발생했습니다.",  
                text: err
            })
        }
    }

    const openNav = () => {
        document.getElementById("mySidenav").style.width = "15%";
    };

    const closeNav = () => {
        document.getElementById("mySidenav").style.width = "0";
    };

    return(
        <nav className="navbar navbar-expand-lg navbar-light sticky-top mt-3 mb-5">
            {/* 사이드 메뉴 */}
            <div id="mySidenav" className="sidenav">
                <button className="closebtn" onClick={closeNav}>&times;</button>
                <a href={`${VITE_SERVER_HOST}/products`}>Fruit Shop</a>
                <Link to="#">Team Story</Link>
                <Link to="#">Community</Link>
                <br />
                <a href={`${VITE_SERVER_HOST}/login`}>Login</a>

                {user != null && user.role === 'ADMIN' ? (
                    <Link>Admin Page</Link>
                ) : (
                    <Link>My Page</Link>
                )}
                <Link to="/orders">Order List</Link>
                <a href={`${VITE_SERVER_HOST}/carts`}>Cart</a>
            </div>

            {/* 중앙 상단 구조 */}
            <div className="container-fluid row" style={{ marginLeft: '0.22%' }}>
                {/* 좌측 메뉴 */}
                <div className="col-md-5 navbar-collapse text-center" style={{ paddingRight: '2%' }}>
                    <ul className="navbar-nav mx-auto">
                        <span style={{ fontSize: 20, cursor: 'pointer', marginTop: '1.25%' }} onClick={openNav}>&#9776;</span>
                        <li className="nav-item active ml-4">
                            <a href={`${VITE_SERVER_HOST}/products`} className="nav-link menu">Fruit Shop</a>
                        </li>
                        <li className="nav-item active ml-3">
                            <Link className="nav-link menu">Team Story</Link>
                        </li>
                        <li className="nav-item active ml-3">
                            <Link className="nav-link menu">Community</Link>
                        </li>
                    </ul>
                </div>

                {/* 중앙 이미지 */}
                <div className="col-md-2 navbar-collapse">
                    <div className="mx-auto">
                        <a href={`/`}><img src={'/images/index/logo_header.png'} alt="헤더 로고" /></a>
                    </div>
                </div>


                {/* 우측 메뉴 */}
                <div className="col-md-5 navbar-collapse">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item active mr-3">
                            {user == null ? (
                                <a href={`${VITE_SERVER_HOST}/login`} className="nav-link menu">Login</a>
                            ):( 
                                <button onClick={logoutHandler} className="menu nav-link" type="button">
                                    Logout
                                </button>
                            )}
                        </li>

                        {user != null && user.role === 'ADMIN' ? (
                            <li className="nav-item active mr-3">
                                <Link className="nav-link menu">Admin Page</Link>
                            </li>
                        ) : (
                            <li className="nav-item active mr-3">
                                <Link to={'/mypage'} className="nav-link menu">My Page</Link>
                            </li>
                        )}
                    
                        <li className="nav-item active mr-3">
                            <Link to={'/orders'} className="nav-link menu">Order List</Link>
                        </li>

                        {user != null && user.role === 'USER' && (
                            <li className="nav-item active">
                                <a href={`${VITE_SERVER_HOST}/carts`} style={{marginTop: '2%', cursor: 'pointer'}} className="navbar-brand notification">
                                    <FontAwesomeIcon icon={faBasketShopping}></FontAwesomeIcon><span className="badge">{cartCount}</span>
                                </a>
                            </li>
                        )}
                        
                    </ul>
                </div>

            </div>
        </nav>
    );
}

export default Header;