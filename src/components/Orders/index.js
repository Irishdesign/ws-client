import React from "react";
import { Descriptions, Table } from "antd";

const Orders = (props) => {
    const { data, hasWinner, chooseSecond, reservationPrice, initValueNoShow, titleNoShow } = props;
    const formatData = (d) =>
        d &&
        d.map((ele, idx) => {
            const winnerIdx = chooseSecond ? 1 : 0;
            return {
                price:
                    hasWinner && idx === winnerIdx && ele.price >= reservationPrice
                        ? `Winner: ${ele.price}`
                        : ele.price,
                name: ele.player.name,
                init_value: ele.player.init_value,
                time: ele.createdAt.split(".")[0].split("T").join(" "),
            };
        });
    const columns = () => {
        return !initValueNoShow
            ? [
                  {
                      title: "Price",
                      dataIndex: "price",
                  },
                  {
                      title: "Name",
                      dataIndex: "name",
                  },
                  {
                      title: "Init value",
                      dataIndex: "init_value",
                      onFilter: (value, record) => record.address.indexOf(value) === 0,
                      sorter: (a, b) => a.init_value - b.init_value,
                      sortDirections: ["descend", "ascend"],
                  },
                  {
                      title: "Time",
                      dataIndex: "time",
                  },
              ]
            : [
                  {
                      title: "Price",
                      dataIndex: "price",
                  },
                  {
                      title: "Name",
                      dataIndex: "name",
                  },
                  {
                      title: "Time",
                      dataIndex: "time",
                  },
              ];
    };

   //  function onChange(pagination, filters, sorter, extra) {
   //      console.log("params", pagination, filters, sorter, extra);
   //  }
    //  const data = [];
    //  for (let i = 0; i < 100; i++) {
    //      data.push({
    //          key: i,
    //          name: "John Brown",
    //          price: 32,
    //          Time: "New York No. 1 Lake Park",
    //      });
    //  }

    return (
        <>
            {!titleNoShow ? (
                <>
                    <Descriptions title="Orders"></Descriptions>Total: {data?.length || 0}
                </>
            ) : null}
            <Table columns={columns()} dataSource={formatData(data)} pagination={false} scroll={{ y: 200 }} />
        </>
    );
};

export default Orders;
