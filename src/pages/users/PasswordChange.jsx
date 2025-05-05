
import { useContext, useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import style from './PasswordChange.module.css'
import Swal from 'sweetalert2';
import { httpRequest, VITE_SERVER_HOST } from '../../api/api';
import UserContext from '../../contexts/UserContext';

function PasswordChange() {

    const { user } = useContext(UserContext);

    useEffect(() =>{
        if (!user) {
            window.location.href=`${VITE_SERVER_HOST}/login`
        }
    }, [user])

    const [formData, setFormData] = useState({
        password: '',
        passwordCheck: ''
    });

    const [errors, setErrors] = useState({
        passwordCheck: {message: '', status: ``},   // status: red or blue
    });

    // 입력값이 변할 때마다 추적하여 정보 변경
    const handleChange = (e) => {
        const { name, value } = e.target;     // form 태그 내 input 태그의 name 속성, value

        setFormData((prev) => ({
            ...prev,        // 기존 formData 를 복사(전개 연산자, 객체를 펼처서 복사 해오는 리액트 문법, 복합 객체 state 수정할 때 이런 방식으로 해야 함.)
            [name]: value
        }));

        // console.log(formData);
    };

    // 비밀번호 검사
    const validatePassword = (password) => {
        const reg = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-]).*$/;
        return reg.test(password);
    };

    // 유효성 검사 함수
    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === 'password') {
            if (!validatePassword(value)) {
                setErrors(prev => ({ ...prev, passwordCheck: {message: '올바른 비밀번호가 아닙니다.', status: `${style.red}`} }));
            } else {
                setErrors(prev => ({ ...prev, passwordCheck: {message: '', status: ''} }));
            }
        }
    };

    // 비밀번호 일치 체크
    const handlePasswordCheck = (e) => {
        const value = e.target.value;
        if (value !== '' && value !== formData.password) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '비밀번호가 일치하지 않습니다.', status: `${style.red}`} }));
        } 
        else if (value !== '' && value === formData.password) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '비밀번호가 일치합니다.', status: `${style.blue}`} }));
        }
    };


    // 비밀번호 변경 요청
    const handleSubmit = (e) => {
        e.preventDefault(); // 기본 submit 막기


        if (formData.password && !validatePassword(formData.password)) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '올바른 비밀번호가 아닙니다.', status: `${style.red}`} }));
            return;
        }

        if (formData.password && formData.password !== formData.passwordCheck) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '비밀번호가 일치하지 않습니다.', status: `${style.red}`} }));
            return;
        }

        // 기존 비밀번호와 동일한 지 검사
        const checkAlreadyUsePassword = async () => {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '', status: ``} }));

            function success (result) {
                console.log(result);
                if (!result.isChanged) {
                    Swal.fire({
                        icon: "error",
                        title: "기존 비밀번호는 사용할 수 없습니다.",
                    });
                }
                else {
                    Swal.fire({
                        icon: "success",
                        title: "비밀번호를 변경했습니다.\n메인 페이지로 이동합니다.",
                        timer: 2000,
                        timerProgressBar: true,     // 진행 게이지바
                        didOpen: () => {
                            Swal.showLoading();     // 로딩 애니메이션, 이거 사용 시 버튼 비활성화 되어서 보이지 않음
                        }
                    })
                    .then(() =>{
                        window.location.href=`${VITE_SERVER_HOST}/`
                    });
                }
            }

            function fail (err) {
                Swal.fire({
                    icon: "error",
                    title: "에러가 발생했습니다.",
                    text: err
                });
            }

            await httpRequest(`${VITE_SERVER_HOST}/api/users/check-password`, "POST", formData.password, success, fail);
        };

        checkAlreadyUsePassword();
    };


    return (
        <Layout title={'비밀번호 변경'}>
            <div style={{width: '450px', margin: '10px auto'}}>

                <form onSubmit={handleSubmit}>
                    <h2 style={{fontWeight: 'bold', textAlign: 'center', marginTop: '100px', marginBottom: '50px'}}>비밀번호 변경</h2>
                    <h5 style={{textAlign: 'center', marginBottom: '30px'}}>비밀번호를 변경하신지 3개월이 지났습니다.<br/>새로운 비밀번호로 변경하시길 권장합니다.</h5>

                    <input type="password" value={formData.password || ''} onChange={handleChange} onBlur={handleBlur} name="password" placeholder="새 비밀번호" style={{width: '450px', height: '50px', lineHeight: '50px', margin: '5px 0', paddingLeft: '10px', fontSize: '16px'}}/>
                    <input type="password" value={formData.passwordCheck || ''} onChange={handleChange} onBlur={handlePasswordCheck} name="passwordCheck" placeholder="새 비밀번호 확인" style={{width: '450px', height: '50px', lineHeight: '50px', margin: '5px 0', paddingLeft: '10px', fontSize: '16px'}}/>
                    <span id="pwdError" className={`${style.error} ${errors.passwordCheck.status || ''}`}>{errors.passwordCheck.message}</span><span className={style.rule}>(영문/숫자/특수문자 조합, 8자~20자)</span>

                    <button type="submit" className="h6" style={{marginTop:'10%', width: '450px', height: '50px', lineHeight: '50px', backgroundColor: '#000000', color: 'white'}}>암호 변경하기</button>
                    <button type="button" onClick={() => {window.location.href=`${VITE_SERVER_HOST}/`}} className="h6" style={{width: '450px', height: '50px', lineHeight: '50px', marginBottom: '110px', backgroundColor: '#000000', color: 'white'}}>다음에 변경하기</button>
                </form>

            </div>
        </Layout>
    );

}

export default PasswordChange;