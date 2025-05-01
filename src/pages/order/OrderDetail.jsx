import { useEffect, useState } from 'react';
import style from './OrderDetail.module.css'
// import UserContext from '../../contexts/UserContext';
import Layout from '../../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { httpRequest, VITE_SERVER_HOST } from '../../api/api';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';


function OrderDetail() {

    // const {user} = useContext(UserContext);     // 회원 정보 가져오기 (전역)
    const {orderCode} = useParams();      // URL 에서 :orderCode 파라미터 값을 가져옴 (App.js 확인) 키값 매칭!!!
    const [order, setOrder] = useState(null);

    const [modalType, setModalType] = useState(null); // 'CONFIRM' or 'RETURN'
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    useEffect(()=> {
        function success(data) {
            // console.log(data);
            setOrder(data);
        }
    
        function fail(err) {
            Swal.fire({
                icon: "error",
                title: "상품 조회를 실패했습니다.",
                text: err
            })
        }
        
        // console.log("orderCode: "+ orderCode);
    
        httpRequest(`${VITE_SERVER_HOST}/api/orders/${orderCode}`, "GET", null, success, fail);
    }, [orderCode]);    // []: 의존성 배열, 아무것도 적지 않으면 렌더링 시 1번만 실행, [orderCode] 는 orderCode 가 변경 될 때마다 실행

    
    // 상품 배송 상태에 따른 문구를 반환하는 함수
    const shipStatus = (status) => {
        switch (status) {
            case "PREPARING":
                return "배송준비중";
            case "SHIPPING":
                return "배송중";
            case "DELIVERED":
                return "배송완료"
            default:
                return;
        }
    };

    // 주소 표시 형태를 만들어 반환하는 함수
    const formattedAddress = (zipcode, address, detailAddress, extraAddress) => {
        return `${address}${extraAddress} ${detailAddress} (${zipcode})`;
    };

    // 적립금을 구하여 반환하는 함수
    const getPoint = (totalPrice) => {
        return Math.floor(totalPrice * 0.01)+ " 원";
    };

    // 모달 창 열기
    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };


    // 구매취소 & 구매확정 요청 함수
    const handleConfirm = () => {
        if (modalType === 'CONFIRM') {
            // 구매확정 로직
            // alert("구매확정"+ orderCode);
            
            function success() {
                Swal.fire({
                    icon: "success",
                    title: "구매 확정되었습니다.",
                })
                .then(() => {
                    navigate(0);
                });
            }

            function fail(err) {
                Swal.fire({
                    icon: "error",
                    title: "에러가 발생했습니다.",
                    text: err
                })
            }
            
            const body = JSON.stringify({"orderCode": orderCode, "orderStatus": "COMPLETED"});

            httpRequest(`${VITE_SERVER_HOST}/api/orders`, "PUT", body, success, fail);

        } else if (modalType === 'RETURN') {
            // 반품신청 로직
            // alert("반품신청"+ orderCode);

            function success() {
                Swal.fire({
                    icon: "success",
                    title: "주문이 취소되었습니다.",
                })
                .then(() => {
                    navigate(0);
                });
            }

            function fail(err) {
                Swal.fire({
                    icon: "error",
                    title: "에러가 발생했습니다.",
                    text: err
                })
            }
            
            const body = JSON.stringify({"orderCode": orderCode, "orderStatus": "CANCELLED"});

            httpRequest(`${VITE_SERVER_HOST}/api/orders`, "PUT", body, success, fail);
        }
        setShowModal(false);    // 모달 닫기
    };


    // 주문 상태에 따라 버튼을 추가해주는 함수
    const addOrderRequestButton = (status) => {
        
        if (status === "PENDING") {
            // 주문확정 혹은 주문 취소를 하지 않은 경우
            return(
                <>
                <div style={{width: '50%', margin: '5% auto 2% auto', display: 'flex'}}>
                    <button type="button" className={`${style.requestbtn} btn btn-light`} onClick={() => openModal('RETURN')}>주문취소</button>
                    <button type="button" className={`${style.requestbtn} btn btn-light`} onClick={() => openModal('CONFIRM')} style={{marginLeft: 'auto'}} >구매확정</button>
                </div>

                <ConfirmModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirm}
                title={modalType === 'CONFIRM' ? '구매확정' : '주문취소'}
                body={
                modalType === 'CONFIRM'
                    ? '구매확정을 진행하시겠습니까?'
                    : '주문취소를 신청하시겠습니까?'
                } />
                </>
            );
        }
        else {
            return(<div style={{marginTop: '3%'}}></div>);
        }
    };


    const orderStatusFormat = (orderStatus) => {
        switch (orderStatus) {
            case "PENDING":
                return "주문 완료";
            case "COMPLETED":
                return "구매 확정";
            case "CANCELLED":
                return "주문 취소";
            default:
                break;
        }
    }

    return(
        <Layout title="주문상세">
            {order != null && (
                <div className={style.container}>
                    {/* 주문 결제 타이틀 */}
                    <div style={{backgroundColor: 'black', color: 'white'}} className="text-center">
                        <span className={style.order_title}>주문상세내역</span>
                    </div>

                    {/* 주문번호 시작 */}
                    <div className={style.orderNumberInfo}>
                        <div className={style.orderNumber}>
                            <div>
                                <span style={{fontWeight: 500, color: 'black'}}>주문일시</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{order.orderDate}</span>
                            </div>
                            <div>
                                <span style={{fontWeight: 500, color: 'black'}}>주문번호</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{order.orderCode}</span>
                            </div>
                            <div>
                                <span style={{fontWeight: 500, color: 'black'}}>주문상태</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{orderStatusFormat(order.orderStatus)}</span>
                            </div>
                        </div>
                    </div>
                    {/* 주문번호 끝 */}


                    {/* 상세 내용 시작 */}
                    <div className={style.orderInfo_place}>
                        {/* 주문 상품 정보 시작 */}
                        <div className={`${style.orderInfo_title} h6 mt-5`}>주문 상품 정보</div>
                        <hr style={{border: 'solid 1px black'}}/>
                        <div>
                            <table id="orderList" className="table table-border text-center">
                                <thead>
                                    <tr>
                                        <th>이미지</th>
                                        <th style={{width: '50%'}}>상품명</th>
                                        <th>수량</th>
                                        <th>가격</th>
                                        <th>배송상태</th>
                                        <th>후기작성</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 상품리스트 반복 */}
                                    {order.items.map((item) => (
                                        <tr className="productRow" key={item.prodNo}>{/* 리액트는 고유값인 key 로 변화를 감지하므로 반복되는 부분에 key 를 설정!! */}
                                            <td>
                                                <a href={`${VITE_SERVER_HOST}/product/${item.prodNo}`}><img style= {{width: '50px'}} src={`/images/product/thumbnail/${item.thumbnail}`} alt={item.prodName}/></a>
                                            </td>
                                            <td className="prod_name"><a href={`${VITE_SERVER_HOST}/product/${item.prodNo}`} style={{color: 'black', cursor: 'pointer'}}>{item.prodName}</a></td>
                                            <td className="prod_count">{item.quantity}개</td>
                                            <td className="prod_price">{item.price.toLocaleString('en')} 원</td>
                                            <td className="prod_shipStatus">{shipStatus(item.shipStatus)}</td>
                                            <td>
                                                <button type="button" className="btn btn-success btn-sm">후기작성</button>  
                                            </td>
                                        </tr>
                                    ))}
                                    {/* 상품리스트 반복 */}
                                </tbody>
                            </table>
                        </div>
                        {/* 주문 상품 정보 끝 */}

                        {/* 배송지 정보 시작 */}
                        <div className={`${style.orderInfo_title} h6 mt-5`}>배송지</div>
                        <hr style={{border: 'solid 1px black'}}></hr>
                        <div className={style.shipInfo} style={{width: '90%', margin: '0 auto'}}>
                            <span className={style.receiver}>{order.receiverName}</span>
                            <span className={style.tel}>{order.receiverTel}</span>
                            <span className={style.address}>{formattedAddress(order.zipCode, order.address, order.detailAddress, order.extraAddress)}</span>
                        </div>
                        {/* 배송지 정보 끝 */}
                        
                        
                        
                        {/* 결제 정보 시작 */}
                        <div className={`${style.orderInfo_title} h6 mt-5`}>결제 정보</div>
                        <hr style={{border: 'solid 1px black'}}></hr>
                        <div style={{width: '90%', margin: '0 auto'}}>
                            <span>주문상품금액</span><span id="total_oprice" style={{float: 'right'}}>{order.totalPrice.toLocaleString()} 원</span><br/><br/>
                            <span>배송비</span><span style={{float: 'right'}}>2,500 원</span><br/><br/>
                            {/* 할인액이 있으면 표시한다. */}
                            {order.discount > 0 && (<><span>할인액</span><span id="discount" style={{float: 'right'}}>{order.discount} 원</span><br></br></>)}
                        </div>
                        <hr/>
                        {/* 결제 정보 끝 */}
                        

                        {/* 총 금액 & 적립금 확인 시작 */}
                        <div style={{width: '90%', margin: '0 auto'}}>
                            <span>총결제액</span><span className="total_price" style={{float: 'right'}}>{order.paymentPrice.toLocaleString()} 원</span><br/><br/>
                            <span>적립금</span><span id="point" style={{float: 'right'}}>{getPoint(order.totalPrice)}</span>
                        </div>
                        {/* 총 금액 & 적립금 확인 끝 */}

                        
                        {/* 주문확정 & 반품신청 버튼 시작 */}
                        {addOrderRequestButton(order.orderStatus)}
                        {/* 주문확정 & 반품신청 버튼 끝 */}
                    </div>
                </div>


            )}
        </Layout>
    );
}


// 구매확정 & 주문취소 모달
function ConfirmModal({show, onClose, onConfirm, title, body}) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body className='text-center'>
                <div className='h-100'>
                    {body}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onClose}>취소</Button>
                <Button variant="primary" onClick={onConfirm}>확인</Button>
            </Modal.Footer>
        </Modal>
    );
};




export default OrderDetail;