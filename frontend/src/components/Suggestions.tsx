import React from 'react';
import { Link } from 'react-router-dom';

const Suggestions: React.FC = () => {
    const suggestions = [
        {
            id: 1,
            name: 'Viktoria Eden',
            username: '@viktoriaeeden',
            image: 'user-1.png',
            verified: true,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            id: 2,
            name: 'Natalia Brooks',
            username: '@nataliabrooks',
            image: 'user-2.png',
            verified: true,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            id: 3,
            name: 'Ella',
            username: '@ella',
            image: 'user-3.png',
            verified: false,
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        }
    ];

    return (
        <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3">
            <div className="card-body d-flex align-items-center p-4">
                <h4 className="fw-700 mb-0 font-xssss text-grey-900">SUGGESTIONS</h4>
                <Link to="/suggestions" className="fw-600 ms-auto font-xssss text-primary">
                    See all
                </Link>
            </div>
            <div className="card-body pt-0">
                {suggestions.map((user) => (
                    <div key={user.id} className="d-flex align-items-center mb-3">
                        <div 
                            className="position-relative me-3"
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '15px',
                                background: user.background,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img 
                                src={`assets/images/${user.image}`} 
                                alt={user.name}
                                className="w-100 h-100 rounded-3 object-cover"
                                style={{ objectFit: 'cover' }}
                            />
                            {user.verified && (
                                <div className="position-absolute" style={{ top: '-5px', right: '-5px' }}>
                                    <i className="feather-check-circle text-success font-sm bg-white rounded-circle"></i>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow-1">
                            <h4 className="fw-700 text-grey-900 font-xssss mt-0 mb-1">
                                {user.name}
                                {user.verified && <i className="feather-check-circle text-success font-xssss ms-1"></i>}
                            </h4>
                            <p className="fw-500 text-grey-500 font-xssss mb-0">{user.username}</p>
                        </div>
                        <Link 
                            to={`/user/${user.id}`} 
                            className="btn btn-outline-primary btn-sm rounded-xl fw-600 font-xssss px-3 py-1"
                        >
                            Follow
                        </Link>
                    </div>
                ))}
            </div>
            <div className="card-body pt-0">
                <div className="d-flex align-items-center justify-content-between text-grey-500 font-xssss">
                    <Link to="/privacy" className="text-decoration-none text-grey-500">Privacy</Link>
                    <Link to="/cookies" className="text-decoration-none text-grey-500">Cookie Notice</Link>
                    <Link to="/terms" className="text-decoration-none text-grey-500">Terms of Service</Link>
                </div>
            </div>
        </div>
    );
};

export default Suggestions;