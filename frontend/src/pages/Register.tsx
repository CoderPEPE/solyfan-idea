'use client';
import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
                navigate('/home');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <div className="main-wrap">
                <div className="nav-header bg-transparent shadow-none border-0">
                    <div className="nav-top w-100">
                        {/* <Link to="/login"><i className="feather-zap text-success display1-size me-2 ms-0"></i><span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">Solyfans </span> </Link> */}
                        <button className="nav-menu me-0 ms-auto"></button>

                        <Link to="/login" className="header-btn d-none d-lg-block bg-dark fw-500 text-white font-xsss p-3 ms-auto w100 text-center lh-20 rounded-xl">Login</Link>
                        <Link to="/register" className="header-btn d-none d-lg-block bg-current fw-500 text-white font-xsss p-3 ms-2 w100 text-center lh-20 rounded-xl">Register</Link>
                    </div>
                </div>


                <div className="row">
                    <div className="col-xl-5 d-none d-xl-block p-0 vh-100 bg-image-cover bg-no-repeat"
                        style={{ backgroundImage: `url("assets/images/login.svg")` }}></div>
                    <div className="col-xl-7 vh-100 align-items-center d-flex bg-white rounded-3 overflow-hidden">
                        <div className="card shadow-none border-0 ms-auto me-auto login-card">
                            <div className="card-body rounded-0 text-left">
                                <h2 className="fw-700 display1-size display2-md-size mb-4">Create <br />your account</h2>

                                {error && (
                                    <div className="alert alert-danger font-xsss fw-500 mb-3" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group icon-input mb-3">
                                        <i className="font-sm ti-user text-grey-500 pe-0"></i>
                                        <input
                                            type="text"
                                            name="username"
                                            className="style2-input ps-5 form-control text-grey-900 font-xsss fw-600"
                                            placeholder="Your Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group icon-input mb-3">
                                        <i className="font-sm ti-email text-grey-500 pe-0"></i>
                                        <input
                                            type="email"
                                            name="email"
                                            className="style2-input ps-5 form-control text-grey-900 font-xsss fw-600"
                                            placeholder="Your Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group icon-input mb-3">
                                        <input
                                            type="password"
                                            name="password"
                                            className="style2-input ps-5 form-control text-grey-900 font-xss ls-3"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <i className="font-sm ti-lock text-grey-500 pe-0"></i>
                                    </div>
                                    <div className="form-group icon-input mb-1">
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="style2-input ps-5 form-control text-grey-900 font-xss ls-3"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                        <i className="font-sm ti-lock text-grey-500 pe-0"></i>
                                    </div>
                                    <div className="form-check text-left mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input mt-2"
                                            id="exampleCheck2"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                        />
                                        <label className="form-check-label font-xsss text-grey-500">Accept Term and Conditions</label>
                                    </div>

                                    <div className="col-sm-12 p-0 text-left">
                                        <div className="form-group mb-1">
                                            <button
                                                type="submit"
                                                className="form-control text-center style2-input text-white fw-600 bg-dark border-0 p-0"
                                                disabled={loading}
                                            >
                                                {loading ? 'Registering...' : 'Register'}
                                            </button>
                                        </div>
                                        <h6 className="text-grey-500 font-xsss fw-500 mt-0 mb-0 lh-32">Already have account <Link to="/login" className="fw-700 ms-1">Login</Link></h6>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Fragment>
    )
}

export default Register