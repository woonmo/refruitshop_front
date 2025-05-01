import axios from "axios";

export const VITE_SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export const api = axios.create({
    baseURL: VITE_SERVER_HOST,
    withCredentials: true,      // 쿠키 전송
    headers: {
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"    // 서버에 AJAX 통신 요청이라는 것을 서버에 인식시켜주기 위한 헤더 설정
    }
});


// 로그인 한 사용자 정보 요청
export const fetchLoggedInUser = async () => {
    try {
        const response = await api.get(`/api/users/me`);
        if (response.status === 200 || response.status === 201) {
            return response.data;
        }
        return null;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("인증되지 않음 (401)");
            return null;
        }
        console.log("로그인 사용자 정보 요청 실패", error);
        return null;
    }
};


// http 요청 함수
export const httpRequest = async (url, method, body, success, fail) => await fetch(url, {
    method: method,
    credentials: 'include',
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"    // 서버에 AJAX 통신 요청이라는 것을 서버에 인식시켜주기 위한 헤더 설정
    },
    body: body
})
.then(response => {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    else {
        throw new Error(`요청실패: ${response.status}`);
    }
})
.then(data => {
    success(data);
})
.catch(error => fail(error));