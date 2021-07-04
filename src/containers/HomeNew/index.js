import React, { useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "./App.scss";
import { setCurrentAuction } from "../../store/action";
import moment from "moment";
import NavBar from "../../components/NavBar";
import SideMenu from "../../components/SideMenu";
import AuctionInfoDiv from "../../components/AuctionInfoDiv";
import Orders from "../../components/Orders";
import { useSelector, useDispatch } from "react-redux";
import * as utils from "../../utils";
import { Button, InputNumber, message } from "antd";
import * as constants from "../../constants";
import Players from "../../components/Players";
import * as action from "../../store/action";
import queryString from "query-string";
import { Link } from "react-router-dom";
const client = new W3CWebSocket("ws://auc-websocket.herokuapp.com/");
function App(props) {
    const rightNow = new Date();
    const [currentTime, setCurrentTime] = React.useState("-");

    const [timerNow, setTimerNow] = React.useState(rightNow);
    const [testData, setTestData] = React.useState(rightNow);
    const [myDeduct, setMyDeduct] = React.useState(0);
    const [isClosed, setIsClosed] = useState(false);
    const current_auction_data = useSelector((state) => state.currentAuction);
    const showMenu = useSelector((state) => state.showMenu);
    const isLogin = useSelector((state) => state.isLogin);
    const dispatch = useDispatch();
    React.useEffect(() => {
        QueryParamsDemo();
    }, [props]);
    React.useEffect(() => {
        console.log("current_auction_data", current_auction_data);
      //   if (current_auction_data) {
      //       startingTimer(current_auction_data);
      //   }
    }, [current_auction_data]);
    React.useEffect(() => {
      client.onopen = () => {
          console.log("WebSocket Client Connected");
      };
      client.onmessage = (message) => {
          console.log("response msg: ", message);
          const resObj = JSON.parse(message.data);
          if (resObj.type === "time") {
              setCurrentTime(resObj.left_time);
          }
          // const dataFromServer = JSON.parse(message.data);
          // const stateToChange = {};
          // if (dataFromServer.type === "userevent") {
          //     stateToChange.currentUsers = Object.values(dataFromServer.data.users);
          // } else if (dataFromServer.type === "contentchange") {
          //     stateToChange.text = dataFromServer.data.editorContent;
          // }
          // stateToChange.userActivity = dataFromServer.data.userActivity;
          // console.log("stateToChange", stateToChange);
          // setTestData(stateToChange);
      };
  }, []);
    const waitForConnection = function (callback) {
       console.log("waitForConnection")
        if (client.readyState === 1) {
            callback();
        } else {
            console.log("Error", client.readyState);
            // var that = this;
            // // optional: implement backoff for interval here
            // setTimeout(function () {
            //     that.waitForConnection(callback, interval);
            // }, interval);
        }
    };

    const sendingOut = function (message) {
        waitForConnection(function () {
            client.send(message);
            if (typeof callback !== "undefined") {
            }
        });
    };
   
    const sendBroadcast = (res) => {
        console.log("sendBroadcast", res);
        sendingOut(
         JSON.stringify({
             isBroadcast: true,
             type: "time",
             //  left_time: res,
             no: QueryParamsDemo(),
         })
     );
    };
    React.useEffect(() => {
        client.onopen = () => {
            console.log("WebSocket Client Connected");
        };
        client.onmessage = (message) => {
            console.log("response msg: ", message);
            // const dataFromServer = JSON.parse(message.data);
            // const stateToChange = {};
            // if (dataFromServer.type === "userevent") {
            //     stateToChange.currentUsers = Object.values(dataFromServer.data.users);
            // } else if (dataFromServer.type === "contentchange") {
            //     stateToChange.text = dataFromServer.data.editorContent;
            // }
            // stateToChange.userActivity = dataFromServer.data.userActivity;
            // console.log("stateToChange", stateToChange);
            // setTestData(stateToChange);
        };
    }, []);
    function QueryParamsDemo() {
        let query = queryString.parse(props.location.search);
        retrieveAuction(query.no);
        return query.no;
    }
    const retrieveAuction = async (no) => {
        if (!no) return;
        const a = await utils.getAuction(no);
        if (a) {
            dispatch(setCurrentAuction(a));
        }
    };
    const handleAuction = (cmd, c) => {
        let res;
        switch (cmd) {
            case "start":
               //  updateWithCountDown();
                sendBroadcast();
                res = utils.startAuction(current_auction_data.no);
                break;
            case "close":
                console.log("已經關了");
                setIsClosed(true);
                res = utils.closeAuction(current_auction_data.no);
                break;
            case "updateWithCountDown":
                updateWithCountDown();
                break;
        }

      //   res.then((data) => {
      //       if (data) {
      //           dispatch(action.setCurrentAuction(data));
      //       }
      //   });
    };
    
    function updateWithCountDown() {
      //   setTimeout(function () {
            const res = utils.getAuction(current_auction_data.no);
            res.then((data) => {
                if (data) {
                    dispatch(action.setCurrentAuction(data));
                    if (!data.close_time) {
                        updateWithCountDown();
                    }
                }
            });
      //   }, 1000);
    }
    const handleDeductPrice = async () => {
        if (current_auction_data.current_price - myDeduct < 0) {
            message.success(`Current price - deduction is less than 0`);
            return;
        }
        if (myDeduct === 0) {
            return;
        }
        const res = await utils.deductAuction(current_auction_data.no, myDeduct);
        if (res.status >= 400) {
            message.warning(res.message);
            return;
        }
        message.success(`Current price is ${res.current_price}`);
    };
    return (
        <div className="App">
            <NavBar />
            <div className="container">
                {showMenu ? <SideMenu /> : null}
                {!isLogin ? (
                    <div className="remider">Please login</div>
                ) : (
                    <div className="auctionBlock">
                        <div className="start_btn">
                            <Button
                                type="primary"
                                onClick={() => {
                                    handleAuction("start");
                                }}
                            >
                                Start
                            </Button>
                            <Button
                                onClick={() => {
                                    handleAuction("close");
                                }}
                            >
                                Close
                            </Button>
                             <Link to={`/presentation?no=${current_auction_data.no}`} target="_blank">
                                    Presentation
                            </Link>
                        </div>
                        <AuctionInfoDiv data={current_auction_data} />
                        {current_auction_data.auc_type === constants.AUC_TYPE.DUTCH && !current_auction_data.is_auto ? (
                            <div className="myOrder">
                                <InputNumber onChange={(v) => setMyDeduct(v)} value={myDeduct} />
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        handleDeductPrice();
                                    }}
                                >
                                    DEDUCT
                                </Button>
                                <Button
                                    onClick={() => {
                                        setMyDeduct(0);
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        ) : null}
                        <Orders
                            data={current_auction_data.orders}
                            hasWinner={current_auction_data.close_time}
                            chooseSecond={current_auction_data.auc_type === constants.AUC_TYPE.SEALED2}
                            reservationPrice={current_auction_data.reservation_price || 0}
                        />
                        <Players data={current_auction_data.players} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
