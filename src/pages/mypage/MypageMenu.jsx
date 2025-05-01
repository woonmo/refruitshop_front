import { Link } from "react-router-dom";
import './Mypage.css'


function MyPageMenu({menu}) {

    return (
        <>
        <div className="title container" style={{marginTop: '3.5%'}}>
            <h2>My page</h2>
        </div>

        <div className="container" style={{marginTop: '2.5%'}}>
            <div id="mypage" className="menu">
                {menu === 'index' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>마이페이지</Link>
                ) : (
                    <Link to={'/mypage'}>마이페이지</Link>
                )}
                {menu === 'userInfo' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>회원정보수정</Link>
                ) : (
                    <Link to={'/mypage/info'}>회원정보수정</Link>
                )}
                {menu === 'orders' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>주문내역조회</Link>
                ) : (
                    <Link to={'/orders'}>주문내역조회</Link>
                )}
                {menu === 'wish' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>관심상품</Link>
                ) : (
                    <Link>관심상품</Link>
                )}
                {menu === 'ship' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>배송지관리</Link>
                ) : (
                    <Link>배송지관리</Link>
                )}
                {menu === 'recent' ? (
                    <Link style={{color: 'black', borderBottom: 'solid black 2px'}}>최근본상품</Link>
                ) : (
                    <Link>최근본상품</Link>
                )}
            </div>
        </div>
        </>
    );

}


export default MyPageMenu;