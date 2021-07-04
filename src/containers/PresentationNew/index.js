import React, { useState } from "react";
import "./App.scss";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as url from "../../Endpoint";
import AuctionInfoDiv from "../../components/AuctionInfoDiv";
import * as constants from "../../constants";
import Orders from "../../components/Orders";
import { Form, Input, Button, message, InputNumber, Switch } from "antd";
import * as utils from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import InvitationHeader from "../../components/InvitationHeader";
import TypeBanner from "../../components/TypeBanner";
import queryString from "query-string";
import moment from "moment";
import { setPlayerData } from "../../store/action";
const client = new W3CWebSocket("ws://auc-websocket.herokuapp.com/");

function App(props) {
    const rightNow = new Date();
    const [form] = Form.useForm();
    const [timerNow, setTimerNow] = React.useState(rightNow);
    const [currentTime, setCurrentTime] = React.useState("-");
    const [myPrice, setMyPrice] = React.useState(0);
    const [initValueNoShow, setInitValueNoShow] = React.useState(true);
    const playerData = useSelector((state) => state.playerData);
    const current_auction_data = useSelector((state) => state.currentAuction);
    const [leftValue, setLeftValue] = React.useState();
    const [playerAuctionData, setPlayerAuctionData] = React.useState({});
    const dispatch = useDispatch();
    React.useEffect(() => {
        QueryParamsDemo();
        updateWithCountDown();
    }, [props]);
    React.useEffect(() => {
        console.log("current_auction_data", current_auction_data);
        if (!initValueNoShow) {
            if (current_auction_data) {
                sendBroadcast(current_auction_data);
            }
        }
        //  }, [current_auction_data]);
    }, [initValueNoShow]);
    function QueryParamsDemo() {
        let query = queryString.parse(props.location.search);
        form.setFieldsValue({
            auctionNo: query.no,
        });
        return query.no;
    }

    //  function startingTimer(data) {
    //      console.log("startingTimer", data);
    //      const { period } = data;
    //      if (timerNow === null) {
    //          const date = new Date();
    //          setTimerNow(date);
    //      }
    //      console.log("timerNow", timerNow);
    //      const start = timerNow.getTime();
    //      const endDate = moment(timerNow).add(period, "minutes").toDate();
    //      const end = endDate.getTime();
    //      //   const leftTime = end - start;
    //      const leftTime = 5000;
    //      countDown(leftTime);
    //  }
    const waitForConnection = function (callback) {
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
            console.log("waitForConnection", message);

            client.send(message);
            // if (typeof callback !== "undefined") {
            //    //  callback();

            // }
        });
    };
    const sendBroadcast = () => {
        //   console.log("sendBroadcast", res);
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
    //  async function countDown(leftTime) {
    //      console.log("countDown", leftTime);

    //      let h, m, s;
    //      if (leftTime - 1000 >= 0) {
    //          h = Math.floor((leftTime / 1000 / 60 / 60) % 24);
    //          m = Math.floor((leftTime / 1000 / 60) % 60);
    //          s = Math.floor((leftTime / 1000) % 60);

    //          h = checkTime(h);
    //          m = checkTime(m);
    //          s = checkTime(s);

    //          function checkTime(i) {
    //              if (i < 10) {
    //                  i = "0" + i;
    //              }
    //              return i;
    //          }

    //          const res = `${m}:${s}`;
    //          sendBroadcast(res);
    //          // const newData = await updateAuction(data.id, { left_time: res });
    //          //  console.log(66666666,leftTime-1000 )

    //          setTimeout(function () {
    //              console.log("setTimeout", leftTime - 1000);
    //              countDown(leftTime - 1000);
    //          }, 1000);
    //      } else {
    //          console.log("closing!!!!Front-end");
    //      }
    //  }
    function updateWithCountDown() {
        setTimeout(function () {
            const res = utils.getAuction(QueryParamsDemo());
            res.then((data) => {
                if (data && data.status !== 401) {
                    setPlayerAuctionData(data);
                    //   console.log(77777,data)
                    if (data.auc_type === constants.AUC_TYPE.DUTCH) {
                        setMyPrice(data.current_price);
                    }
                    if (!data.close_time) {
                        updateWithCountDown();
                    }
                }
            });
        }, 1000);
    }
    return (
        <>
            <InvitationHeader />
            <div className="presentation">
                <div className="timer">
                    <div className="circle">{currentTime}</div>
                </div>
                <TypeBanner playerAuctionData={playerAuctionData} />
                <div className="currentPrice">{playerAuctionData?.current_price}</div>
                <div className="auctionBlock">
                    <div className="initValueNoShowContorller">
                        <Switch
                            onChange={() => {
                                setInitValueNoShow(!initValueNoShow);
                            }}
                        />
                        Show initial value
                    </div>
                    <div className="myOrder">
                        <Orders
                            data={current_auction_data.orders}
                            hasWinner={current_auction_data.close_time}
                            chooseSecond={current_auction_data.auc_type === constants.AUC_TYPE.SEALED2}
                            reservationPrice={current_auction_data.reservation_price || 0}
                            initValueNoShow={initValueNoShow}
                            titleNoShow={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
