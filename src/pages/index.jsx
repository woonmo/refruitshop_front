import { useContext, useState } from "react";
import UserContext from "../contexts/UserContext";
import Layout from "../components/Layout";


function Index() {
    const { user } = useContext(UserContext);
    const [isExist, setIsExist] = useState(false);

    const toggle = () => {(user != null &&isExist) ? setIsExist(false) : setIsExist(true)}

    return (
        <Layout title={'독독고 과일판매'}>
            <div>
                <h1>리액트 시작!!</h1>
                <p>첫 화면 입니당</p>
                <button onClick={toggle}>{!(user != null && isExist) ? '회원정보 보기' : '회원정보 감추기'}</button>

                {user == null ? (
                    <p>로그인을 안했지롱</p>
                ) : (
                    isExist ? (
                        <div>
                            <p>회원명: {user.name}</p>
                            <p>회원아이디: {user.userId}</p>
                            <p>관리자여부: {user.isAdmin ? '관리자': '아니지롱'}</p>
                        </div>
                    ) : (
                        <p>안보여줄거지롱</p>
                    )
                )}
            </div>
        </Layout>
    );
}

export default Index;