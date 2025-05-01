
import { useContext, useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import UserContext from '../../contexts/UserContext';
import { httpRequest, VITE_SERVER_HOST } from '../../api/api';
import Swal from 'sweetalert2';
import style from './UpdateMyInfo.module.css'
import { useNavigate } from 'react-router-dom';


function UpdateMyInfo() {

    const {user, setUser} = useContext(UserContext);

    const [formData, setFormData] = useState({
        userid : '',
        password: '',
        passwdcheck: '',
        name: '',
        email: '',
        tel: '',
        zipcode: '',
        address: '',
        detailAddress: '',
        extraAddress: ''
    });
    const [tel1, tel2, tel3] = formData.tel ? formData.tel.split("-") : ['010', '', ''];
    const navigate = useNavigate();

    const [errors, setErrors] = useState({
        passwordCheck: {message: '미입력시 비밀번호가 유지됩니다.', status: `${style.blue}`},   // status: red or blue
        name: {message: '', status: ''},
        email: {message: '', status: ''},
        tel: {message: '', status: ''},
        address: {message: '', status: ''}
    });

    // 비밀번호 검사
    const validatePassword = (password) => {
        const reg = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-]).*$/;
        return reg.test(password);
    };

    // 이름 검사
    const validateName = (name) => {
        const reg = /^[가-힣]{2,6}$/;
        return reg.test(name);
    };

    // 입력값이 변할 때마다 추적하여 정보 변경
    const handleChange = (e) => {
        const { name, value } = e.target;     // form 태그 내 input 태그의 name 속성, value

        setFormData((prev) => ({
            ...prev,        // 기존 formData 를 복사(전개 연산자, 객체를 펼처서 복사 해오는 리액트 문법, 복합 객체 state 수정할 때 이런 방식으로 해야 함.)
            [name]: value
        }));

        // console.log(formData);
    };

    // 이메일 검사
    const validateEmail = (email) => {
        const reg = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        return reg.test(email);
    };


    // 전화번호 검사
    const validateTel = (tel2, tel3) => {
        const reg2 = /^[1-9][0-9]{3}$/;
        const reg3 = /^\d{4}$/;
        return reg2.test(tel2) && reg3.test(tel3);
    };

    // 주소 입력 검사

    // 이메일 중복검사
    const duplicateCheckEmail = async (email) => {
        // console.log("duplicate:", email);
        return new Promise((resolve) => {   // async 함수(비동기함수는) 반드시 promise를 사용해야 값을 리턴할 수 있다.
            function success(data) {
                if (!data.isEmailExist) {
                    setErrors(prev => ({ ...prev, email: {message: `${email}은 사용가능합니다.`, status: `${style.blue}`} }));
                    resolve(true);
                }
                else {
                    setErrors(prev => ({ ...prev, email: {message: `${email}은 이미 사용중입니다.`, status: `${style.red}`} }));
                    resolve(false);
                }
            }
            function fail(err) {
                Swal.fire({
                    icon: "error",
                    title: "에러가 발생했습니다.",
                    text: err
                })
                resolve(false);
            }
            const body = JSON.stringify({userId: user.userId, email: email});

            httpRequest(`${VITE_SERVER_HOST}/api/users/duplicate`, "POST", body, success, fail);
        });
    };

    // 유효성 검사 함수
    const handleBlur = (e) => {
        const { name, value } = e.target;
      
        if (name === 'password') {
            if (value === '') {
                setErrors(prev => ({ ...prev, passwordCheck: {message: '미입력시 비밀번호가 유지됩니다.', status: `${style.blue}`} }));
            } else if (!validatePassword(value)) {
                setErrors(prev => ({ ...prev, passwordCheck: {message: '올바른 비밀번호가 아닙니다.', status: `${style.red}`} }));
            } else {
                setErrors(prev => ({ ...prev, passwordCheck: {message: '', status: ''} }));
            }
        }
      
        if (name === 'name') {
            if (!validateName(value)) {
                setErrors(prev => ({ ...prev, name: {message: '올바른 성명이 아닙니다.', status: `${style.red}`} }));
            } else {
                setErrors(prev => ({ ...prev, name: {message: '', status: ''} }));
            }
        }
      
        if (name === 'email') {
            if (!validateEmail(value)) {
                setErrors(prev => ({ ...prev, email: {message: '올바른 이메일이 아닙니다.', status: `${style.red}`} }));
            } else {                
                if (value === user.email) {
                    // 기존 이메일을 변경하지 않은 경우
                    return;
                }
                duplicateCheckEmail(value);
            }
        }
    };

    // 유효성 검사 비밀번호
    const handlePasswordCheck = (e) => {
        const value = e.target.value;
        if (value !== '' && value !== formData.password) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '비밀번호가 일치하지 않습니다.', status: `${style.red}`} }));
        } 
        else if (value !== '' && value === formData.password) {
            setErrors(prev => ({ ...prev, passwordCheck: {message: '비밀번호가 일치합니다.', status: `${style.blue}`} }));
        }
    };

    // 유효성 검사 전화번호
    const handleTelBlur = () => {
        if (!validateTel(tel2, tel3)) {
            setErrors(prev => ({
                ...prev,
                tel: {message: '올바른 연락처를 입력하세요', status: `${style.red}`}
            }));
        }
        else {
            setErrors(prev => ({
                ...prev,
                tel: {message: '', status: ''}
            }));
        }
    };

    // 업데이트 요청 시 모든 항목 유효성 검사
    const validateAll = async () => {
        const newErrors = {};    // 에러 메시지를 담을 객체
        let confirm = true;

        // 비밀번호
        if (formData.password && !validatePassword(formData.password)) {
            newErrors.passwordCheck = { message: "올바른 비밀번호가 아닙니다.", status: `${style.red}` };
            confirm = false;
        }

        // 비밀번호 동일 여부
        if (formData.password && formData.password !== formData.passwdcheck) {
            newErrors.passwordCheck = { message: "비밀번호가 일치하지 않습니다.", status: `${style.red}` };
            confirm = false;
        }

        if (confirm) {
            newErrors.passwordCheck = { message: "", status: "" };
        }

        // 이름
        if (!validateName(formData.name)) {
            newErrors.name = {message: '올바른 성명이 아닙니다.', status: `${style.red}`};
            confirm = false;
        }

        // 이메일 형식 검사
        if (!validateEmail(formData.email)) {
            newErrors.email = {message: '올바른 이메일 형식이 아닙니다.', status: `${style.red}`};
            confirm = false;
        }
        else {
            // 이메일 형식 검사 통과 후 중복 검사
            if (user.email !== formData.email) {
                // 입력한 것과 기존 정보가 다를 경우 중복체크
                const isAvailable = await duplicateCheckEmail(formData.email);

                if (!isAvailable) {
                    newErrors.email = {message: `${formData.email}은 사용중인 이메일입니다.`, status: `${style.red}`};
                    confirm = false;
                }
            }
        }

        // 전화번호
        // eslint-disable-next-line no-unused-vars
        const [tel1, tel2, tel3] = formData.tel ? formData.tel.split("-") : ['010', '', ''];
        if (!validateTel(tel2, tel3)) {
            newErrors.tel = {message: '올바른 연락처를 입력하세요.', status: `${style.red}`};
            confirm = false;
        }

        // 주소
        if (formData.zipcode && formData.address && formData.extraAddress) {
            newErrors.address = {message: '올바른 연락처를 입력하세요.', status: `${style.red}`};
        }

        setErrors(prev => ({
            ...prev,
            ...newErrors
        }));

        return confirm; // 에러가 없으면 true 리턴(모두 통과 시)
    };

    // 회원정보 업데이트 요청
    const handleSubmit = (e) => {
        e.preventDefault(); // 기본 submit 막기

        Swal.fire({
            icon: "question",
            title: "회원 정보를 수정하시겠습니까?",
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText: "취소"
        })
        .then(result => {
            if (!result.isConfirmed) {
                return;
            }
            else {
                const validationInfo = async () => {
                    if (! await validateAll()) {
                        Swal.fire({
                            icon: "warning",
                            title: "입력 정보를 확인하세요!"
                        });
                        return;
                    }
            
                    function success(data) {
                        Swal.fire({
                            icon: "success",
                            title: "회원정보 변경에 성공했습니다.",
                            timer: 1500,
                            timerProgressBar: true,     // 진행 게이지바
                            didOpen: () => {
                                Swal.showLoading();     // 로딩 애니메이션, 이거 사용 시 버튼 비활성화 되어서 보이지 않음
                            }
                        })
                        .then(() => {
                            // if (result.dismiss || result.isConfirmed) {
                            //     setUser(data);
                            //     navigate("/mypage");
                            // }
                            setUser(data);
                            navigate("/mypage");
                        });
                    }// end of success
            
                    function fail(err) {
                        Swal.fire({
                            icon: "error",
                            title: "정보 변경에 실패했습니다.",
                            text: err
                        })
                    }
            
                    const body = JSON.stringify(formData);
                    console.log(body);
                    await httpRequest(`${VITE_SERVER_HOST}/api/users`, "PUT", body, success, fail);
                };
                validationInfo();
            }
        });
    };// end of const handleSubmit = (e) => {} -----------------------

    // 전화번호 변경 함수
    const handleTelChange = (e) => {
        const { name, value } = e.target;
        const [currentTel1, currentTel2, currentTel3] = formData.tel ? formData.tel.split('-') : ['010', '', ''];

        let newTel1 = currentTel1;
        let newTel2 = currentTel2;
        let newTel3 = currentTel3;

        if (name === "tel1") newTel1 = value;
        if (name === "tel2") newTel2 = value;
        if (name === "tel3") newTel3 = value;

        const combinedTel = `${newTel1}-${newTel2}-${newTel3}`;
        setFormData((prev) => ({
            ...prev,
            tel: combinedTel
        }));
    }


    useEffect(() => {
        if (!user) {
            window.location.href=`${VITE_SERVER_HOST}/login`
        }
        else {
            setFormData({
                userid: user.userId,
                name: user.name,
                email: user.email,
                tel: user.tel,
                zipcode: user.zipcode,
                address: user.address,
                detailAddress: user.detailAddress,
                extraAddress: user.extraAddress
            })
        }
    }, [user]);

    // 취소하기 버튼 클릭 시
    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        }
        else {
            navigate(`/mypage`);
        }
    };

    // 다음 주소 찾기
    const openSearchPost = () => {
        new window.daum.Postcode({
        
            oncomplete: function(data) {

                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
    
                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                let addr = ''; // 주소 변수
                let extraAddr = ''; // 참고항목 변수
    
                //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    addr = data.roadAddress;
                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    addr = data.jibunAddress;
                }
    
                // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
                if(data.userSelectedType === 'R'){
                    // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                    // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                    if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                        extraAddr += data.bname;
                    }
                    // 건물명이 있고, 공동주택일 경우 추가한다.
                    if(data.buildingName !== '' && data.apartment === 'Y'){
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                    if(extraAddr !== ''){
                        extraAddr = ' (' + extraAddr + ')';
                    }
                    // 조합된 참고항목을 해당 필드에 넣는다.
                    // document.getElementById("extraAddress").value = extraAddr;
                
                } else {
                    document.getElementById("extraAddress").value = '';
                }
                
                // 우편번호와 주소 정보를 해당 필드에 넣는다.
                setFormData(prev => ({
                    ...prev,
                    zipcode: data.zonecode,
                    address: addr,
                    extraAddress: extraAddr || ''
                }));

                // 커서를 상세주소 필드로 이동한다.
                document.getElementById("detailAddress").focus();
            }
    
        }).open(); 
    }
    
    return(
        <Layout title={'회원정보수정'}>
            {user && (
                <div className="container" style={{marginBottom: '100px'}}>
                    <form onSubmit={handleSubmit}>
                        <div style={{width: '450px', margin: '10px auto'}}>

                            <div className="text-center"
                                style={{marginTop: '50px', marginBottom: '50px'}}>
                                <h4 style={{fontWeight: 'bold'}}>회원정보 수정</h4>
                                (<span className="star text-danger">*</span>표시는 필수입력사항)
                            </div>

                            <div>
                                <table className={`${style.tblMemberRegister} w-100`}>
                                    <tbody>
                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger"> </span>
                                            </td>
                                            <td className={style.tdSecond} style={{height: '50px', verticalAlign: 'top'}}>
                                                <input type="text" name="userid" id="userid" maxLength="40" className={`${style.formInput} requiredInfo info`} value={formData.userid} onChange={handleChange} placeholder="아이디" readOnly /><br/>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger"> </span>
                                            </td>
                                            <td style={{height: '50px', verticalAlign: 'top'}}>
                                                <input type="password" name="password" id="passwd" maxLength="20" className={`${style.formInput} requiredInfo info`} value={formData.password || ''} onChange={handleChange} onBlur={handleBlur} placeholder="비밀번호" /><br/>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger"> </span>
                                            </td>
                                            <td style={{height: '80px', verticalAlign: 'top'}}>
                                                <input type="password" name="passwdcheck" id="passwdcheck" maxLength="20" className={`${style.formInput} requiredInfo info`} value={formData.passwdcheck || ''} onChange={handleChange} onBlur={handlePasswordCheck} placeholder="비밀번호 확인"/><br/>
                                                <span id="pwdError" className={`${style.error} ${errors.passwordCheck.status || ''}`}>{errors.passwordCheck.message}</span><span className={style.rule}>(영문/숫자/특수문자 조합, 8자~20자)</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger">*</span>
                                            </td>
                                            <td style={{height: '80px', verticalAlign: 'top'}}>
                                                <input type="text" name="name" id="name" maxLength="30" className={`${style.formInput} requiredInfo info`} value={formData.name} onChange={handleChange} onBlur={handleBlur} placeholder="성명" /><br/>
                                                <span className={`${style.error} ${errors.name.status || ''}`}>{errors.name.message}</span>
                                                <span className={style.rule}>(한글, 2자~6자)</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger">*</span>
                                            </td>
                                            <td style={{height: '80px', verticalAlign: 'top'}}>
                                                <input type="text" name="email" id="email" maxLength="60" className={`${style.formInput} requiredInfo info`} value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="이메일" /><br/>
                                                <span id="emailError" className={`${style.error} ${errors.email.status || ''}`}>{errors.email.message}</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger">*</span>
                                            </td>
                                            <td style={{height: '80px', verticalAlign: 'top'}}>
                                                <select name="tel1" id="tel1" style={{width: '100px'}} required value={tel1} onChange={handleTelChange} className={`${style.selectBox}`}>
                                                    <option value="010">010</option>
                                                    {/* <option value="011">011</option>
                                                    <option value="016">016</option>
                                                    <option value="017">017</option>
                                                    <option value="018">018</option> */}
                                                </select>&nbsp;-&nbsp;
                                                <input type="text" name="tel2" id="tel2" className={`${style.formInput} info`} style={{width: '100px'}} value={tel2} onChange={handleTelChange} onBlur={handleTelBlur} size="6" maxLength="4" />&nbsp;-&nbsp;
                                                <input type="text" name="tel3"id="tel3" className={`${style.formInput} info`} style={{width: '100px'}} value={tel3} onChange={handleTelChange} onBlur={handleTelBlur} size="6" maxLength="4" /><br/>
                                                <span className={`${style.error} ${errors.tel.status || ''}`}>{errors.tel.message}</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger">*</span>
                                            </td>
                                            <td>
                                                <input type="text" name="zipcode" id="postcode" className={`${style.formInput}`} style={{width: '100px'}} size="6" maxLength="5" value={formData.zipcode} onChange={handleChange} placeholder="우편번호" readOnly />&nbsp;&nbsp;
                                                <img src={'/images/user/b_zipcode.gif'} onClick={openSearchPost} className={`${style.zipcodeSearch}`} width="90" height="30" alt='우편번호찾기' />
                                                <span className={style.error}></span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className={style.tdFirst}>
                                                <span className="star text-danger">*</span>
                                            </td>
                                            <td style={{height: '160px', verticalAlign: 'top'}}>
                                                <input type="text" className={`${style.formInput}`} name="address" id="address" size="40" maxLength="200" value={formData.address} onChange={handleChange} placeholder="주소" style={{margin: '3px 0'}} readOnly />
                                                <input type="text" className={`${style.formInput}`} name="extraAddress" id="extraAddress" size="40" maxLength="200" value={formData.extraAddress} onChange={handleChange} placeholder="참고항목" style={{margin: '3px 0'}} readOnly />
                                                <input type="text" className={`${style.formInput}`} name="detailAddress" id="detailAddress" size="40" maxLength="200" value={formData.detailAddress} onChange={handleChange} placeholder="상세주소" style={{margin: '3px 0 auto 0'}} />
                                                <span className={style.error}></span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <span className="star text-danger"></span>
                                            </td>
                                            <td className="text-center" style={{height: '100px'}}>
                                                <input type="submit" className="btn btn-outline-success btn-lg mr-3" value="변경하기" onClick={handleSubmit} />
                                                <input type="button" className="btn btn-outline-danger btn-lg mr-3" value="취소하기" onClick={handleBack} />
                                                <input type="button" className="btn btn-outline-warning btn-lg" value="탈퇴하기" onClick={()=> {}} />
                                            </td>
                                        </tr> 
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </form>
                </div>
            )};
        </Layout>
    );

}

export default UpdateMyInfo;