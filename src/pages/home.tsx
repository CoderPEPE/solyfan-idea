function Home() {
    return (
        <div>
            <div className="preloader"></div>
            <div className="main-wrap">
                <div className="nav-header bg-transparent shadow-none border-0">
                    <div className="nav-top w-100">
                        <a href="index.html"><i className="feather-zap text-success display1-size me-2 ms-0"></i><span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">Sociala. </span> </a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-5 d-none d-xl-block p-0 vh-100 bg-image-cover bg-no-repeat" style={{ backgroundImage: "url(images/login-bg.jpg)" }}></div>
                    <div className="col-xl-7 vh-100 align-items-center d-flex bg-white rounded-3 overflow-hidden">
                        <div className="card shadow-none border-0 ms-auto me-auto login-card">
                            <div className="card-body rounded-0 text-left">
                                <h4 className="fw-300 font-xl display2-sm-size mb-3">Login into your account</h4>
                                <div className="col-sm-12 p-0 text-left">
                                    <div className="form-group mb-1"><a href="#" className="form-control text-center style2-input text-white fw-600 bg-dark border-0 p-0 ">Login</a></div>
                                </div>
                                <div className="col-sm-12 p-0 text-center mt-2">
                                    <h6 className="mb-0 d-inline-block bg-white fw-500 font-xsss text-grey-500 mb-3">View or Share content with the world.</h6>
                                </div>
                                <div className="col-sm-12 p-0 mt-2">
                                    <hr />
                                    <ul className="d-flex align-items-center justify-content-center mt-1">
                                        <li className="m-2"><h4 className="fw-700 font-sm">30+ <span className="font-xsssss fw-500 mt-1 text-grey-500 d-block">Creators</span></h4></li>
                                        <li className="m-2"><h4 className="fw-700 font-sm">1.2k <span className="font-xsssss fw-500 mt-1 text-grey-500 d-block">Subscribers</span></h4></li>
                                        <li className="m-2"><h4 className="fw-700 font-sm">634 SOL <span className="font-xsssss fw-500 mt-1 text-grey-500 d-block">Processed</span></h4></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home