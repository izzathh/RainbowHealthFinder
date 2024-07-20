import { Leva } from "leva";
import { UI } from "../components/UI";
import { useChat } from "../hooks/useChat";
import { useEffect, useState } from "react";
import { RingLoader } from "react-spinners";
import '../assets/css/ui.css';
import AvatarLoaderComp from "../components/avatarLoader";
import Swal from 'sweetalert2'
import { useNetworkState } from 'react-use';

export const Main = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { avatarSelected, showAvatarSelection, hoveredAvatar } = useChat();
    const [connectionSpeed, setConnectionSpeed] = useState(null);
    const network = useNetworkState();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const avatarAudio = urlParams.get('avatarAudio');
        const avatarSelected = urlParams.get('avatarSelected');

        if (avatarAudio) {
            sessionStorage.setItem('avatarAudio', avatarAudio);
        }
        if (avatarSelected) {
            sessionStorage.setItem('avatarSelected', avatarSelected);
        }
    }, []);

    if (avatarSelected && !sessionStorage.getItem("welcomed")) {
        document.getElementById('root').style.overflow = 'hidden';
        document.getElementById('root').style.height = '100vh';
    } else {
        document.getElementById('root').style.overflow = 'hidden';
        document.getElementById('root').style.height = '100vh';
    }

    const getHoveredAvatarBg = (avatar) => {
        const options = {
            "avatar-one": "linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)",
            "avatar-two": "linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)",
            "avatar-three": "linear-gradient(19deg, #rgb(242 198 101) 15%, rgb(255 255 255) 100%)",
            "avatar-four": "linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)",
            "avatar-five": "linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)",
            "avatar-six": "linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)"
        }
        return options[avatar];
    }

    useEffect(() => {
        document.body.style.backgroundRepeat = 'no-repeat'
        // if (hoveredAvatar === 'none' || showAvatarSelection) {
        // avatarSelected
        // ?
        document.body.style.backgroundImage = 'linear-gradient(19deg, #e9b1f0 15%, #fbe1fe 100%)'
        // : document.body.style.backgroundImage = 'linear-gradient(19deg, #c976d4 15%, #fbe1fe 100%)'
        // } else {
        //     document.body.style.backgroundImage = getHoveredAvatarBg(hoveredAvatar)
        // }
    }, [avatarSelected, hoveredAvatar, showAvatarSelection])

    useEffect(() => {
        const getSession = sessionStorage.getItem("welcomed")
        if (getSession) {
            setTimeout(() => {
                setIsLoading(false);
            }, 100);
        } else {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }, []);

    useEffect(() => {
        const calculateSpeed = () => {
            try {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (connection) {
                    const speed = connection.downlink;
                    setConnectionSpeed(speed);
                    console.log('speed:', speed);
                    if (speed < 2 && sessionStorage.getItem('networkAlert') !== 'no') {
                        Swal.fire({
                            title: "Slow Internet Connection!",
                            text: "Avatar may take time to respond.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#a855f7",
                            cancelButtonColor: "#d33",
                            cancelButtonText: 'Ok',
                            confirmButtonText: "Don't show this again."
                        }).then((result) => {
                            if (result.isConfirmed) {
                                sessionStorage.setItem('networkAlert', 'no')
                            }
                        });
                    }
                }
            } catch (error) {
                alert('error: ' + error)
            }
        };

        calculateSpeed();

        if (navigator.connection && navigator.connection.addEventListener) {
            try {
                navigator.connection.addEventListener('change', calculateSpeed);
            } catch (error) {
                alert('Error adding event listener: ' + error);
            }
        }

        return () => {
            try {
                if (navigator.connection && navigator.connection.removeEventListener) {
                    navigator.connection.removeEventListener('change', calculateSpeed);
                }
            } catch (error) {
                alert('error-2: ' + error)
            }
        };
    }, []);

    return (
        <>
            {showAvatarSelection && (
                <div className="empty-block">
                </div>
            )}
            <Leva hidden />
            <UI />
            {isLoading && (
                <AvatarLoaderComp
                    isLoadingBack={isLoading}
                />
            )}
        </>
    );
}