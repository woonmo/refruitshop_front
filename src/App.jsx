import { useState, useRef, useEffect } from 'react'
import './App.css'
import { fetchLoggedInUser, VITE_SERVER_HOST } from './api/api';
import UserContext from './contexts/UserContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from './pages/index';
import OrderList from './pages/order/OrderList';
import OrderDetail from './pages/order/OrderDetail';
import MyPageIndex from './pages/mypage/MypageIndex';
import UpdateMyInfo from './pages/mypage/UpdateMyInfo';
import PasswordChange from './pages/users/PasswordChange';

function App() {
    const [user, setUser] = useState(null);         // 로그인 한 유저 상태
    const [loading, setLoading] = useState(true);   // 페이지 로딩 상태
    const [cartCount, setCartCount] = useState(0);  // 로그인 한 유저 장바구니 개수

    // SSE 연결 재시도 위한 ref
    const eventSourceRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);        // 연결 재시도 횟수 핸들링

    useEffect(() => {
        const checkLogin = async () => {
            const loggedInUser = await fetchLoggedInUser();
            if (loggedInUser) {
                setUser(loggedInUser);
            }
            setLoading(false);
        }
        checkLogin();
    }, []);

    useEffect(() => {
        if (!user) {
            // user 정보가 없다면 SSE 연결을 종료
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            console.log("로그인 안 된 상태. SSE 연결 해제");
            return;
        }

        const connectEventSource = () => {
            const eventSource = new EventSource(`${VITE_SERVER_HOST}/api/carts/events`, {withCredentials: true});   // 서버 SSE 엔드포인트에 연결

            eventSourceRef.current = eventSource;

            // SSE 연결
            eventSource.onopen = () => {
                console.log("SSE 연결 성공");
                retryCountRef.current = 0;      // 연결 성공 시 재연결 시도 카운트 초기화
            };

            // SSE 메시지 수신
            eventSource.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);    // 서버에서 보낸 메시지
                    if (data && typeof data.cartCount === 'number') {
                        setCartCount(data.cartCount);
                    }
                } catch (err) {
                    console.error("SSE 데이터 파싱 에러: "+ err);
                }
            };

            // 연결 에러 발생
            eventSource.onerror = (err) => {
                console.error("SSE 연결 에러: ", err);

                // 기존 연결 끊기
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }

                retryCountRef.current += 1;

                // 최대 5번만 재연결 시도
                if (retryCountRef.current <= 5) {
                    // 3초 후 연결 재시도
                    retryTimeoutRef.current = setTimeout(() => {
                        if (user) {
                            console.log("SSE 재연결 시도...");
                            connectEventSource();
                        }
                        else {
                            console.log("유저 세션 없음 SSE 재연결 중단");
                        }
                        
                    }, 3000);
                }
            };
        };// end of const connectEventSource = () => {} -------------------

        connectEventSource();

        return () => {
            // 컴포넌트 언마운트 시 정리
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            console.log("컴포넌트 언마운트 or 로그아웃으로 SSE 연결해제");
        }

    }, [user]);

    if (loading) {
        return <div>로딩중...</div>
    }

    return (
        <UserContext.Provider value={{user, setUser, cartCount}}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Index/>} />
                    <Route path='/mypage' element={<MyPageIndex/>} />
                    <Route path='/mypage/password' element={<PasswordChange/>} />
                    <Route path='/mypage/info' element={<UpdateMyInfo/>} />
                    <Route path='/orders' element= {<OrderList />} />
                    <Route path='/orders/:orderCode' element= {<OrderDetail />} />
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    );
}

export default App
