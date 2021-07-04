import React, { useState } from "react";
import "./App.scss";
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
import { setPlayerData } from "../../store/action";
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

    function QueryParamsDemo() {
        let query = queryString.parse(props.location.search);
        form.setFieldsValue({
            auctionNo: query.no,
        });
        return query.no;
    }

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
                    <div className="circle">{playerAuctionData?.left_time?.replace(/00\:/, "")}</div>
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
