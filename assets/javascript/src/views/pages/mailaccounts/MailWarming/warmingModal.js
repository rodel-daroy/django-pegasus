import DayJs from "dayjs";
import React, { useEffect, useState } from "react";
import { Bar, Pie, defaults } from "react-chartjs-2";
import { Card, CardBody, CardHeader, Col, Modal, Row } from "reactstrap";
const relativeTime = require("dayjs/plugin/relativeTime");
DayJs.extend(relativeTime);

export default ({ isOpen, close, email }) => {
  defaults.pie.tooltips = false;
  defaults.pie.hover = { mode: null };
  defaults.bar.scales.yAxes[0].ticks = {
    stepSize: 10000,
    min: 0,
  };

  console.log(defaults.bar);
  const [date, setDate] = useState(DayJs().subtract(14, "day"));
  const [dataPieChart, setDataPieChart] = useState({
    labels: ["Spam", "Inbox", "Categories"],
    datasets: [
      {
        label: "Dataset 1",
        data: [],
        backgroundColor: ["#dbbdff", "#c8f4d5", "#ffddbd"],
      },
      {
        label: "contorno",
        data: [6, 7, 8],
        backgroundColor: ["white", "white", "white"],
        hoverBackgroundColor: "transparent",
        hoverBorderColor: "transparent",
        pointHoverBackgroundColor: "transparent",
        tooltips: false,
      },
    ],
  });

  const [dataBarSent, setDataBarSent] = useState({
    labels: [],
    datasets: [
      {
        label: "Spam",
        data: [],
        backgroundColor: "#dbbdff",
      },
      {
        label: "Inbox",
        data: [],
        backgroundColor: "#c8f4d5",
      },
      {
        label: "Categories",
        data: [],
        backgroundColor: "#ffddbd",
      },
    ],
  });

  const [dataBarReceive, setDataBarReceive] = useState({
    labels: [],
    datasets: [
      {
        label: "Spam",
        data: [],
        backgroundColor: "#dbbdff",
      },
      {
        label: "Inbox",
        data: [],
        backgroundColor: "#c8f4d5",
      },
      {
        label: "Categories",
        data: [],
        backgroundColor: "#ffddbd",
      },
    ],
  });
  const [results, setResults] = useState({});
  const calculateDataReceive = () => {
    let reportToCalculate = email?.reports.filter?.((report) => {
      const dateToFilter = DayJs(report.sent_at);
      return date.isBefore(dateToFilter) && report.type_report === "RECEIVE";
    });

    const results = reportToCalculate?.reduce?.(
      (acc, report) => {
        acc.sent += report.sent;
        acc.saved_from_spam += report.saved_from_spam;
        acc.saved_from_other_categories += report.saved_from_other_categories;
        acc.saved_from_inbox += report.saved_from_inbox;
        return acc;
      },
      {
        sent: 0,
        saved_from_spam: 0,
        saved_from_other_categories: 0,
        saved_from_inbox: 0,
      }
    );
    console.log(dataPieChart);
    dataPieChart.datasets[0].data = [];
    if (results?.saved_from_spam || results?.saved_from_spam === 0)
      dataPieChart.datasets[0].data.push(results?.saved_from_spam);
    if (results?.saved_from_inbox || results?.saved_from_inbox === 0)
      dataPieChart.datasets[0].data.push(results?.saved_from_inbox);
    if (
      results?.saved_from_other_categories ||
      results?.saved_from_other_categories === 0
    )
      dataPieChart.datasets[0].data.push(results?.saved_from_other_categories);
    reportToCalculate = reportToCalculate ? reportToCalculate.sort((first, second) => DayJs(first.created_date) < DayJs(second.created_date) ? -1 : 1) : reportToCalculate
    const resultsBar = reportToCalculate?.reduce?.(
      (acc, report) => {
        acc[0].push(report.saved_from_spam);
        acc[1].push(report.saved_from_inbox);
        acc[2].push(report.saved_from_other_categories);
        acc[3].push(report.created_date);
        return acc;
      },
      [[], [], [], []]
    );
    if (resultsBar) {
      dataBarReceive.labels = resultsBar[3];
      dataBarReceive.datasets[0].data = resultsBar[0];
      dataBarReceive.datasets[1].data = resultsBar[1];
      dataBarReceive.datasets[2].data = resultsBar[2];
    }
    setDataBarReceive(dataBarReceive);
    setDataPieChart(dataPieChart);
    setResults(results);
  };

  const calculateDataSent = () => {
    let reportToCalculate = email?.reports.filter?.((report) => {
      const dateToFilter = DayJs(report.sent_at);
      return date.isBefore(dateToFilter) && report.type_report === "SENT";
    });
    reportToCalculate = reportToCalculate ? reportToCalculate.sort((first, second) => DayJs(first.created_date) < DayJs(second.created_date) ? -1 : 1) : reportToCalculate
    const results = reportToCalculate?.reduce?.(
      (acc, report) => {
        acc[0].push(report.saved_from_spam);
        acc[1].push(report.saved_from_inbox);
        acc[2].push(report.saved_from_other_categories);
        acc[3].push(report.created_date);
        return acc;
      },
      [[], [], [], []]
    );
    if (results) {
      dataBarSent.labels = results[3];
      dataBarSent.datasets[0].data = results[0];
      dataBarSent.datasets[1].data = results[1];
      dataBarSent.datasets[2].data = results[2];
    }

    setDataBarSent(dataBarSent);
  };

  useEffect(() => {
    calculateDataReceive();
    calculateDataSent();
  }, [date, email]);

  return (
    <Modal isOpen={isOpen} toggle={close} size="xl">
      <Card className="no-shadow stats-warming">
        <CardHeader className="pb-0">
          <h2 className="title">Detailed Report</h2>
        </CardHeader>
        <CardBody className="pt-4 pb-0">
          <Row>
            <Col>
              <div className="subtitle_1_container">
                <h2 className="subtitle_1">
                  WARMING EMAILS SENT IN THE LAST {date.fromNow(true)}
                </h2>
                <span className="number_result">{results?.sent}</span>
              </div>
              <div className="subtitle_1_container">
                <h2 className="subtitle_1">
                  WARMING EMAILS SAVED FROM SPAM & CATEGORIES IN THE LAST{" "}
                  {date.fromNow(true)}
                </h2>
                <span className="number_result">
                  {results?.saved_from_other_categories +
                    results?.saved_from_spam}
                </span>
              </div>
            </Col>
            <Col>
              <h2 className="subtitle_2">Where your warming emails landing?</h2>
              <Pie data={dataPieChart} options={defaults.pie} />
            </Col>
          </Row>
          <Row>
            <Col>
              <h2 className="subtitle_2">
                Where are your cold emails landing?
              </h2>
              <Bar data={dataBarSent} options={defaults.bar} />
            </Col>
            <Col>
              <h2 className="subtitle_2">Where your replies landing?</h2>
              <Bar data={dataBarReceive} options={defaults.bar} />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Modal>
  );
};
