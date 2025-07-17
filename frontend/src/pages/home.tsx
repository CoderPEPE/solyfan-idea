import React, { Fragment } from 'react';

const Home: React.FC = () => {
    return (
        <Fragment>
            <div className="container-fluid vh-100 d-flex">
                {/* Left Sidebar */}
                <div className="col-3 bg-white p-0" style={{ maxWidth: '280px' }}>
                    <div className="p-4">
                        <h4 className="fw-700 font-md mb-4">HOME</h4>
                        
                        {/* Navigation Menu */}
                        <div className="nav-menu">
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-home font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Home</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-bell font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Notifications</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-message-circle font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Messages</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-bookmark font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Collections</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-credit-card font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Subscriptions</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-plus-circle font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">Add card</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-user font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">My profile</span>
                            </div>
                            <div className="nav-item d-flex align-items-center py-3 cursor-pointer">
                                <i className="feather-more-horizontal font-lg me-3 text-grey-700"></i>
                                <span className="font-sm fw-600 text-grey-900">More</span>
                            </div>
                        </div>

                        {/* New Post Button */}
                        <div className="mt-4">
                            <button className="btn btn-primary w-100 rounded-pill py-3 font-sm fw-700">
                                NEW POST
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-6 bg-white border-start border-end" style={{ maxWidth: '600px' }}>
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                        <h4 className="fw-700 font-md mb-0">HOME</h4>
                        <div className="d-flex align-items-center">
                            <i className="feather-settings font-lg me-3 text-grey-700 cursor-pointer"></i>
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 rounded-pill ps-4 pe-3 py-2" 
                                    placeholder="Search posts"
                                    style={{ width: '200px' }}
                                />
                                <i className="feather-search position-absolute start-0 top-50 translate-middle-y ms-2 text-grey-500"></i>
                            </div>
                        </div>
                    </div>

                    {/* Compose Post */}
                    <div className="p-3 border-bottom">
                        <p className="text-grey-500 mb-0 font-xsss">Compose new post</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="d-flex border-bottom">
                        <div className="px-3 py-2 text-center cursor-pointer border-bottom border-primary" style={{ minWidth: '60px' }}>
                            <span className="font-sm fw-600 text-primary">All</span>
                        </div>
                        <div className="px-3 py-2 text-center cursor-pointer" style={{ minWidth: '60px' }}>
                            <i className="feather-image font-sm me-1"></i>
                        </div>
                        <div className="px-3 py-2 text-center cursor-pointer" style={{ minWidth: '60px' }}>
                            <i className="feather-video font-sm me-1"></i>
                        </div>
                        <div className="px-3 py-2 text-center cursor-pointer" style={{ minWidth: '60px' }}>
                            <i className="feather-radio font-sm me-1"></i>
                        </div>
                    </div>

                    {/* OnlyFans Post */}
                    <div className="p-3">
                        <div className="d-flex align-items-center mb-3">
                            <div className="position-relative me-3">
                                <img 
                                    src="assets/images/user-8.png" 
                                    alt="OnlyFans" 
                                    className="w40 h40 rounded-circle"
                                />
                                <div className="position-absolute" style={{ top: '-2px', right: '-2px' }}>
                                    <i className="feather-check-circle text-success font-xsss bg-white rounded-circle"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <h4 className="fw-700 text-grey-900 font-xsss mb-0">
                                    OnlyFans
                                    <i className="feather-check-circle text-success font-xsss ms-1"></i>
                                </h4>
                                <p className="fw-500 text-grey-500 font-xsss mb-0">4 hours ago</p>
                            </div>
                            <div className="ms-auto">
                                <i className="feather-more-horizontal text-grey-500 font-md cursor-pointer"></i>
                            </div>
                        </div>
                        
                        <p className="fw-500 text-grey-500 lh-26 font-xsss mb-3">
                            So the ship has sailed on the stakes are wrapped in pastry. 
                            <span className="text-primary">@melissaniratton</span> and 
                            <span className="text-primary">@annieconnor</span> go head-to-head in a Beef Wellington showdown, but only one can walk away with $20,000 as the Season Six Champion.
                        </p>

                        {/* Main Post Image */}
                        <div className="position-relative mb-3">
                            <img 
                                src="assets/images/t-30.jpg" 
                                alt="Post" 
                                className="w-100 rounded-3"
                                style={{ height: '400px', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Profile Images Grid */}
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <div className="position-relative">
                                    <img 
                                        src="assets/images/user-12.png" 
                                        alt="Melissa" 
                                        className="w-100 rounded-3"
                                        style={{ height: '120px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute bottom-0 start-0 p-2">
                                        <span className="text-white font-xsss fw-600">Melissa Str...</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="position-relative">
                                    <img 
                                        src="assets/images/user-11.png" 
                                        alt="Jason" 
                                        className="w-100 rounded-3"
                                        style={{ height: '120px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute bottom-0 start-0 p-2">
                                        <span className="text-white font-xsss fw-600">Jason Lu...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post Actions */}
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <i className="feather-heart text-grey-500 font-md me-3 cursor-pointer"></i>
                                <i className="feather-message-circle text-grey-500 font-md me-3 cursor-pointer"></i>
                                <i className="feather-share text-grey-500 font-md me-3 cursor-pointer"></i>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="text-grey-500 font-xsss me-2">57 likes</span>
                                <i className="feather-bookmark text-grey-500 font-md cursor-pointer"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-3 bg-white p-0">
                    <div className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h4 className="fw-700 font-sm mb-0">SUGGESTIONS</h4>
                            <div className="d-flex align-items-center">
                                <i className="feather-refresh-cw font-sm me-2 text-grey-500 cursor-pointer"></i>
                                <i className="feather-x font-sm text-grey-500 cursor-pointer"></i>
                            </div>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="mb-3">
                            <div 
                                className="rounded-3 p-3 position-relative"
                                style={{ 
                                    background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
                                    height: '120px'
                                }}
                            >
                                <div className="position-absolute top-0 end-0 p-2">
                                    <i className="feather-more-horizontal text-white font-sm cursor-pointer"></i>
                                </div>
                                <div className="position-absolute bottom-0 start-0 p-3">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src="assets/images/user-1.png" 
                                            alt="Viktoria" 
                                            className="w30 h30 rounded-circle me-2"
                                        />
                                        <div>
                                            <h5 className="text-white font-xsss fw-700 mb-0">Viktoria Eden</h5>
                                            <p className="text-white font-xsss mb-0 opacity-75">@viktoriaeeden</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div 
                                className="rounded-3 p-3 position-relative"
                                style={{ 
                                    background: 'linear-gradient(135deg, #FF69B4 0%, #8A2BE2 100%)',
                                    height: '120px'
                                }}
                            >
                                <div className="position-absolute top-0 end-0 p-2">
                                    <i className="feather-more-horizontal text-white font-sm cursor-pointer"></i>
                                </div>
                                <div className="position-absolute bottom-0 start-0 p-3">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src="assets/images/user-2.png" 
                                            alt="Natalia" 
                                            className="w30 h30 rounded-circle me-2"
                                        />
                                        <div>
                                            <h5 className="text-white font-xsss fw-700 mb-0">Natalia Brooks</h5>
                                            <p className="text-white font-xsss mb-0 opacity-75">@nataliabrooks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div 
                                className="rounded-3 p-3 position-relative"
                                style={{ 
                                    background: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%)',
                                    height: '120px'
                                }}
                            >
                                <div className="position-absolute top-0 end-0 p-2">
                                    <i className="feather-more-horizontal text-white font-sm cursor-pointer"></i>
                                </div>
                                <div className="position-absolute bottom-0 start-0 p-3">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src="assets/images/user-3.png" 
                                            alt="Ella" 
                                            className="w30 h30 rounded-circle me-2"
                                        />
                                        <div>
                                            <h5 className="text-white font-xsss fw-700 mb-0">Ella</h5>
                                            <p className="text-white font-xsss mb-0 opacity-75">@ella</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex flex-wrap">
                                <span className="text-grey-500 font-xsss me-3 mb-2 cursor-pointer">Privacy</span>
                                <span className="text-grey-500 font-xsss me-3 mb-2 cursor-pointer">Cookie Notice</span>
                                <span className="text-grey-500 font-xsss me-3 mb-2 cursor-pointer">Terms of Service</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Home;
