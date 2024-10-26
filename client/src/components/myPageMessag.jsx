import React, { useState, useEffect } from "react";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../style/MainPage.css";
import { useContext } from "react";
import { UserContext } from "./Login";

const socket = socketIOClient("http://localhost:7000");

const MyPage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [dataMessage, setDataMessage] = useState([]);
  const [textSearch, setTextSearch] = useState("");
  const [visible, setVisible] = useState(true);
  const [newUser, setNewUser] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [friendId, setFriendId] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const location = useLocation();
  const search = location.search;
  const token = localStorage.getItem("userId");
  const navigate = useNavigate();
  const stateUserId = useContext(UserContext);
  const [chatVisible, setChatVisible] = useState(false);

  const handleMessage = (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const authToken = searchParams.get("authToken");
    console.log(searchParams);
    console.log(authToken);

    if (authToken) {
      // Выполнить запрос на сервер для проверки аутентификации пользователя
      axios
        .post("http://localhost:7000/api/check-auth", { authToken })
        .then((response) => {
          const userId = response.data.userId;

          console.log(userId);
          if (userId) {
            // Перенаправление на страницу пользователя
            navigate(`/user/${userId}`);
          } else {
            console.error(
              "Ошибка: Не удалось получить идентификатор пользователя."
            );
          }
        })
        .catch((error) => {
          console.error(
            "Ошибка при проверке аутентификации пользователя:",
            error
          );
        });
    }
  }, [search, navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.delete("http://localhost:7000/api/logout", {
        withCredentials: true,
      });
      console.log("Выход выполнен успешно: ", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  const sendMess = () => {
    const data = {
      userId: id,
      friendId: friendId,
      message: message,
    };

    setDataMessage([...dataMessage, { senderId: id, content: message }]);

    socket.emit("message", data);

    setMessage(""); // Очистка текста в поле ввода после отправки сообщения
  };

  const openChat = async (friend) => {
    setFriendId(friend.userId);
    setChatVisible(true);

    const friendId = friend.userId;
    console.log("friendId: " + friendId);
    console.log("id: " + id);

    socket.emit("join", { userId: id, friendId: friendId });

    socket.on("receiveMessage", (data) => {
      // Обработчик события приема сообщения
      setReceivedMessages([...receivedMessages, data]); // Добавление принятого сообщения в список
      if (data.senderId !== id) {
        setDataMessage((prevDataMessage) => [...prevDataMessage, data]);
      }
    });

    console.log(receivedMessages);

    try {
      const messageData = await axios.post(
        "http://localhost:7000/api/get-messange",
        {
          friendId,
          userId: id,
        }
      );

      console.log(messageData.data);

      setDataMessage(messageData.data);
    } catch (error) {
      console.log(error);
    }

    return () => {
      socket.off("receiveMessage");
    };
  };

  const handleVisible = () => {
    setVisible(true);
  };

  const handleHide = () => {
    setVisible(false);
  };

  const saveUser = async (friendId) => {
    try {
      console.log("friendId:", friendId);
      await axios.post(`http://localhost:7000/api/save-chats`, {
        friendId,
        id,
      });
      setNewUser([]);
    } catch (error) {
      console.log(error);
    }
  };

  const getSearchUser = async () => {
    if (
      !textSearch ||
      (Array.isArray(newUser) &&
        newUser.some((user) => user.userName === textSearch))
    ) {
      return;
    }

    try {
      console.log("textSearch: ", textSearch);
      const response = await axios.get(
        `http://localhost:7000/api/search-user/${id}`,
        {
          params: {
            textSearch,
          },
        }
      );

      const currentDate = new Date();
      const dataNewUser = {
        userName: response.data.userName,
        userId: response.data.userId,
        isOnline:
          currentDate.toLocaleDateString() +
          " " +
          currentDate.toLocaleTimeString(),
      };

      console.log("dataNewUser: ", dataNewUser);

      setNewUser([...newUser, dataNewUser]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (typeof friendsLoaded === "boolean" && !friendsLoaded) {
      const fetchData = async () => {
        try {
          console.log("Вот: ", id);
          const response = await axios.get(
            `http://localhost:7000/api/get-frend/${id}`
          );

          if (
            response.data &&
            typeof response.data === "object" &&
            response.data.myFriends
          ) {
            const myFriends = response.data.myFriends;
            const updatedFriends = myFriends.map((friend) => ({
              userName: friend.userName,
              userId: friend.userId,
            }));

            console.log("updatedFriends", updatedFriends);
            setFriendsData(updatedFriends);
            setFriendsLoaded(true);
          } else {
            console.error("No friends found");
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    }
  }, []);

  return (
    <div className="container-my-chats">
      <div className="chatsUsers">
        <button onClick={handleVisible} className="backSvg">
          <svg
            width="2vw"
            height="2vw"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.66088 8.53078C9.95402 8.23813 9.95442 7.76326 9.66178 7.47012C9.36913 7.17698 8.89426 7.17658 8.60112 7.46922L9.66088 8.53078ZM4.47012 11.5932C4.17698 11.8859 4.17658 12.3607 4.46922 12.6539C4.76187 12.947 5.23674 12.9474 5.52988 12.6548L4.47012 11.5932ZM5.51318 11.5771C5.21111 11.2936 4.73648 11.3088 4.45306 11.6108C4.16964 11.9129 4.18475 12.3875 4.48682 12.6709L5.51318 11.5771ZM8.61782 16.5469C8.91989 16.8304 9.39452 16.8152 9.67794 16.5132C9.96136 16.2111 9.94625 15.7365 9.64418 15.4531L8.61782 16.5469ZM5 11.374C4.58579 11.374 4.25 11.7098 4.25 12.124C4.25 12.5382 4.58579 12.874 5 12.874V11.374ZM15.37 12.124V12.874L15.3723 12.874L15.37 12.124ZM17.9326 13.1766L18.4614 12.6447V12.6447L17.9326 13.1766ZM18.25 15.7351C18.2511 16.1493 18.5879 16.4841 19.0021 16.483C19.4163 16.4819 19.7511 16.1451 19.75 15.7309L18.25 15.7351ZM8.60112 7.46922L4.47012 11.5932L5.52988 12.6548L9.66088 8.53078L8.60112 7.46922ZM4.48682 12.6709L8.61782 16.5469L9.64418 15.4531L5.51318 11.5771L4.48682 12.6709ZM5 12.874H15.37V11.374H5V12.874ZM15.3723 12.874C16.1333 12.8717 16.8641 13.1718 17.4038 13.7084L18.4614 12.6447C17.6395 11.8276 16.5267 11.3705 15.3677 11.374L15.3723 12.874ZM17.4038 13.7084C17.9435 14.245 18.2479 14.974 18.25 15.7351L19.75 15.7309C19.7468 14.572 19.2833 13.4618 18.4614 12.6447L17.4038 13.7084Z"
              fill="#000000"
            />
          </svg>
        </button>

        <div className="main-search-container">
          <input
            onClick={handleHide}
            onChange={(e) => setTextSearch(e.target.value)}
            className="inp-search"
            type="text"
          />
          <button onClick={getSearchUser} className="but-search">
            Найти
          </button>
        </div>

        {visible ? (
          <div className="user-list">
            {friendsData.map((friend, index) => (
              <div
                key={index}
                onClick={() => openChat(friend)}
                className="block-chat"
              >
                <div className="info-chat">
                  <p className="name-user">{friend.userName}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="user-list">
            {newUser.map((chat, index) => (
              <div
                key={chat.userId}
                className="block-chat"
                onClick={() => saveUser(chat.userId)}
              >
                <div className="info-chat">
                  <p className="name-user">{chat.userName}</p>
                  <span className="activ">online</span>
                  <span className="activ">{chat.userId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatVisible && (
        <div className="MyChat">
          <div className="block-name">
            <h1>{"myName"}</h1>

            <div className="block_logout">
              <button onClick={handleLogout}>Выход</button>
            </div>
          </div>

          <div className="block-friend-mess"></div>

          {dataMessage.map((mess, index) => (
            <div
              key={index}
              className={
                mess.senderId === id ? "block-my-mess" : "block-frind-mess"
              }
            >
              {mess.content}
            </div>
          ))}

          <div className="block-write">
            <input id="messageInput" onChange={handleMessage} type="text" />
            <button onClick={sendMess}>Отправить</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
