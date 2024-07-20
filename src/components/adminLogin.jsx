import React, { useEffect, useRef, useState } from 'react';
import logo from "../assets/images/rainbowhealthfinder-header-logo.png"
import '../assets/css/adminLogin.css';
import { useNavigate } from "react-router";
import { Bounce, toast } from 'react-toastify';
import axios from 'axios'
import '../assets/css/ui.css';

import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AdminLogin = () => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleAdminLogin = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/admin-login`, { userName, password });
            console.log('data.status:', data);
            if (data.status == 0) {
                toast.error(data.message, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                return
            } else {
                sessionStorage.setItem('adminLogged', 'yes')
                navigate("/survey-reports")
            }
        } catch (error) {
            toast.error('internal error', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    }

    return (
        <div className='admin-login-container'>
            <div className='login-box'>
                <div>
                    <img src={logo} alt="logo" />
                </div>
                <div>
                    <TextField
                        className='username-input'
                        placeholder="User Name"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdminLogin()
                            }
                        }}
                    />
                </div>
                <div>
                    <TextField
                        className='password-input'
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdminLogin()
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <div>
                    <button
                        onClick={handleAdminLogin}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdminLogin()
                            }
                        }}
                    >
                        submit
                    </button>
                </div>
            </div>
        </div>
    )
}