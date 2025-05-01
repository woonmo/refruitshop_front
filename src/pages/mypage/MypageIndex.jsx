import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from '../../contexts/UserContext';
import { httpRequest, VITE_SERVER_HOST } from "../../api/api";
import Layout from "../../components/Layout";
import MyPageMenu from "./MypageMenu";
import Swal from "sweetalert2";
import React from "react";

function MyPageIndex() {

    const {user} = useContext(UserContext);
    const [statusList, setStatusList] = useState(null);
    const [couponList, setCouponList] = useState(null);

    const getMyInfo = useCallback(() => {
        function success(data) {
            // console.log(data.statusList);
            setStatusList(data.statusList);
            setCouponList(data.couponList);
            // console.log(data.couponList);
        }

        function fail(err) {
            Swal.fire({
                icon: "error",
                title: "에러가 발생했습니다.",
                text: err
            })
        }

        httpRequest(`${VITE_SERVER_HOST}/api/users/mypage`, "GET", null, success, fail);
    }, []);


    useEffect(() => {
        if (!user) {
            window.location.href=`${VITE_SERVER_HOST}/login`;
        }
        else {
            getMyInfo();
        }
    },[user, getMyInfo]);

    
    return (
        <Layout title={'마이페이지'}>
            <MyPageMenu menu={'index'} />
            {user && (
                <div className="container" style={{paddingTop: '110px', paddingBottom: '110px'}}>

                    <div className="row border">

                        <div className="col-md-5 m-3">
                            <div className="mt-3">
                                <img src={`${VITE_SERVER_HOST}/images/mypage/default_profile.jpg`} className="img-fluid" style={{borderRadius: '50%', alt:"round", width:'20%'}} alt="프로필사진"/>
                                <span className="ml-3" style={{fontSize:'14pt'}}>안녕하세요. <span style={{fontWeight: 'bold', fontSize:'16pt'}}>{user.name}</span> 회원님</span>
                            </div>

                            <div className="mt-3">
                                <div className="p-3" style={{lineHeight:'30px', fontSize:'14pt'}}>
                                    <ul>
                                        <li className="my-2">포인트 : <span className="text-primary">{user.point.toLocaleString()}</span>&nbsp;원</li>
                                        <li className="my-2"><span id="couponModalOpen" style={{cursor: 'pointer'}} onClick={()=> {}}>쿠&nbsp;&nbsp;&nbsp;폰 : <span className="text-primary">{couponList ? (couponList.length) : (0)}</span> 개</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>


                        {statusList && statusList.map((shipStatus, index) => (
                            // 리액트는 반복에서 최상위 요소에 key 를 달아줘야함.
                            <React.Fragment key={index}>
                                <div className="col-md-1 text-center my-auto">
                                    <div style={{fontSize:'11pt', fontWeight: 'bold'}}>{shipStatus.status}</div>
                                    <div style={{marginTop:'20px', fontSize:'20pt', fontWeight: 'bold', cursor: 'pointer'}} className="goOrderInfo" onClick={() => {window.location.href=`/orders`}}>{shipStatus.quantity}</div>
                                </div>

                                {index !== statusList.length -1 && (
                                    <div className="col-md-1 text-center my-auto" style={{fontSize:'20pt'}}>▶</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                </div>
            )}
        </Layout>
    );

}

export default MyPageIndex;