import React from "react";
import * as constants from "../../constants";
import "./style.scss";
const Editor = (props) => {
    const { playerAuctionData } = props;

    const convertType = (str) => {
        return Object.keys(constants.AUC_TYPE).filter((ele) => constants.AUC_TYPE[ele] === str);
    };

    return (
        <div className="aucType row">
            <div>{convertType(playerAuctionData?.auc_type)}</div>
        </div>
    );
};
export default Editor;
