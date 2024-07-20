import React, { useEffect, useRef, useState } from 'react';
import { useChat } from "../hooks/useChat";
import '../assets/css/ui.css';
import avatarSelectVideoOne from '../videos/hi-there.mp4'
import avatarSelectVideoTwo from '../videos/hi-there-two.mp4'
import avatarSelectVideoThree from '../videos/hi-there-three.mp4'
import avatarSelectVideoFour from '../videos/hi-there-four.mp4'
import avatarSelectVideoFive from '../videos/hi-there-five.mp4'
import avatarSelectVideoSix from '../videos/hi-there-six.mp4'

import avatarOneWebp from '../assets/images/avatar-one.webp'
import avatarTwoWebp from '../assets/images/avatar-two.webp'
import avatarThreeWebp from '../assets/images/avatar-three.webp'
import avatarFourWebp from '../assets/images/avatar-four.webp'
import avatarFiveWebp from '../assets/images/avatar-five.webp'
import avatarSixWebp from '../assets/images/avatar-six.webp'

import { Close, Home } from '@mui/icons-material';

const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
        </div>
    );
};

const AvatarSelection = ({
    showAvatarSelection,
    handleAvatarSelection,
    avatarSelected,
    handleStartConversation,
    loading,
    message,
    handleMouseEnterVideo,
    handleMouseLeaveVideo,
    setShowAvatarSelection
}) => {
    const [videoLoadingState, setVideoLoadingState] = useState({
        'avatar-one': false,
        'avatar-two': false,
        'avatar-three': false,
        'avatar-four': false,
        'avatar-five': false,
        'avatar-six': false,
    });

    const [showGoHomeTooltip, setShowGoHomeTooltip] = useState(false);

    const {
        setAvatarSelected,
        setHoveredAvatar
    } = useChat();

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // useEffect(()=>{
    //     console.log('swal2-popup:', document.getElementsByClassName('swal2-popup'));
    //     const getSwalPopUp = document.getElementsByClassName('swal2-popup')
    //     if(getSwalPopUp.length > 0 && !isMobile){
    //         getSwalPopUp.style.width = '40%'
    //     }
    // },[isMobile])

    const handleVideoLoadStart = (avatarId) => {
        setVideoLoadingState((prevState) => ({
            ...prevState,
            [avatarId]: true,
        }));
    };

    const handleVideoLoadEnd = (avatarId) => {
        setVideoLoadingState((prevState) => ({
            ...prevState,
            [avatarId]: false,
        }));
    };

    const handleAvatarHover = (event) => {
        console.log('event:', event);
        setHoveredAvatar(event)
    }

    const handleAvSelectionCls = () => {
        setShowAvatarSelection(false);
    }

    const handleHomePageRedirect = () => {
        window.location.href = homePageUrl
    }
    useEffect(() => {
        document.querySelectorAll('.backdrop-blur-md .conversation-button').length > 0
            ? document.body.classList.add('hidden-flow')
            : document.body.classList.remove('hidden-flow')
    }, []);

    useEffect(() => {
    }, [showAvatarSelection, avatarSelected]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const avatarSelectedParam = urlParams.get('avatarSelected');
        if (avatarSelectedParam) {
            setAvatarSelected(true)
        }
    }, [avatarSelected])

    useEffect(() => {
        document.body.classList.toggle('home-avatar-selection', avatarSelected);

        return () => {
            document.body.classList.remove('home-avatar-selection');
        };
    }, [avatarSelected]);

    useEffect(() => {
        if (document.querySelectorAll('.home-avatar-selection').length > 0) {
            document.body.classList.remove('hidden-overflow');
        }
    }, [avatarSelected]);

    return (
        <div className={`avatar-selection-container ${!showAvatarSelection ? 'home-avatar-selection' : ''} container-sec ${showAvatarSelection ? 'relative z-10 grid backdrop-blur-md pointer-events-all' : ''}`} style={{ overflowX: 'hidden' }} >
            <div className="w-full mr-5 home-page-btn-2 flex flex-row items-end justify-end gap-4">
                <div
                    className={`tooltip-left ${showGoHomeTooltip ? 'tooltip-visible' : ''}`}
                    style={{
                        backgroundColor: 'white',
                        padding: '5px',
                        borderRadius: '5px',
                        marginBottom: '6px'
                    }}
                >
                    <p
                        style={{
                            fontFamily: "Sans-serif"
                        }}
                    >Go To Home Page</p>
                </div>
                <button
                    className="pointer-events-auto homepage-button-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                    style={{
                        zIndex: '1'
                    }}
                    onClick={handleHomePageRedirect}
                    onMouseEnter={() => setShowGoHomeTooltip(true)}
                    onMouseLeave={() => setShowGoHomeTooltip(false)}
                >
                    <Home style={{ width: '35px', fontSize: 'xx-large' }} />
                </button>
            </div>
            <div style={{
                visibility: !avatarSelected || showAvatarSelection
                    ? 'visible'
                    : 'hidden',
                color: showAvatarSelection ? '#fff' : '#850097'
            }} className="avatar-selection-text">
                <p>{showAvatarSelection ? 'Please Select an Avatar You Wish!' : 'Please Select an Avatar To Continue!'}</p>
                {showAvatarSelection && (
                    <button onClick={handleAvSelectionCls}>
                        <Close style={{ color: '#000' }} />
                    </button>
                )}
            </div>
            <div style={{
                visibility: !avatarSelected || showAvatarSelection
                    ? 'visible'
                    : 'hidden'
            }} className="avatar-select-container">
                <div className="avatar-img-one flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-one')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-one', showAvatarSelection)}>
                        {videoLoadingState['avatar-one'] && <LoadingSpinner />}
                        {isMobile ? (<img
                            onLoadStart={() => handleVideoLoadStart('avatar-one')}
                            onLoadedData={() => handleVideoLoadEnd('avatar-one')}
                            src={avatarOneWebp}
                            alt="home page"
                        />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-one')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-one')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoTwo} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
                <div className="avatar-img-two flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-two')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-two', showAvatarSelection)}>
                        {videoLoadingState['avatar-two'] && <LoadingSpinner />}
                        {isMobile ? (
                            <img src={avatarTwoWebp} alt="home page" style={{}} />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-two')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-two')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoOne} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
                <div className="avatar-img-three flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-three')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-three', showAvatarSelection)}>
                        {videoLoadingState['avatar-three'] && <LoadingSpinner />}
                        {isMobile ? (
                            <img src={avatarThreeWebp} alt="home page" style={{}} />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-three')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-three')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoThree} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
                <div className="avatar-img-four flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-four')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-four', showAvatarSelection)}>
                        {videoLoadingState['avatar-four'] && <LoadingSpinner />}
                        {isMobile ? (
                            <img src={avatarFourWebp} alt="home page" style={{}} />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-four')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-four')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoFour} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
                <div className="avatar-img-five flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-five')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-five', showAvatarSelection)}>
                        {videoLoadingState['avatar-five'] && <LoadingSpinner />}
                        {isMobile ? (
                            <img src={avatarFiveWebp} alt="home page" style={{}} />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-five')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-five')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoFive} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
                <div className="avatar-img-six flex">
                    <button onMouseEnter={() => handleAvatarHover('avatar-six')} onMouseLeave={() => handleAvatarHover('none')} onClick={() => handleAvatarSelection('avatar-six', showAvatarSelection)}>
                        {videoLoadingState['avatar-six'] && <LoadingSpinner />}
                        {isMobile ? (
                            <img src={avatarSixWebp} alt="home page" />
                        ) : (
                            <video
                                className="video"
                                loop
                                onLoadStart={() => handleVideoLoadStart('avatar-six')}
                                onLoadedData={() => handleVideoLoadEnd('avatar-six')}
                                onMouseEnter={handleMouseEnterVideo}
                                onMouseLeave={handleMouseLeaveVideo}
                            >
                                <source src={avatarSelectVideoSix} type="video/mp4" />
                            </video>
                        )}
                    </button>
                </div>
            </div>
            <div style={{
                visibility: avatarSelected && !showAvatarSelection
                    ? 'visible'
                    : 'hidden'
            }} className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-center items-center backdrop-blur-md pointer-events-none">
                <div className="start-conversation flex items-center justify-center items-center gap-2 pointer-events-auto w-auto mx-auto">
                    <button
                        onClick={handleStartConversation}
                        className={`conversation-button fs-2 bg-purple-500 hover:bg-purple-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${loading || message ? "cursor-not-allowed opacity-30" : ""
                            }`}
                    >
                        Start Conversation !
                    </button>
                </div>
            </div>
        </div >
    );
};

export default AvatarSelection;