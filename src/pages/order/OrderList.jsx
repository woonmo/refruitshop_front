import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { httpRequest, VITE_SERVER_HOST } from "../../api/api";
import UserContext from "../../contexts/UserContext";
import Swal from "sweetalert2";
import Layout from "../../components/Layout";
import style from './OrderList.module.css'
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import MyPageMenu from '../mypage/MypageMenu';

function OrderList() {
    
    // 날짜 입력
    const today = useMemo(() => new Date(), []);            // useMemo 를 사용하여 리렌더링 되더라도 같은 객체를 사용하도록
    const threeMonthsAgo = useMemo(() => new Date(), []);   // useEffect 에 사용되는 객체이기 때문에 리렌더링 될 시 새로운 객체가 생성되므로 첫 생성된 객체를 사용하기 위함
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const {user} = useContext(UserContext);
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);

    // 검색 조건
    const fromDateRef = useRef(null);
    const endDateRef = useRef(null);
    const [orderCode, setOrderCode] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [page, setPage] = useState(1);

    // 조회버튼을 통한 조회 시 2번 요청 방지
    const hasFetchedRef = useRef(false);  // 첫 진입이라는 마크업


    // 이벤트 등록용 태그(초기 값 null, useEffect 로 이벤트 추가, 태그에 직접 변수를 등록해줘야 함. input#searchWord)
    const searchOrderCodeRef = useRef(null);

    const navigate = useNavigate(); // 컴포넌트 이동

    // 회원의 주문목록을 조회하는 함수
    const fetchOrders = useCallback(async () => {

        if (!user) {
            return; // 비로그인 시 api 호출 x
        }

        setLoading(true);
        
        const params = new URLSearchParams();   // 쿼리스트링 객체 생성

        // 검색조건이 있을 경우 추가
        const fromDate = fromDateRef.current.value;
        const endDate = endDateRef.current.value;
        const orderCode = searchOrderCodeRef.current.value;
        
        if (fromDate) {
            params.append("fromDate", fromDate);
        }
        if (endDate) {
            params.append("endDate", endDate);
        }
        if (orderCode) {
            params.append("orderCode", orderCode);
        }
        if (orderStatus) {
            params.append("orderStatus", orderStatus);
        }

        // 페이지는 무조건 전달하도록
        params.append("page", page);


        const url = `${VITE_SERVER_HOST}/api/orders?${params.toString()}`;
        // console.log("요청쿼리: ", url);

        function success(data) {
            // console.log(data);
            setOrders(data);
            setLoading(false);
        }

        function fail(err) {
            Swal.fire({
                icon: "error",
                title: "주문 목록 조회 실패",
                text: err.message
            });
            setLoading(false);
        }

        httpRequest(url, "GET", null, success, fail);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderCode, orderStatus, page, user]);// end of const fetchOrders = async () => {} -----------------------

    
    const searchButtonClick = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);


    useEffect(() => {
        if (!hasFetchedRef.current && fromDateRef.current && endDateRef.current) {
            fromDateRef.current.value = formatDate(threeMonthsAgo);
            endDateRef.current.value = formatDate(today);

            hasFetchedRef.current = true; 
        }
    }, [threeMonthsAgo, today]);


    useEffect(() => {

        // 첫 렌더링 시 주문목록 생성, 이후 fetchOrders 의 의존배열이 변경 될 때마다 재렌더링
        const fetchInitialOrders = async () => {

            if (user) {
                // user 상태가 존재하면 로그인 된 것
                searchButtonClick();
                // hasFetchedRef.current = true;
            }
            else{
                window.location.href = `${VITE_SERVER_HOST}/login`;
            }
        };

        // 이벤트 등록
        const $inputOrderCode = searchOrderCodeRef.current;     // 현재 searchOrderCodeRef가 참조하고 있는 태그 (ref={searchOrderCodeRef} 속성이 등록 되어 있는 곳)
        // input 태그가 존재하면 이벤트 등록
        if ($inputOrderCode) {
            $inputOrderCode.addEventListener('keydown', e => {
                if (e.keyCode === 13) {
                    // 검색
                    searchOrderCode();
                }
            });
        };

        fetchInitialOrders();
    }, [user, searchButtonClick]);


    // 기간 버튼 클릭했을 때 날짜 계산
    const handleDateFilter = (period) => {
        const today = new Date();
        let newFromDate = new Date(today);

        switch (period) {
            case "today":
                break;
            case "week":
                newFromDate.setDate(today.getDate() - 6);
                break;
            case "month":
                newFromDate.setMonth(today.getMonth() - 1);
                break;
            case "3month":
                newFromDate.setMonth(today.getMonth() - 3);
                break;
            case "6month":
                newFromDate.setMonth(today.getMonth() - 6);
                break;
            default:
                break;
        }

        document.querySelector("input#fromDate").value = formatDate(newFromDate);
        document.querySelector("input#endDate").value = formatDate(today);

    };


    

    // 주문 상태에 따른 표기포맷을 변환해주는 함수 
    const orderStatusFormat = (status) => {
        switch (status) {
            case "PENDING":
                return "주문완료"

            case "COMPLETED":
                return "구매확정"

            case "CANCELLED":
                return "주문취소"
            
            default:
                break;
        }
    };

    const setChangePage = (page) => {
        setPage(page);
    }


    const searchOrderCode = () => {
        const orderCode = document.querySelector("input#searchWord").value;
        setOrderCode(orderCode);
    }

    if (!user) {
        return <p>로그인 해야함</p>
    }

    return (
        <Layout title={'주문 목록'}>

            {/* 마이페이지 메뉴 */}
            <MyPageMenu menu={'orders'} />

            <div className={style.container}>
                {/* 메뉴바 */}
                <div id="order_filter">
                    <div className={`${style.order_title} ${style.active}` }>
                        주문내역조회
                    </div>
                </div>

                {/* 기간 필터 시작 */}
                <div className={style.order_time}>
                    <div style={{padding: '2%'}} className="btn-group" role="group" aria-label="Date Select Filter">
                        <button type="button" className="btn btn-outline-dark" onClick={() => handleDateFilter("today")}>오늘</button>
                        <button type="button" className="btn btn-outline-dark" onClick={() => handleDateFilter("week")}>일주일</button>
                        <button type="button" className="btn btn-outline-dark" onClick={() => handleDateFilter("month")}>1개월</button>
                        <button type="button" className="btn btn-outline-dark" onClick={() => handleDateFilter("3month")}>3개월</button>
                        <button type="button" className="btn btn-outline-dark" onClick={() => handleDateFilter("6month")}>6개월</button>
                    </div>

                    <div style={{marginTop: '1%', padding: '1%'}}>
                        <input style={{width: '120px', height: '40px', textAlign: 'center'}} type="date" name="fromDate" id="fromDate" ref={fromDateRef} maxLength="10" />
                        &nbsp;&nbsp;~&nbsp;&nbsp;
                        <input style={{width: '120px', height: '40px', textAlign: 'center'}} type="date" name="endDate" id="endDate" ref={endDateRef} maxLength="10" /> &nbsp;
                    </div>

                    <div style={{marginTop: '2%'}}>
                        <button style={{width: '80px', height: '40px'}} type="button" className="btn btn-secondary" onClick={searchButtonClick}>조회</button>
                    </div>
                </div>

                <div className={style.filter_desc}>
                    <ul>
                        <li>기본적으로 최근 3개월간의 자료가 조회되며, 기간 검색시 주문처리완료 후 36개월 이내의 주문내역을 조회하실 수 있습니다.</li>
                        <li>완료 후 36개월 이상 경과한 주문은 별도 고객센터로 요청해 주시기 바랍니다.</li>
                        <li>주문번호를 클릭하시면 해당 주문에 대한 상세내역을 확인하실 수 있습니다.</li>
                    </ul>
                </div>
                {/* 기간 필터 끝 */}

                {/* 주문 상품 내역 보여주기 시작 */}
                <div className={`${style.filterMenu} mt-5`}>
                    <span className={style.bodyTitle}>주문 상품 정보</span>
                    <select style={{float: 'right', height: '30px', marginRight: '0.5%'}} name="searchType" onChange={(e) => setOrderStatus(e.target.value)}>
                        <option value="">주문필터</option>			
                        <option value="PENDING">주문완료</option>			
                        <option value="CANCELLED">교환/반품</option>			
                        <option value="COMPLETED">구매확정</option>
                    </select>
                    <span style={{margin: '0 1% 0 0.5%', float: 'right'}} id="goSearch" className="btn btn-secondary btn-sm" onClick={searchOrderCode}>검색</span>
			        <input style={{height: '30px', float: 'right'}} id="searchWord" type="text" name="searchWord" ref={searchOrderCodeRef} placeholder="주문번호검색" />
                </div>
                {/* 주문 상품 내역 보여주기 끝 */}
                <hr style={{border: 'solid 1px black'}}/>

                {/* 주문 목록 시작 */}
                <div>
                    {loading ? (
                        <p>로딩중..</p>
                    ) : !orders ? (
                        <p>주문 정보를 불러오는중..</p>
                    ) : orders.orderList.length === 0 ?(
                        <table className={`${style.orderList} table text-center`}>
                            <tbody>
                                <tr >
                                    <td colSpan={6}>주문하신 상품이 존재하지 않습니다.</td>
                                </tr>  
                            </tbody>  
                        </table>
                    ) : (
                        <table className={`${style.orderList} table table-hover text-center`}>
                            <thead>
                                <tr>
                                    <th>주문번호</th>
                                    <th>주문일자</th>
                                    <th>이미지</th>
                                    <th style={{width: '40%'}}>상품명</th>
                                    <th>주문금액</th>
                                    <th>주문상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.orderList.map((order) => (
                                    <tr className="orderItem" style={{cursor: 'pointer'}} key={order.orderCode} onClick={() => navigate(`/orders/${order.orderCode}`) }>
                                        <td>{order.orderCode}</td>
                                        <td>{order.orderDate}</td>
                                        {/* 상품 이미지 */}
                                        {order.items.length > 1 ? (
                                            <td><img style= {{width: '80px', height: '50px'}} src={`/images/product/thumbnail/${order.items[0].thumbnail}`} alt="상품이미지"/></td>
                                        ) : (<td><img style= {{width: '80px', height: '50px'}} src={`/images/product/thumbnail/${order.items[0].thumbnail}`} alt="상품이미지"/></td>)}

                                        {/* 상품명 */}
                                        {order.items.length > 1 ? (
                                            <td>{order.items[0].prodName} 포함 총 {order.items.length}건</td>
                                        ) : (<td>{order.items[0].prodName}</td>)}

                                        <td>{order.paymentPrice.toLocaleString()} 원</td>
                                        <td>{orderStatusFormat(order.orderStatus)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 페이지 바 */}
            {orders && orders.pagination.totalPages > 0 && (
                <div style={{marginTop: '3%'}}>
                    <Pagination pageInfo={orders.pagination} onPageChange={setChangePage} />
                </div>    
            )}
            
        </Layout>
    );
}

export default OrderList;