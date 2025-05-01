import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";

function Layout({children, title}) {

    useEffect(()=> {
        document.title = title || "독독고 과일판매";    // 타이틀변경, 기본값은 독독고 과일판매
    }, [title]);    // title 이 바뀔 때마다 실행

    return(
        <div>
            {
                /* user(key) = {user}(value)
                하위 컴포넌트로 파라미터를 보낼 때 <태그 전송할 props /> 형태로 한다.
                여러개일경우 콤마로 구분함
                name, role 을 보낼 경우 <Header name={user.name}, role={user.role} />
            */}
            <Header />
            <main style={{padding: '2rem'}}>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;