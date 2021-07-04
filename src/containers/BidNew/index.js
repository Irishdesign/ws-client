import React, { useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "./App.scss";
import * as url from "../../Endpoint";
import AuctionInfoDiv from "../../components/AuctionInfoDiv";
import * as constants from "../../constants";
import { Statistic, Row, Col } from "antd";
import ListItem from "../../components/ListItem";
import { Form, Input, Button, message, InputNumber } from "antd";
import * as utils from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import InvitationHeader from "../../components/InvitationHeader";
import TypeBanner from "../../components/TypeBanner";
import queryString from "query-string";
import { setPlayerData } from "../../store/action";
const client = new W3CWebSocket("ws://auc-websocket.herokuapp.com/");

const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        sm: { offset: 0 },
        md: { offset: 8 },
        span: 16,
    },
};

function App(props) {
    const [form] = Form.useForm();
    const [myPrice, setMyPrice] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState("-");
    const playerData = useSelector((state) => state.playerData);
     const showPlayerPage = useSelector((state) => state.showPlayerPage);
   //  const showPlayerPage = true;  // TODO:need to remove
    const [leftValue, setLeftValue] = React.useState();
    const mockMyOrder = [
        { rice: 100, updatedAt: "00:12:13" },
        { rice: 200, updatedAt: "00:15:13" },
    ]; // TODO:need to remove
    const [myOrder, setMyOrder] = React.useState(mockMyOrder);
    const [playerAuctionData, setPlayerAuctionData] = React.useState({});
    console.log("playerAuctionData", playerAuctionData);
    const dispatch = useDispatch();
    React.useEffect(() => {
        QueryParamsDemo();
        updateWithCountDown();
    }, []);
    React.useEffect(() => {
        client.onopen = () => {
            console.log("WebSocket Client Connected");
        };
        client.onmessage = (message) => {
            console.log("Bidder response msg: ", message);
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
    const onFinish = async (values) => {
        const { auctionNo, name } = values;
        const res = await utils.createPlayer(auctionNo, name);
        if (res.status >= 400) {
            message.warning(res.message);
            return;
        }
        dispatch(setPlayerData(res));
        //   setPlayerAuctionData(res.auction);
        setMyPrice("");
        //   updateWithCountDown();
    };
    function QueryParamsDemo() {
        let query = queryString.parse(props.location.search);
        form.setFieldsValue({
            auctionNo: query.no,
        });
        return query.no;
    }
    const onFill = () => {
        form.setFieldsValue({
            auctionNo: "",
            name: "",
        });
    };
    //  const handleTimerUpdate = async ()=>{
    //    const res = await utils.createOrder(playerAuctionData.no, sendData);
    //  }
    const handleCreateOrder = async (isDutch) => {
        //   console.log(price);
        const sendData = {
            player_id: playerData.id,
            price: isDutch ? playerAuctionData.current_price : myPrice,
        };
        if (sendData.price > playerData.current_value) {
            message.error(`The price is less than you're current value`);
            return;
        }
        const res = await utils.createOrder(playerAuctionData.no, sendData);

        if (res.status >= 400) {
            message.warning(res.message);
            return;
        }

        setMyOrder((prev) => {
            prev.push({ price: sendData.price, updatedAt: res.updatedAt });
            return prev;
        });
        setLeftValue(res.left_value);
        message.success(`Your order(price at${sendData.price}) had been sent`);
    };
    function updateWithCountDown() {
      //   setTimeout(function () {
            const res = utils.getPlayerAuction(QueryParamsDemo());
            res.then((data) => {
                if (data) {
                    setPlayerAuctionData(data);
                    //   console.log(77777,data)
                    if (data.auc_type === constants.AUC_TYPE.DUTCH) {
                        setMyPrice(data.current_price);
                    }
                  //   if (!data.close_time) {
                  //       updateWithCountDown();
                  //   }
                }
            });
      //   }, 1000);
    }
    const convertType = (str) => {
        return Object.keys(constants.AUC_TYPE).filter((ele) => constants.AUC_TYPE[ele] === str);
    };
    const getOrdersText = () => {
        const clone = JSON.parse(JSON.stringify(myOrder));
        return (
            <ul>
                {clone.reverse().map((o) => {
                    return <li>{`${o.updatedAt} : $ ${o.price}`}</li>;
                })}
            </ul>
        );
    };
    const getStatus = () => {
        if (!playerAuctionData.start_time) {
            return "Waiting";
        } else if (playerAuctionData.close_time) {
            return "End";
        } else {
            return "Bidding";
        }
    };
    return (
        <div className="App">
            <InvitationHeader />
            <div className="container">
                {showPlayerPage ? (
                    <div className="playerPage">
                        <div className="cover top" />
                        <div className="cover down" />
                        <div className="header fixed">
                            <TypeBanner playerAuctionData={playerAuctionData} />
                            <div className="time row">
                                <div className="highlight block">
                                    <div className="title">Current Price</div>
                                    <div className="value">{playerAuctionData?.current_price}</div>
                                </div>
                                <div className="highlight block">
                                    <div className="title">Timer</div>
                                    {/* <div className="value">{playerAuctionData?.left_time?.replace(/00\:/, "")}</div> */}
                                    <div className="value">{currentTime}</div>
                                </div>
                            </div>
                        </div>
                        <div className="blockAuction row">
                            <AuctionInfoDiv
                                data={playerAuctionData}
                                isPlayer={true}
                                playerInfo={playerData}
                                leftValue={leftValue}
                            />
                            <ListItem label="My orders" children={getOrdersText()} />
                        </div>

                        <div className="blockBidder row fixed">
                            <div className="myMoney">
                                <div className="label">👛 My Money: </div>
                                <div className="value">{playerAuctionData?.current_value || 100}</div>

                                <div className={`status ${getStatus()}`}>{getStatus()}</div>
                            </div>
                            <div className="myOrder">
                                <div className="bidInput">
                                    <InputNumber
                                        onChange={(v) => setMyPrice(v)}
                                        value={myPrice}
                                        size="large"
                                        autoFocus
                                    />
                                </div>
                                <div className="bidBtn">
                                    <div
                                        className="btn"
                                        onClick={() => {
                                            handleCreateOrder();
                                        }}
                                    >
                                        {playerAuctionData?.auc_type === constants.AUC_TYPE.DUTCH ? "Accept" : "BID"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bid">
                        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
                            <Form.Item
                                name="auctionNo"
                                label="Auction No"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input a auction no!",
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input an user name!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                {/* <Button htmlType="button" onClick={onReset}> */}
                                <Button htmlType="button" onClick={onFill}>
                                    Reset
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
