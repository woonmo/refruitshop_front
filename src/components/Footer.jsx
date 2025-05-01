import React from "react";
import './Footer.css'

function Footer() {
    return(
        <div id="footer">
            <div style={{paddingTop: '1.5%', marginLeft: '7.5%',  marginBottom: '1.5%'}}>
                <img style={{top: '20px'}} id="footer_img" src={'/images/index/logo_footer.png'} alt="푸터 이미지" />
            </div>

            <hr style={{border: 'solid 0.5px white'}} />
            <br/>
            <br/>

            <div id="company_info">
                <div>
                    <p>쌍용강북교육센터 독단 독선 고집&nbsp;&nbsp;|&nbsp;&nbsp;팀장:&nbsp;이원모&nbsp;&nbsp;|&nbsp;&nbsp;조번호:&nbsp;2조</p>
                    <p>주소&nbsp;:&nbsp;서울시 마포구 서교동 홍대입구 인근 3층</p>
                    <p>css 짜증난다</p>
                    <p>던지고싶다</p>
                </div>

                <div>
                    <p className="h5">2222-2222</p>
                    <p>09:00~13:00</p>
                    <p>14:00~18:00</p>
                </div>
                <div>
                    <p>후원계좌</p>
                    <p>신한은행</p>
                    <p>111-111-111111</p>
                    <p>예금주 : 쌍용강북교육센터 gclass</p>
                </div>
                <div id="team_info">
                    <p className="info">팀원소개</p>
                    <p className="info">팀 규칙</p>
                    <p className="info">개인정보취급방침</p>
                    <p className="info">이용안내</p>
                </div>
            </div>

            <hr style={{border: 'solid 1px white'}} />
            <br/>

            <div className="text-center pb-3">
                <p><span style={{fontWeight: 'bold'}}>Copyright</span> &copy; 싱싱 과일쇼핑몰. All right reserved.</p>
            </div>
        </div>
    );
}

export default Footer;