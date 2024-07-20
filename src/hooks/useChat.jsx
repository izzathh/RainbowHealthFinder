import { createContext, useContext, useEffect, useState } from "react";
import moment from "moment"
import axios from 'axios'
import getStaticDbQns from '../assets/json/static-db-qns.json'
import Swal from 'sweetalert2'
import { Bounce, toast } from 'react-toastify';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const chatBotApi = import.meta.env.VITE_CHAT_BOT_API;
const rasaApi = import.meta.env.VITE_RASA_API;

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [playWelcomeChat, setPlayWelcomeChat] = useState(false);
  const storedDataString = sessionStorage.getItem("chatData");
  const storedDataArray = JSON.parse(storedDataString);
  const [isBlurred, setIsBlurred] = useState(true);
  const [errorMessage, setErrorMessage] = useState('')
  const [loadChat, setLoadChat] = useState(
    storedDataArray && storedDataArray.length != 0
      ? true
      : false
  );
  const [buttonState, setButtonState] = useState(false);
  const [showButton, setShowButton] = useState('')
  const [rasaButtons, setRasaButtons] = useState([])
  const [rasaInputs, setRasaInputs] = useState([])
  const [avatarSelected, setAvatarSelected] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [audio, setAudio] = useState(null);
  const [audioAutoPlay, setAudioAutoPlay] = useState(null);
  const [lipsync, setLipsync] = useState();
  const [lipsyncAuto, setLipsyncAuto] = useState();
  const [playErroredAudio, setPlayErroredAudio] = useState(false);
  const [avatarLoader, setAvatarLoader] = useState(true);
  const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 768px)").matches)
  const [downloading, setDownloading] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState('none');

  const loaderSwal = (title) => {
    console.log('new swal updated')
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  function capitalizeFirstLetter(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const downloadChatSummary = async (chatToDownload) => {
    let chatData
    const currentService = sessionStorage.getItem('currentService')
    if (chatToDownload === 'none') {
      chatData = currentService === 'health'
        ? sessionStorage.getItem('chatData')
        : sessionStorage.getItem('chatEduData')
    } else {
      chatData = chatToDownload === 'Health'
        ? sessionStorage.getItem('chatData')
        : sessionStorage.getItem('chatEduData')
    }


    try {
      if (!chatData) {
        toast.error(chatToDownload === 'none'
          ? 'Please have some conversation.'
          : 'Your education chat is empty', {
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
      }

      if (chatToDownload === 'Both') {
        const healthChat = sessionStorage.getItem('chatData');
        const educationChat = sessionStorage.getItem('chatEduData');
        const summaryDate = moment().format('DD/MM/YYYY');
        chatData = [
          { data: JSON.parse(healthChat), chatHeadingBoth: `Health Summary - ${summaryDate}` },
          { data: JSON.parse(educationChat), chatHeadingBoth: `Education Summary - ${summaryDate}` }
        ]
        chatData = JSON.stringify(chatData)
      }

      setDownloading(true)

      const serviceName = chatToDownload === 'none'
        ? currentService
        : chatToDownload

      const { data } = await axios.post(`${backendUrl}/generateChatPdf`, {
        data: chatData,
        serviceName: capitalizeFirstLetter(serviceName)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const uint8Array = new Uint8Array(data.pdfLocation.data);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const summaryDate = moment().format('DD/MM/YYYY');
      link.download = chatToDownload === 'none'
        ? `${currentService}-summary(${summaryDate})`
        : chatToDownload === 'Both'
          ? `health&education-summary(${summaryDate})`
          : `${chatToDownload.toLowerCase()}-summary(${summaryDate})`

      link.click();
      URL.revokeObjectURL(url);
      setDownloading(false)
      toast('Chat summary downloaded !', {
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
    } catch (error) {
      console.error('downloadChatSummary:', error);
    }
  }

  const chat = async (message, character, services, referrals, payload) => {
    try {
      const getSessionService = sessionStorage.getItem('currentService')
      if (services) {
        const storedDataString1 = sessionStorage.getItem("chatData");
        const storedDataArray1 = storedDataString1 ? JSON.parse(storedDataString1) : [];
        storedDataArray1.push({
          userName: 'You',
          time: moment().format('hh:mm A'),
          text: [
            {
              text: message
            }
          ],
          userImg: '/src/assets/images/user.webp'
        });
        const updatedDataString1 = JSON.stringify(storedDataArray1);
        sessionStorage.setItem("chatData", updatedDataString1);
      }
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "sender": sessionStorage.getItem('sender_id'),
        "message": services ? payload : message,
        "title": message,
        "metadata": {}
      });

      const raw2 = JSON.stringify({
        "question": message
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: getSessionService === 'education' ? raw2 : raw,
        redirect: "follow"
      };

      let dataJson;
      if (getSessionService === 'education') {
        const getData = await fetch(chatBotApi, requestOptions);
        dataJson = await getData.json()
      } else {
        const getData = await fetch(rasaApi, requestOptions);
        dataJson = await getData.json()
      }

      console.log('dataJson:', dataJson);
      if (!dataJson.length) {
        setErrorMessage('Rasa response is empty!')
        setLoading(false);
        return;
      }

      const modifiedPointsPara = dataJson.reduce((acc, obj) => {
        if (obj.text.includes("\n")) {
          const texts = obj.text.split("\n");
          texts.forEach(text => {
            acc.push({
              "recipient_id": obj.recipient_id,
              "text": '\n' + text.trim().split("$#*|")[0],
              "buttons": obj.buttons
            });
          });
        } else {
          acc.push({
            "recipient_id": obj.recipient_id,
            "text": obj.text.trim().split("$#*|")[0],
            "buttons": obj.buttons
          });
        }
        return acc;
      }, []);

      let storedValidData;
      const storedDataString = sessionStorage.getItem("chatData");
      const storedEduDataString = sessionStorage.getItem("chatEduData");
      storedValidData = getSessionService === 'education'
        ? storedEduDataString : storedDataString
      const storedDataArray = storedValidData ? JSON.parse(storedValidData) : [];

      storedDataArray.push({
        userName: 'Avatar',
        time: moment().format('hh:mm A'),
        text: modifiedPointsPara,
        userImg: `/src/assets/images/${sessionStorage.getItem('avatarSelected')}.webp`
      });

      const updatedDataString = JSON.stringify(storedDataArray);

      let formattedData = modifiedPointsPara.map(item => item.text).join('');

      const checkSurveyNum = dataJson[0].text.split('$#*|')[1]
      checkSurveyNum === '1' || checkSurveyNum === '3'
        ? sessionStorage.setItem('allowTextBox', 'yes')
        : sessionStorage.setItem('allowTextBox', 'no')

      const isStaticDbQn = getStaticDbQns.filter(qn => formattedData.trim() == qn.question)

      const sessQns = JSON.parse(sessionStorage.getItem('question'));

      (sessQns && sessQns[0]?.answered === 'no') && await saveChatData(sessQns[0], message);

      const storeData = isStaticDbQn.length > 0
        ? [{
          [isStaticDbQn[0].field]: isStaticDbQn[0].question,
          answered: 'no'
        }]
        : null;

      sessionStorage.setItem('question', JSON.stringify(storeData));

      if (sessionStorage.getItem('avatarAudio') === 'on') {
        const { data } = await axios.post(`${backendUrl}/chat`, {
          message: formattedData,
          surveyQns: dataJson[dataJson.length - 1]?.text.includes('$#*|')
            ? dataJson[dataJson.length - 1].text.split('$#*|')[1]
            : 0,
          avatar: sessionStorage.getItem('avatarSelected')
        })

        if (data.status == 0) {
          setErrorMessage(data.message)
          setLoading(false);
          return;
        }

        setMessages((messages) => [...messages, ...data.messages]);
      }

      if (getSessionService !== 'education') {
        const getRasaButtons = modifiedPointsPara.filter(data => data.buttons)
        const jsonButtons = JSON.stringify(getRasaButtons[0]?.buttons)
        sessionStorage.setItem('rasaButtons', jsonButtons || [])
        setRasaButtons(getRasaButtons[0]?.buttons || [])
      }

      const getlast = storedDataArray[storedDataArray.length - 1]?.text[1]?.text

      if (getlast?.includes('Your session has ended.')) {
        const restartBtn = [
          {
            "title": "Start a new conversation",
            "payload": "sessionRestart"
          }
        ]
        const jsonButtons = JSON.stringify(restartBtn)
        sessionStorage.setItem('rasaButtons', jsonButtons || [])
        setRasaButtons(restartBtn || [])
      }

      getSessionService === 'education'
        ? sessionStorage.setItem("chatEduData", updatedDataString)
        : sessionStorage.setItem("chatData", updatedDataString);

      if (
        dataJson[dataJson.length - 1]?.text.includes('$#*|')
        && dataJson[dataJson.length - 1]?.text.split('$#*|')[1] === 'download'
      ) {
        try {
          loaderSwal('Downloading...')
          await downloadChatSummary('none')
        } finally {
          Swal.hideLoading();
          Swal.close();
        }
      }

      setLoadChat(true)

      setLoading(false);
    } catch (error) {
      console.error('error:', error);
    }
  };

  const handleClick = () => {
    setPlayErroredAudio(true)
  };

  const saveChatData = async (sessQn, ans) => {
    try {
      const { data } = await axios.post(`${backendUrl}/save-chat`, {
        senderId: sessionStorage.getItem('sender_id'),
        avatarsName: sessionStorage.getItem('avatarSelected'),
        sessQn,
        ans
      })
      if (data.status === 0) {
        setErrorMessage(data.message)
        return;
      }
    } catch (error) {
      console.error('error:', error);
    }
  }

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        setMessage,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        setPlayWelcomeChat,
        playWelcomeChat,
        setLoading,
        loadChat,
        setLoadChat,
        isBlurred,
        setIsBlurred,
        errorMessage,
        setErrorMessage,
        showButton,
        setShowButton,
        rasaButtons,
        setRasaButtons,
        avatarSelected,
        setAvatarSelected,
        buttonState,
        setButtonState,
        showAvatarSelection,
        setShowAvatarSelection,
        audio,
        setAudio,
        lipsync,
        setLipsync,
        saveChatData,
        handleClick,
        audioAutoPlay,
        setAudioAutoPlay,
        lipsyncAuto,
        setLipsyncAuto,
        playErroredAudio,
        setPlayErroredAudio,
        avatarLoader,
        setAvatarLoader,
        isMobile,
        downloading,
        setDownloading,
        downloadChatSummary,
        loaderSwal,
        hoveredAvatar,
        setHoveredAvatar
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
