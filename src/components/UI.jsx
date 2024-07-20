import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import '../assets/css/ui.css';
import '../assets/css/messageList.css';
import logo from "../assets/images/rainbowhealthfinder-header-logo.png"
import { Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment"
import Swal from 'sweetalert2'

const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const newTabUrl = import.meta.env.VITE_NEW_TAB_URL

import { Canvas } from "@react-three/fiber";
import { Experience } from "../components/Experience";
import AvatarLoaderComp from "../components/avatarLoader";

import AvatarSelection from '../components/selectAvatar';
import gifIcon from '../assets/images/loader.gif';
import micIconGif from '../assets/images/icons8-microphone.gif'
import micIcon from '../assets/images/microphone.png'
import chatLoaderGif from '../assets/images/chat-loader.gif'
import voiceOverOff from '../assets/images/voice-over-off.png'
import {
  Download,
  Man2,
  Home,
  AutoStories,
  HealthAndSafety,
  Send,
  SpatialAudioOff,
  QuestionAnswer
} from '@mui/icons-material';

const ChatMessage = ({ userName, time, text, userProfile }) => {

  const profileStyle = {
    backgroundImage: `url(${userProfile})`,
  };

  return (
    <div className="chat-message">
      <div>
        <div className="user-profile" style={profileStyle}></div>
      </div>
      <div className="message-content">
        <div className="user-info">
          <span className={`user-name`}>{userName}</span>
          <span className="message-time">{time}</span>
        </div>
        {text.map((textContent, index) => (
          <div
            key={index}
            className={`message-text ${userName === 'You' ? 'bg-purple-800 text-white' : 'bg-white'} backdrop-blur-md bg-opacity-50 p-2 rounded-lg`}
            dangerouslySetInnerHTML={{
              __html: textContent.text?.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            }}
          >
          </div>
        ))}
      </div>
    </div>
  );
};

const Chat = ({ chatData, handleAvatarAudio }) => {
  const chatRef = useRef(null);
  const input = useRef();
  const [chatLength, setChatLength] = useState(0)

  const {
    chat,
    setRasaButtons,
    rasaButtons,
    isMobile,
    avatarLoader
  } = useChat();

  useEffect(() => {
    setChatLength(chatData[0]?.length)
  }, [chatData[0]])

  useEffect(() => {
    const getFirstQn = JSON.parse(sessionStorage.getItem('chatData'))
    if (chatRef.current && getFirstQn?.length > 1) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    if (getFirstQn?.length <= 1) {
      const timer = setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [chatLength, isMobile]);

  useEffect(() => {
    const rasaButton = sessionStorage.getItem('rasaButtons')
      ? JSON.parse(sessionStorage.getItem('rasaButtons'))
      : false
    if (rasaButton) {
      setRasaButtons(rasaButton)
    }
  }, [])

  const handleServices = (title, payload) => {
    try {
      if (payload === 'sessionRestart') {
        const anchorElement = document.getElementById('new-session-anchor');
        if (anchorElement) {
          anchorElement.click();
        }
      } else {
        sessionStorage.setItem('rasaButtons', [])
        setRasaButtons([])
        handleAvatarAudio('chat');
        chat(title, 'female', true, false, payload)
      }
    } catch (error) {
      console.error('error:', error);
    }
  }

  const sendRasaInputMessage = () => {
    const text = input.current.value;
    if (!text) {
      toast.error('Please self describe!', {
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
      return;
    }

    handleAvatarAudio('chat');
    sessionStorage.setItem('rasaButtons', [])
    setRasaButtons([])

    // if (!chatData[1] && !chatData[2] && !chatData[3]) {
    const getSessionService = sessionStorage.getItem('currentService')
    let storedValidData;
    const storedDataString = sessionStorage.getItem("chatData");
    const storedEduDataString = sessionStorage.getItem("chatEduData");
    storedValidData = getSessionService === 'education'
      ? storedEduDataString : storedDataString
    const storedDataArray = storedValidData ? JSON.parse(storedValidData) : [];

    storedDataArray.push({
      userName: 'You',
      time: moment().format('hh:mm A'),
      text: [
        {
          text: text
        }
      ],
      userImg: '/src/assets/images/user.webp'
    });
    const updatedDataString = JSON.stringify(storedDataArray);

    getSessionService === 'education'
      ? sessionStorage.setItem("chatEduData", updatedDataString)
      : sessionStorage.setItem("chatData", updatedDataString);

    input.current.value = "";
    chat(text, '', false, false)
    // }
  };

  return (
    <>
      {!isMobile && (
        <div className="chat-icon bg-opacity-50 bg-white backdrop-blur-md">
          <QuestionAnswer style={{ color: '#652c9a' }} />
          <h1>Chats</h1>
        </div>
      )}
      <div ref={chatRef} style={{ overflowY: 'scroll', maxHeight: '35rem', direction: 'rtl' }} className="chat-container">
        {chatData[0]?.map((chat, index) => (
          <ChatMessage
            key={index}
            userName={chat.userName}
            time={chat.time}
            text={chat.text}
            userProfile={chat.userImg}
          />
        ))}
        <div
          style={{
            display: sessionStorage.getItem('rasaButtons')
              ? 'flex'
              : 'none'
          }}
          className="chat-buttons"
        >
          {sessionStorage.getItem('currentService') === 'health' && (rasaButtons.map((item, index) => (
            <button
              key={index}
              style={{
                filter: avatarLoader || item.title.includes('$hidden') ? 'opacity(0.5)' : 'none'
              }}
              disabled={avatarLoader || item.title.includes('$hidden')}
              onClick={() => { handleServices(item.title, item.payload) }}
              className={`rasa-rb-button`}
            >
              <span className="rasa-button-text">{item.title.replace('$hidden', '')}</span>
            </button>
          )))}
          {sessionStorage.getItem('currentService') === 'health' &&
            sessionStorage.getItem('allowTextBox') === 'yes' && (
              <>
                <input
                  disabled={avatarLoader}
                  className={`user-input-sb placeholder:text-gray-800 placeholder:italic bg-opacity-50 bg-white backdrop-blur-md ${avatarLoader ? "cursor-not-allowed opacity-30" : ""}`}
                  placeholder="Self-describe here..."
                  style={{
                    border: 'none',
                    outline: 'none'
                  }}
                  ref={input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendRasaInputMessage();
                    }
                  }}
                />
                <button
                  disabled={avatarLoader}
                  onClick={sendRasaInputMessage}
                  id="send-button-input-sd"
                  className={`bg-purple-500 hover:bg-purple-600 rounded-md ${avatarLoader ? "cursor-not-allowed opacity-30" : ""
                    }`}
                >
                  <Send style={{ color: '#fff', height: '30px', width: '30px' }} />
                </button>
              </>
            )}
          <a
            style={{ visibility: 'hidden' }}
            id="new-session-anchor"
            href={newTabUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
          </a>
        </div>
      </div>
    </>
  );
};

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const input2 = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showChangAvTooltip, setShowChangAvTooltip] = useState(false);
  const [showGoHomeTooltip, setShowGoHomeTooltip] = useState(false);
  const [showAudioOnOffTooltip, setAudioOnOffTooltip] = useState(false);
  const [isAvatarAudioOn, setIsAvatarAudioOn] = useState(false);
  const [showServiceTooltip, setShowServiceTooltip] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emptyDataForWlcMsg, setEmptyDataForWlcMsg] = useState([]);
  const recognition = useRef(null);
  const [serviceBtnTtipName, setServiceBtnTtipName] = useState('');
  const [ttipPop, setTtipPop] = useState('');
  const [selectedPage, setSelectedPage] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isUserMobile, setUserMobile] = useState(window.matchMedia("(max-width: 768px)").matches);
  let speechTimeout = null;

  const {
    chat,
    setPlayWelcomeChat,
    loading,
    message,
    isBlurred,
    setIsBlurred,
    errorMessage,
    setErrorMessage,
    avatarSelected,
    setAvatarSelected,
    buttonState,
    setButtonState,
    setRasaButtons,
    showAvatarSelection,
    setShowAvatarSelection,
    audio,
    setLoading,
    setMessage,
    setLipsync,
    onMessagePlayed,
    handleClick,
    audioAutoPlay,
    avatarLoader,
    isMobile,
    downloading,
    downloadChatSummary,
    loaderSwal
  } = useChat();

  // useEffect(() => {
  //   sessionStorage.getItem('welcomed')
  //     ? document.querySelector('canvas').style.marginLeft = '15rem'
  //     : document.querySelector('canvas').style.marginLeft = '0'
  // }, [isBlurred])

  useEffect(() => {
    if (audioAutoPlay) {
      const getClickBtn = document.getElementsByClassName('audio-container-manual-click');
      for (let i = 0; i < getClickBtn.length; i++) {
        getClickBtn[i].click();
      }
    }
  }, [audioAutoPlay]);

  useEffect(() => {
    sessionStorage.getItem('avatarAudio') === 'on'
      ? setIsAvatarAudioOn(true)
      : setIsAvatarAudioOn(false)
  }, [isAvatarAudioOn])

  useEffect(() => {
    document.getElementsByClassName('overall-ui').length > 0
      ? document.body.classList.add('hidden-overflow')
      : document.body.classList.remove('hidden-overflow')
  }, [])

  useEffect(() => {
    if (errorMessage != '') {
      toast.error(errorMessage, {
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
      setErrorMessage('');
      return;
    }
  }, [errorMessage])

  const sendMessage = () => {
    clearTimeout(speechTimeout);
    const text = input.current.value.trim();
    const text2 = input2.current.value;
    const rasaButton = sessionStorage.getItem('rasaButtons')
      ? JSON.parse(sessionStorage.getItem('rasaButtons'))
      : false

    const getcurrentServ = sessionStorage.getItem('currentService')
    const getSessionService = sessionStorage.getItem('currentService')
    let storedValidData;
    const storedDataString = sessionStorage.getItem("chatData");
    const storedEduDataString = sessionStorage.getItem("chatEduData");
    storedValidData = getSessionService === 'education'
      ? storedEduDataString : storedDataString
    const storedDataArray = storedValidData ? JSON.parse(storedValidData) : [];

    const getlast = storedDataArray[storedDataArray.length - 1]?.text[1]?.text

    const isIneedExperts = !rasaButton
      ? false
      : rasaButton.filter(titles => titles.title === 'I need experts')

    if (rasaButton.length > 0 && getcurrentServ === 'health' && !isIneedExperts.length > 0) {
      if (getlast?.includes('Your session has ended.')) {
        toast.error('Your session has ended, please start a new one!', {
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
        return;
      }
      if (!getlast?.includes('') || rasaButton.length > 0) {
        clearTimeout(speechTimeout);
        toast.error("Please choose any option on the chat!", {
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
        return;
      }
    }

    if (!text) {
      clearTimeout(speechTimeout);
      toast.error('Please enter some message!', {
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
      return;
    }

    if (buttonState || isListening) {
      handleAvatarAudio('chat')
    }

    if (!loading) {
      storedDataArray.push({
        userName: 'You',
        time: moment().format('hh:mm A'),
        text: [
          {
            text: text
          }
        ],
        userImg: '/src/assets/images/user.webp'
      });
      const updatedDataString = JSON.stringify(storedDataArray);

      getSessionService === 'education'
        ? sessionStorage.setItem("chatEduData", updatedDataString)
        : sessionStorage.setItem("chatData", updatedDataString);

      if (recognition.current) {
        recognition.current.stop();
      }
      input.current.value = "";
      chat(text, text2, false, false)
      input.current.focus();
    }
  };

  const handleStartConversation = () => {
    sessionStorage.setItem('welcomed', true)
    sessionStorage.setItem('currentService', 'health')
    sessionStorage.setItem('allowTextBox', 'no')
    sessionStorage.setItem('question', null)
    setButtonState(true)
    const storedDataArray = [];
    storedDataArray.push({
      userName: 'Avatar',
      time: moment().format('hh:mm A'),
      text: [
        {
          text: 'Enhance your health understanding with our specialized education service.'
        }
      ],
      userImg: `/src/assets/images/${sessionStorage.getItem('avatarSelected')}.webp`
    });
    const updatedDataStringEdu = JSON.stringify(storedDataArray);
    sessionStorage.setItem("chatEduData", updatedDataStringEdu)

    const comingSoon = [{
      userName: 'Avatar',
      time: moment().format('hh:mm A'),
      text: [
        {
          text: 'Coming Soon!'
        }
      ],
      userImg: `/src/assets/images/${sessionStorage.getItem('avatarSelected')}.webp`
    }]
    sessionStorage.setItem('chatServData', JSON.stringify(comingSoon))
    sessionStorage.setItem('sender_id', `RHF-${new Date().getTime()}`)
    setIsBlurred(false);
    setPlayWelcomeChat('play')
    emptyDataForWlcMsg.push({
      userName: 'Avatar',
      time: moment().format('hh:mm A'),
      text: [
        {
          text: "Hello! I'm an avatar in the learning process. I'll do my best to assist you with health-related questions. Please note that I'm not a doctor and can't provide diagnoses."
        },
        {
          text: " Furthermore, above the chat, you can click the book icon that allows you to learn about any health-related topics."
        },
        {
          text: "To help us better understand and support you, we kindly ask for some information about your gender identity and sexual orientation. Please answer the questions below to the extent you feel comfortable. All your responses will be kept anonymous, confidential and will only be used to tailor our services to our community's needs."
        }
      ],
      userImg: `/src/assets/images/${sessionStorage.getItem('avatarSelected')}.webp`
    });

    const updatedDataString = JSON.stringify(emptyDataForWlcMsg);
    sessionStorage.setItem('chatData', updatedDataString)
    const initialBtns = [
      {
        "title": "Dive into Questions",
        "payload": "/gender_info"
      },
      {
        "title": "Not My Comfort Zone",
        "payload": "/gender_info_denied"
      }
    ]
    const jsonButtons = JSON.stringify(initialBtns)
    sessionStorage.setItem('rasaButtons', jsonButtons || [])
    setRasaButtons(initialBtns || [])
  };

  const toggleListening = () => {
    if (!recognition.current) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';
      recognition.current.onresult = handleSpeechRecognitionResult;
      recognition.current.onend = () => setIsListening(false);
    }

    if (isListening) {
      clearTimeout(speechTimeout);
      input.current.value = "";
      console.log('current:', input.current.value);
      recognition.current.stop();
      setIsListening(false)
    } else {
      console.log('starting');
      recognition.current.start();
      setIsListening(true);
    }
  };

  const handleSpeechRecognitionResult = (event) => {
    console.log('stopped');
    clearTimeout(speechTimeout);

    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join('');

    input.current.value = transcript;
    setButtonState(false);

    speechTimeout = setTimeout(() => {
      if (input.current.value !== "") {
        sendMessage();
      }
      input.current.value = "";
      recognition.current.stop();
    }, 2000);

    console.log('recognition:', recognition.current);
    console.log('transcript:', transcript);
  };

  const handlePageClick = (pageNumber) => {
    setSelectedPage(pageNumber);
    if (pageNumber === 1) {
      sessionStorage.setItem('currentService', 'health')
    } else if (pageNumber == 2) {
      sessionStorage.setItem('currentService', 'education')
      const educationStarted = sessionStorage.getItem('education')
      if (!educationStarted || educationStarted !== 'started') {
        sessionStorage.setItem('education', 'started')
        // setPlayWelcomeChat('play-education')
      }
    } else {
      sessionStorage.setItem('currentService', 'services')
    }
  };

  const hanldeMouseEnter = (entered, num) => {
    num === 1
      ? setServiceBtnTtipName('Health')
      : num === 2
        ? setServiceBtnTtipName('Education')
        : setServiceBtnTtipName('Services');

    num === 1
      ? setTtipPop('12px')
      : num === 2
        ? setTtipPop('55px')
        : setTtipPop('120px');

    entered ? setShowServiceTooltip(true) : setShowServiceTooltip(false)
    const imgElement = document.querySelector(`.service-icon-img${num}`);
    entered
      ? imgElement.style.width = '27px'
      : imgElement.style.width = '24px'
  }
  const handleMouseEnterVideo = (event) => {
    if (!isMobile) {
      event.target.play();
    }
  };

  const handleMouseLeaveVideo = (event) => {
    event.target.pause();
    event.target.currentTime = 0;
  };

  const clearCookies = () => {
    const cookies = document.cookie.split("; ");
    for (let c = 0; c < cookies.length; c++) {
      const d = window.location.hostname.split(".");
      while (d.length > 0) {
        const cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
        const p = location.pathname.split('/');
        document.cookie = cookieBase + '/';
        while (p.length > 0) {
          document.cookie = cookieBase + p.join('/');
          p.pop();
        };
        d.shift();
      }
    }
  }

  const handleClearAllData = async (avatar) => {
    clearCookies()
    sessionStorage.clear()
    localStorage.clear()
    sessionStorage.setItem('avatarSelected', avatar);
    sessionStorage.setItem('avatarAudio', 'on');
  }

  const handleAvatarSelection = (avatar, avatSelection) => {
    if (avatar === 'none') {
      setShowAvatarSelection(true)
    } else {
      if (avatSelection) {
        Swal.fire({
          title: "Download the chat before its lost! or you can continue.",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Download & Change Avatar",
          confirmButtonColor: "#a855f7",
          denyButtonText: `Change Avatar`,
          denyButtonColor: '#4CAF50'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const inputOptions = new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  "Health": "Health",
                  "Education": "Education",
                  "Both": "Both"
                });
              }, 1000);
            });
            const { value: chat } = await Swal.fire({
              title: "Select chat",
              input: "radio",
              inputOptions,
              inputValidator: (value) => {
                if (!value) {
                  return "You need to choose something!";
                }
              }
            });
            if (chat) {
              if (chat === 'Health') {
                await loaderSwal('Downloading...')
                try {
                  await downloadChatSummary('Health');
                  await handleClearAllData(avatar);
                } finally {
                  Swal.hideLoading();
                  Swal.close();
                  await loaderSwal('Changing Avatar...')

                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              } else if (chat === 'Education') {
                await loaderSwal('Downloading...')
                try {
                  await downloadChatSummary('Education');
                  await handleClearAllData(avatar);
                } finally {
                  Swal.hideLoading();
                  Swal.close();
                  await loaderSwal('Changing Avatar...')

                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              } else {
                await loaderSwal('Downloading...')
                try {
                  await downloadChatSummary('Both');
                  await handleClearAllData(avatar);
                } finally {
                  Swal.hideLoading();
                  Swal.close();
                  await loaderSwal('Changing Avatar...')

                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              };
            }
          } else if (result.isDenied) {
            await loaderSwal('Changing Avatar...')
            handleClearAllData();
            sessionStorage.setItem('avatarSelected', avatar);
            sessionStorage.setItem('avatarAudio', 'on');
            window.location.reload()
          }
        });

        const getSwalPopUp = document.getElementsByClassName('swal2-popup');

        if (getSwalPopUp.length > 0 && !isMobile) {
          for (let i = 0; i < getSwalPopUp.length; i++) {
            getSwalPopUp[i].style.width = '40%';
          }
        }
      } else {
        sessionStorage.setItem('avatarAudio', 'on')
        setIsAvatarAudioOn(true)
        sessionStorage.setItem('avatarSelected', avatar)
        setAvatarSelected(!avatarSelected)
      }
    }
  }

  useEffect(() => {
    setAvatarSelected(
      sessionStorage.getItem('avatarSelected') === 'avatar-one'
      || sessionStorage.getItem('avatarSelected') === 'avatar-two'
      || sessionStorage.getItem('avatarSelected') === 'avatar-three'
      || sessionStorage.getItem('avatarSelected') === 'avatar-four'
      || sessionStorage.getItem('avatarSelected') === 'avatar-five'
      || sessionStorage.getItem('avatarSelected') === 'avatar-six'
    )
  }, [avatarSelected])

  const handleHomePageRedirect = () => {
    window.location.href = homePageUrl
  }

  const handleAvatarAudio = (e) => {
    const newAudioState = isAvatarAudioOn ? 'off' : 'on';
    if (e === 'button') {
      sessionStorage.setItem('avatarAudio', newAudioState);
      setIsAvatarAudioOn(newAudioState === 'on');
    }
    if (newAudioState === 'off' || e === 'chat') {
      setMessage(false)
      setButtonState(false);
      setLoading(false);
      audio?.pause();
      onMessagePlayed();
      setLipsync(null);
      setIsAudioPlaying(false);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      {!isBlurred || sessionStorage.getItem('welcomed') != null ? (
        <div className={`overall-ui ${sessionStorage.getItem('avatarSelected')} top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none`}>
          <div className={`flex image-and-download-summary`}>
            <div className={`rainbow-logo w-52 self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg`}>
              <img src={logo} alt="Rainbow Health Finder Logo" />
            </div>
            <div className="w-full sum-download-avatar-ctnr flex items-end justify-end">
              <div className="w-full download-summary flex flex-row items-end justify-end gap-4">
                <div
                  className={`tooltip-left ${showTooltip ? 'tooltip-visible' : ''}`}
                  style={{
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Sans-serif"
                    }}
                  >Download Summary</p>
                </div>
                <button
                  disabled={downloading}
                  className="pointer-events-auto chat-summary-button bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                  style={{
                    zIndex: '1'
                  }}
                  onClick={() => downloadChatSummary('none')}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {downloading ? (
                    <img src={gifIcon} alt="download" style={{
                      width: '35px'
                    }} />
                  ) : (
                    <Download />
                  )}
                </button>
              </div>
              <div className="w-full download-summary flex flex-row items-end justify-end gap-4">
                <div
                  className={`tooltip-left ${showChangAvTooltip ? 'tooltip-visible' : ''}`}
                  style={{
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Sans-serif"
                    }}
                  >Change Avatar</p>
                </div>
                <button
                  disabled={downloading}
                  className="pointer-events-auto change-avatar-btn bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                  style={{
                    zIndex: '1'
                  }}
                  onClick={() => handleAvatarSelection('none', false)}
                  onMouseEnter={() => setShowChangAvTooltip(true)}
                  onMouseLeave={() => setShowChangAvTooltip(false)}
                >
                  <Man2 />
                </button>
              </div>
              <div className="w-full home-page-btn flex flex-row items-end justify-end gap-4">
                <div
                  className={`tooltip-left ${showGoHomeTooltip ? 'tooltip-visible' : ''}`}
                  style={{
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Sans-serif"
                    }}
                  >Go To Home Page</p>
                </div>
                <button
                  disabled={downloading}
                  className="pointer-events-auto homepage-button bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                  style={{
                    zIndex: '1'
                  }}
                  onClick={handleHomePageRedirect}
                  onMouseEnter={() => setShowGoHomeTooltip(true)}
                  onMouseLeave={() => setShowGoHomeTooltip(false)}
                >
                  <Home />
                </button>
              </div>
              <div className="w-full home-page-btn avatar-audio-btn flex flex-row items-end justify-end gap-4">
                <div
                  className={`tooltip-left ${showAudioOnOffTooltip ? 'tooltip-visible' : ''}`}
                  style={{
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Sans-serif"
                    }}
                  >{
                      isAvatarAudioOn
                        ? 'Turn Off Avatar'
                        : 'Turn On Avatar'
                    }
                  </p>
                </div>
                <button
                  className={`${isAvatarAudioOn && buttonState && !avatarLoader ? 'shake-animation' : ''} voice-onoff-btn pointer-events-auto bg-purple-500 hover:bg-purple-600 text-white rounded-md`}
                  onClick={() => handleAvatarAudio('button')}
                  onMouseEnter={() => setAudioOnOffTooltip(true)}
                  onMouseLeave={() => setAudioOnOffTooltip(false)}
                >
                  {
                    isAvatarAudioOn ? (
                      <SpatialAudioOff />
                      // <img src={voiceOverOn} alt="voice" style={{ filter: 'brightness(0.5) invert(1)', padding: '4px', width: '35px' }} />
                    ) : (
                      <img src={voiceOverOff} alt="voice" style={{
                        filter: 'brightness(0.5) invert(1)', width: '25px', height: '25px', display: 'inline-block'
                      }} />
                    )
                  }
                </button>
              </div>
            </div>
          </div>
          <div className="button-sec">
            <div style={{ position: 'relative' }} className={`service-btn-container flex ${loading || message || buttonState ? " cursor-not-allowed opacity-30 z-10" : ""}`}>
              <div
                className={`service-btn-tooltip ${showServiceTooltip ? 'service-btn-tooltip-visible' : ''}`}
                style={{
                  left: ttipPop,
                  padding: '3px',
                  width: 'fit-content',
                  borderRadius: '5px',
                  position: 'absolute',
                  backgroundColor: 'white',
                  bottom: '100%',
                  marginBottom: '5px'
                }}
              >
                <p
                  style={{
                    fontFamily: "Sans-serif"
                  }}
                >{serviceBtnTtipName}</p>
              </div>
              <div
                style={{
                  gap: '0',
                }}
                className="rainbow-button-cont flex"
              >
                <button
                  disabled={loading || message || buttonState}
                  onMouseEnter={() => hanldeMouseEnter(true, 1)}
                  onMouseLeave={() => hanldeMouseEnter(false, 1)}
                  onClick={() => handlePageClick(1)}
                  className={`rainbow-button rounded-e-sm pl-1 py-0.5`}
                >
                  <div
                    className={`static-bg  ${sessionStorage.getItem('currentService') === 'health'
                      ? 'selected-service'
                      : ''} rounded-ss-xl`}
                  >
                    <HealthAndSafety className="service-icon-img1" style={{ color: '#fff' }} />
                  </div>
                </button>
                <button
                  disabled={loading || message || buttonState}
                  onMouseEnter={() => hanldeMouseEnter(true, 2)}
                  onMouseLeave={() => hanldeMouseEnter(false, 2)}
                  onClick={() => handlePageClick(2)}
                  className={`rainbow-button rounded-s-md`}
                >
                  <div
                    className={`static-bg ${sessionStorage.getItem('currentService') === 'education'
                      ? 'selected-service'
                      : ''} rounded-se-xl`}
                  >
                    <AutoStories className="service-icon-img2" style={{ color: '#fff' }} />
                  </div>
                </button>
              </div>
            </div>
            <div className="Expand-btn">
              <button className="expan-btn" onClick={() => { document.body.classList.add('open-chat') }}>Hide avatar</button>
              <button onClick={() => { document.body.classList.remove('open-chat') }} className="close-icon">show avatar</button>
            </div>
          </div>
          <div className={`flex message-list-and-input`}>
            <div className="avatar-main">
              <div className="canvas-div">
                {loading && (
                  <div
                    style={{
                      bottom: sessionStorage.getItem('avatarSelected') === 'avatar-two'
                        ? '4rem'
                        : sessionStorage.getItem('avatarSelected') === 'avatar-one'
                          ? '9.5rem'
                          : sessionStorage.getItem('avatarSelected') === 'avatar-three'
                            ? '4rem'
                            : sessionStorage.getItem('avatarSelected') === 'avatar-four'
                              ? '9rem'
                              : sessionStorage.getItem('avatarSelected') === 'avatar-five'
                                ? '9rem'
                                : '1.5rem'
                    }}
                    className="chat-loader"
                  >
                    <img className="chat-loader-gif" src={chatLoaderGif} alt="chat loader" />
                  </div>
                )}
                {avatarLoader && (
                  <AvatarLoaderComp />
                )}
                <Canvas
                  className="chat-avatar"
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: -1
                  }}
                  shadows camera={{ position: [0, 0, 1], fov: 30 }}
                >
                  {avatarSelected && (
                    <Experience />
                  )}
                </Canvas>
                <div className="flex avatar-input-sec">
                  {!isUserMobile && (
                    <div className="flex avatar-chat-input input-message items-center pointer-events-auto max-w-screen-sm mx-auto">
                      <input
                        className={`user-input placeholder:text-gray-800 placeholder:italic bg-opacity-50 bg-white backdrop-blur-md ${loading || isListening ? "cursor-not-allowed opacity-30" : ""}`}
                        placeholder="Type a message..."
                        autoFocus={true}
                        style={{
                          border: 'none',
                          outline: 'none',
                          cursor: 'text',
                        }}
                        ref={input}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <button
                        disabled={loading}
                        onClick={toggleListening}
                        style={{
                          border: 'none',
                          outline: 'none'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            sendMessage();
                          }
                        }}
                        className={`${loading ? "cursor-not-allowed opacity-30" : ""} mic-button ${isListening ? 'listening' : ''}`}
                      >
                        <img className="backdrop-blur-md bg-white bg-opacity-50" src={isListening ? micIconGif : micIcon} alt="mic" />
                      </button>
                      <button
                        disabled={loading}
                        onClick={sendMessage}
                        id="send-button"
                        className={`bg-purple-500 hover:bg-purple-600 p-4 px-10 rounded-md ${loading ? "cursor-not-allowed opacity-30" : ""
                          }`}
                      >
                        <Send style={{ color: '#fff', height: '30px', width: '30px' }} />
                      </button>
                      <input
                        hidden
                        id="character-gender"
                        ref={input2}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="avatar-chat-cont">
                <div
                  style={{ display: 'none' }}
                  className="audio-container pointer-events-auto"
                >
                  <button
                    className="audio-container-manual-click border-2 border-green-700 bg-green-500 text-white rounded-md px-4 py-2 text-center"
                    onClick={handleClick}
                  >
                    Play ▶
                  </button>
                  <audio id="audio-element" controls>
                    <source src={audioAutoPlay} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <Chat chatData={[
                  sessionStorage.getItem('currentService') === 'education'
                    ? JSON.parse(sessionStorage.getItem('chatEduData'))
                    : sessionStorage.getItem('currentService') === 'services'
                      ? JSON.parse(sessionStorage.getItem('chatServData'))
                      : JSON.parse(sessionStorage.getItem('chatData')),
                  loading, message, buttonState]}
                  handleAvatarAudio={handleAvatarAudio}
                />
                {isUserMobile && (
                  <div className="flex avatar-chat-input input-message items-center pointer-events-auto max-w-screen-sm mx-auto">
                    <input
                      className={`user-input placeholder:text-gray-800 placeholder:italic bg-opacity-50 bg-white backdrop-blur-md ${loading ? "cursor-not-allowed opacity-30" : ""}`}
                      placeholder="Type a message..."
                      autoFocus={true}
                      style={{
                        border: 'none',
                        outline: 'none',
                        cursor: 'text',
                      }}
                      ref={input}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={toggleListening}
                      disabled={loading}
                      style={{
                        border: 'none',
                        outline: 'none'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      className={`${loading ? "cursor-not-allowed opacity-30" : ""} mic-button ${isListening ? 'listening' : ''}`}
                    >
                      <img className="backdrop-blur-md bg-white bg-opacity-50" src={isListening ? micIconGif : micIcon} alt="mic" />
                    </button>
                    <button
                      disabled={loading}
                      onClick={sendMessage}
                      id="send-button"
                      className={`bg-purple-500 hover:bg-purple-600 p-4 px-10 rounded-md ${loading ? "cursor-not-allowed opacity-30" : ""
                        }`}
                    >
                      <Send style={{ color: '#fff', height: '30px', width: '30px' }} />
                    </button>
                    <input
                      hidden
                      id="character-gender"
                      ref={input2}
                    />
                  </div>
                )}
              </div>
              <a
                style={{ visibility: 'hidden' }}
                id="new-session-anchor-2"
                href={newTabUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>
            </div>
          </div>
        </div >
      ) : (
        <AvatarSelection
          handleAvatarSelection={handleAvatarSelection}
          avatarSelected={avatarSelected}
          handleStartConversation={handleStartConversation}
          loading={loading}
          message={message}
          handleMouseEnterVideo={handleMouseEnterVideo}
          handleMouseLeaveVideo={handleMouseLeaveVideo}
        />
      )}
      {
        showAvatarSelection && (
          <AvatarSelection
            setShowAvatarSelection={setShowAvatarSelection}
            showAvatarSelection={showAvatarSelection}
            handleAvatarSelection={handleAvatarSelection}
            avatarSelected={avatarSelected}
            handleStartConversation={handleStartConversation}
            setAvatarSelected={setAvatarSelected}
            loading={loading}
            message={message}
            handleMouseEnterVideo={handleMouseEnterVideo}
            handleMouseLeaveVideo={handleMouseLeaveVideo}
          />
        )
      }
    </>
  );
};
