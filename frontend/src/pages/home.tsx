function Home() {
  return (
    <div className="main-wrapper">
      {/* Navigation Header */}
      <div className="nav-header bg-white shadow-xs border-0">
        <div className="nav-top">
          <a href="/">
            <i className="feather-zap text-success display1-size me-2 ms-0"></i>
            <span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">
              SolyFans
            </span>
          </a>
          <a href="#" className="mob-menu ms-auto me-2 chat-active-btn">
            <i className="feather-message-circle text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </a>
          <a href="#" className="me-2 menu-search-icon mob-menu">
            <i className="feather-search text-grey-900 font-sm btn-round-md bg-greylight"></i>
          </a>
          <button className="nav-menu me-0 ms-2"></button>
        </div>
        
        <form action="#" className="float-left header-search">
          <div className="form-group mb-0 icon-input">
            <i className="feather-search font-sm text-grey-400"></i>
            <input 
              type="text" 
              placeholder="Search creators..." 
              className="bg-grey border-0 lh-32 pt-2 pb-2 ps-5 pe-3 font-xssss fw-500 rounded-xl w350 theme-dark-bg"
            />
          </div>
        </form>
        
        <a href="/default" className="p-2 text-center ms-3 menu-icon center-menu-icon">
          <i className="feather-home font-lg alert-primary btn-round-lg theme-dark-bg text-current"></i>
        </a>
        <a href="/auth" className="p-2 text-center ms-0 menu-icon center-menu-icon">
          <i className="feather-user font-lg bg-greylight btn-round-lg theme-dark-bg text-grey-500"></i>
        </a>
        
        <a href="#" className="p-2 text-center ms-auto menu-icon">
          <span className="dot-count bg-warning"></span>
          <i className="feather-bell font-xl text-current"></i>
        </a>
        <a href="#" className="p-2 text-center ms-3 menu-icon chat-active-btn">
          <i className="feather-message-square font-xl text-current"></i>
        </a>
        <a href="/account" className="p-0 ms-3 menu-icon">
          <img src="/images/profile-4.png" alt="user" className="w40 mt--1" />
        </a>
      </div>

      {/* Main Content */}
      <div className="container-fluid">
        <div className="row">
          {/* Left Sidebar */}
          <nav className="col-xl-2 col-lg-3 navigation scroll-bar">
            <div className="nav-content">
              <div className="nav-wrap bg-white bg-transparent-card rounded-xxl shadow-xss pt-3 pb-1 mb-2 mt-2">
                <div className="nav-caption fw-600 font-xssss text-grey-500">
                  <span>Main</span> Menu
                </div>
                <ul className="mb-1 top-content">
                  <li>
                    <a href="/default" className="nav-content-bttn open-font">
                      <i className="feather-tv btn-round-md bg-blue-gradiant me-3"></i>
                      <span>Home Feed</span>
                    </a>
                  </li>
                  <li>
                    <a href="/subscriptions" className="nav-content-bttn open-font">
                      <i className="feather-award btn-round-md bg-red-gradiant me-3"></i>
                      <span>Subscriptions</span>
                    </a>
                  </li>
                  <li>
                    <a href="/creators" className="nav-content-bttn open-font">
                      <i className="feather-users btn-round-md bg-green-gradiant me-3"></i>
                      <span>Discover</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="nav-wrap bg-white bg-transparent-card rounded-xxl shadow-xss pt-3 pb-1 mb-2">
                <div className="nav-caption fw-600 font-xssss text-grey-500">
                  <span>For</span> Creators
                </div>
                <ul className="mb-3">
                  <li>
                    <a href="/upload" className="nav-content-bttn open-font">
                      <i className="font-xl text-current feather-plus me-3"></i>
                      <span>Upload Content</span>
                    </a>
                  </li>
                  <li>
                    <a href="/analytics" className="nav-content-bttn open-font">
                      <i className="font-xl text-current feather-bar-chart me-3"></i>
                      <span>Analytics</span>
                    </a>
                  </li>
                  <li>
                    <a href="/earnings" className="nav-content-bttn open-font">
                      <i className="font-xl text-current feather-dollar-sign me-3"></i>
                      <span>Earnings</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main Feed */}
          <div className="col-xl-8 col-lg-6 order-1">
            <div className="middle-sidebar-bottom">
              <div className="middle-sidebar-left">
                
                {/* Welcome Message */}
                <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                  <div className="card-body p-0">
                    <h2 className="fw-700 text-grey-900 font-md mb-2">Welcome to SolyFans</h2>
                    <p className="fw-500 text-grey-500 lh-26 font-xssss w-100 mb-2">
                      Discover amazing content creators and exclusive content on the Solana blockchain.
                    </p>
                    <a href="/auth" className="btn bg-primary-gradiant text-white font-xsssss fw-600 ls-2 rounded-xl p-2 mt-2">
                      Get Started
                    </a>
                  </div>
                </div>

                {/* Featured Creators */}
                <div className="card w-100 shadow-none bg-transparent bg-transparent-card border-0 p-0 mb-0">
                  <div className="card-body p-0">
                    <h4 className="fw-700 font-xsss text-grey-900 mb-3">Featured Creators</h4>
                    <div className="row">
                      <div className="col-md-4 col-sm-6 pe-2 ps-2">
                        <div className="card w-100 d-block border-0 shadow-xss rounded-xxl overflow-hidden mb-3">
                          <div className="card-body position-relative h100 bg-image-cover bg-image-center" 
                               style={{ backgroundImage: 'url(/images/u-bg.jpg)', height: '100px' }}>
                          </div>
                          <div className="card-body d-block w-100 ps-4 pe-4 pb-4 text-center">
                            <figure className="avatar ms-auto me-auto mb-0 mt--6 position-relative w75 z-index-1">
                              <img src="/images/user-11.png" alt="creator" className="float-right p-1 bg-white rounded-circle w-100" />
                            </figure>
                            <div className="clearfix"></div>
                            <h4 className="fw-700 font-xsss mt-2 mb-1">Sarah Johnson</h4>
                            <p className="fw-500 font-xsssss text-grey-500 mt-0 mb-2">@sarahj</p>
                            <span className="live-tag mt-2 mb-0 bg-danger p-2 z-index-1 rounded-3 text-white font-xsssss text-uppercase fw-700 ls-3">
                              1.2K
                            </span> Subscribers
                            <div className="clearfix mb-2"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4 col-sm-6 pe-2 ps-2">
                        <div className="card w-100 d-block border-0 shadow-xss rounded-xxl overflow-hidden mb-3">
                          <div className="card-body position-relative h100 bg-image-cover bg-image-center" 
                               style={{ backgroundImage: 'url(/images/u-bg.jpg)', height: '100px' }}>
                          </div>
                          <div className="card-body d-block w-100 ps-4 pe-4 pb-4 text-center">
                            <figure className="avatar ms-auto me-auto mb-0 mt--6 position-relative w75 z-index-1">
                              <img src="/images/user-12.png" alt="creator" className="float-right p-1 bg-white rounded-circle w-100" />
                            </figure>
                            <div className="clearfix"></div>
                            <h4 className="fw-700 font-xsss mt-2 mb-1">Mike Chen</h4>
                            <p className="fw-500 font-xsssss text-grey-500 mt-0 mb-2">@mikec</p>
                            <span className="live-tag mt-2 mb-0 bg-danger p-2 z-index-1 rounded-3 text-white font-xsssss text-uppercase fw-700 ls-3">
                              850
                            </span> Subscribers
                            <div className="clearfix mb-2"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4 col-sm-6 pe-2 ps-2">
                        <div className="card w-100 d-block border-0 shadow-xss rounded-xxl overflow-hidden mb-3">
                          <div className="card-body position-relative h100 bg-image-cover bg-image-center" 
                               style={{ backgroundImage: 'url(/images/u-bg.jpg)', height: '100px' }}>
                          </div>
                          <div className="card-body d-block w-100 ps-4 pe-4 pb-4 text-center">
                            <figure className="avatar ms-auto me-auto mb-0 mt--6 position-relative w75 z-index-1">
                              <img src="/images/user-2.png" alt="creator" className="float-right p-1 bg-white rounded-circle w-100" />
                            </figure>
                            <div className="clearfix"></div>
                            <h4 className="fw-700 font-xsss mt-2 mb-1">Alex Rivera</h4>
                            <p className="fw-500 font-xsssss text-grey-500 mt-0 mb-2">@alexr</p>
                            <span className="live-tag mt-2 mb-0 bg-danger p-2 z-index-1 rounded-3 text-white font-xsssss text-uppercase fw-700 ls-3">
                              2.1K
                            </span> Subscribers
                            <div className="clearfix mb-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Posts */}
                <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                  <div className="card-body p-0 d-flex">
                    <figure className="avatar me-3">
                      <img src="/images/user-7.png" alt="user" className="shadow-sm rounded-circle w45" />
                    </figure>
                    <h4 className="fw-700 text-grey-900 font-xssss mt-1">
                      Sarah Johnson
                      <span className="d-block font-xssss fw-500 mt-1 lh-3 text-grey-500">3 hours ago</span>
                    </h4>
                    <a href="#" className="ms-auto">
                      <i className="ti-more-alt text-grey-900 btn-round-md bg-greylight font-xss"></i>
                    </a>
                  </div>
                  
                  <div className="card-body p-0 me-lg-5">
                    <p className="fw-500 text-grey-500 lh-26 font-xssss w-100 mb-2">
                      Just dropped some exclusive content for my subscribers! 🔥 
                      Check out my latest photoshoot behind the scenes.
                      <a href="#" className="fw-600 text-primary ms-2">See more</a>
                    </p>
                  </div>
                  
                  <div className="card-body d-block p-0 mb-3">
                    <div className="row ps-2 pe-2">
                      <div className="col-sm-12 p-1">
                        <img src="/images/t-31.jpg" className="rounded-3 w-100" alt="post" style={{ maxHeight: '400px', objectFit: 'cover' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body d-flex p-0">
                    <a href="#" className="emoji-bttn d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss me-2">
                      <i className="feather-heart text-white bg-red-gradiant me-2 btn-round-xs font-xss"></i>
                      124 Likes
                    </a>
                    <a href="#" className="d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss">
                      <i className="feather-message-circle text-dark text-grey-900 btn-round-sm font-lg"></i>
                      <span className="d-none-xss">8 Comments</span>
                    </a>
                    <a href="#" className="ms-auto d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss">
                      <i className="feather-share-2 text-grey-900 text-dark btn-round-sm font-lg"></i>
                      <span className="d-none-xs">Share</span>
                    </a>
                  </div>
                </div>

                {/* Additional Sample Post */}
                <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                  <div className="card-body p-0 d-flex">
                    <figure className="avatar me-3">
                      <img src="/images/user-8.png" alt="user" className="shadow-sm rounded-circle w45" />
                    </figure>
                    <h4 className="fw-700 text-grey-900 font-xssss mt-1">
                      Mike Chen
                      <span className="d-block font-xssss fw-500 mt-1 lh-3 text-grey-500">5 hours ago</span>
                    </h4>
                    <a href="#" className="ms-auto">
                      <i className="ti-more-alt text-grey-900 btn-round-md bg-greylight font-xss"></i>
                    </a>
                  </div>
                  
                  <div className="card-body p-0 me-lg-5">
                    <p className="fw-500 text-grey-500 lh-26 font-xssss w-100 mb-2">
                      New video tutorial is live! Learn how to maximize your earnings on SolyFans 💰
                      <a href="#" className="fw-600 text-primary ms-2">Watch now</a>
                    </p>
                  </div>
                  
                  <div className="card-body d-block p-0 mb-3">
                    <div className="row ps-2 pe-2">
                      <div className="col-xs-4 col-sm-4 p-1">
                        <img src="/images/t-10.jpg" className="rounded-3 w-100" alt="post" />
                      </div>
                      <div className="col-xs-4 col-sm-4 p-1">
                        <img src="/images/t-11.jpg" className="rounded-3 w-100" alt="post" />
                      </div>
                      <div className="col-xs-4 col-sm-4 p-1">
                        <div className="position-relative">
                          <img src="/images/t-12.jpg" className="rounded-3 w-100" alt="post" />
                          <span className="img-count font-sm text-white ls-3 fw-600 position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <b>+3</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body d-flex p-0">
                    <a href="#" className="emoji-bttn d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss me-2">
                      <i className="feather-heart text-white bg-red-gradiant me-2 btn-round-xs font-xss"></i>
                      89 Likes
                    </a>
                    <a href="#" className="d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss">
                      <i className="feather-message-circle text-dark text-grey-900 btn-round-sm font-lg"></i>
                      <span className="d-none-xss">12 Comments</span>
                    </a>
                    <a href="#" className="ms-auto d-flex align-items-center fw-600 text-grey-900 text-dark lh-26 font-xssss">
                      <i className="feather-share-2 text-grey-900 text-dark btn-round-sm font-lg"></i>
                      <span className="d-none-xs">Share</span>
                    </a>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="card w-100 text-center shadow-xss rounded-xxl border-0 p-4 mb-3 mt-3">
                  <div className="card-body p-0">
                    <h4 className="fw-700 text-grey-900 font-md mb-2">Ready to Start Creating?</h4>
                    <p className="fw-500 text-grey-500 lh-26 font-xssss w-100 mb-3">
                      Join thousands of creators earning with exclusive content on SolyFans
                    </p>
                    <a href="/auth" className="btn bg-primary-gradiant text-white font-xsssss fw-600 ls-2 rounded-xl p-3">
                      Become a Creator
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-xl-2 col-lg-3 order-3">
            <div className="right-sidebar-bottom">
              <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                <div className="card-body p-0">
                  <h4 className="fw-700 font-xsss text-grey-900 mb-3">Platform Stats</h4>
                  <div className="row">
                    <div className="col-12 text-center mb-3">
                      <h4 className="fw-700 font-sm">30+</h4>
                      <span className="font-xsssss fw-500 text-grey-500">Active Creators</span>
                    </div>
                    <div className="col-12 text-center mb-3">
                      <h4 className="fw-700 font-sm">1.2K</h4>
                      <span className="font-xsssss fw-500 text-grey-500">Subscribers</span>
                    </div>
                    <div className="col-12 text-center">
                      <h4 className="fw-700 font-sm">634 SOL</h4>
                      <span className="font-xsssss fw-500 text-grey-500">Total Earned</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card w-100 shadow-xss rounded-xxl border-0 p-4 mb-3">
                <div className="card-body p-0">
                  <h4 className="fw-700 font-xsss text-grey-900 mb-3">Trending Tags</h4>
                  <div className="tags-wrap">
                    <span className="badge bg-primary-gradiant text-white font-xsssss fw-600 rounded-xl p-2 m-1">#content</span>
                    <span className="badge bg-secondary text-white font-xsssss fw-600 rounded-xl p-2 m-1">#exclusive</span>
                    <span className="badge bg-success text-white font-xsssss fw-600 rounded-xl p-2 m-1">#solana</span>
                    <span className="badge bg-danger text-white font-xsssss fw-600 rounded-xl p-2 m-1">#crypto</span>
                    <span className="badge bg-warning text-white font-xsssss fw-600 rounded-xl p-2 m-1">#nft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;