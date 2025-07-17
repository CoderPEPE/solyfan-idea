import React from 'react';
import { Link } from 'react-router-dom';

const Leftnav: React.FC = () => {
    return (
        <div className="navigation scroll-bar">
            <div className="container ps-0 pe-0">
                <div className="nav-content">
                    {/* Main Navigation */}
                    <div className="nav-wrap bg-white bg-transparent-card rounded-xxl shadow-xss pt-4 pb-2 mb-3">
                        <ul className="mb-1 top-content">
                            <li>
                                <Link to="/home" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-home font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/defaultnotification" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-bell font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Notifications</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/defaultmessage" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-message-circle font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Messages</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/defaultbadge" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-bookmark font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Collections</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/payment" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-credit-card font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Subscriptions</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/userpage" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-plus-circle font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">Add card</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/userpage" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-user font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">My profile</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/defaultsettings" className="nav-content-bttn open-font d-flex align-items-center py-2">
                                    <i className="feather-more-horizontal font-lg me-3 text-grey-700"></i>
                                    <span className="font-sm fw-600">More</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* New Post Button */}
                    <div className="nav-wrap bg-white bg-transparent-card rounded-xxl shadow-xss pt-3 pb-3 mb-3">
                        <Link to="/createpost" className="btn btn-primary w-100 rounded-xl py-2 px-4 font-sm fw-600">
                            <i className="feather-plus me-2"></i>
                            NEW POST
                        </Link>
                    </div>

                    {/* Account Section */}
                    <div className="nav-wrap bg-white bg-transparent-card rounded-xxl shadow-xss pt-3 pb-1">
                        <div className="nav-caption fw-600 font-xssss text-grey-500 mb-2">Account</div>
                        <ul className="mb-1">
                            <li>
                                <Link to="/defaultsettings" className="nav-content-bttn open-font h-auto pt-2 pb-2">
                                    <i className="font-sm feather-settings me-3 text-grey-500"></i>
                                    <span>Settings</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/defaultanalytics" className="nav-content-bttn open-font h-auto pt-2 pb-2">
                                    <i className="font-sm feather-pie-chart me-3 text-grey-500"></i>
                                    <span>Analytics</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leftnav;

