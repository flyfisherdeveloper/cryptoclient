import React from "react";
import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import urlObject from "./UrlObject";

class CandleStickChart extends React.Component {
    startValue = 0.0;
    endValue = 0.0;

    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    data: [],
                }
            ]
        };
    }

    updateChart(hours, days, months) {
        this.retrieveChartData(hours, days, months);
    }

    getCandleStickData(json) {
        let info = json.map((data) => {
            let date = new Date(data.closeTime);
            date.setMinutes(date.getMinutes() + 1);
            let value = [data.open, data.high, data.low, data.close];
            return {x: date.toLocaleString(), y: value};
        });
        return info;
    }

    retrieveChartData(hours, days, months) {
        const url = urlObject.apiHost + "/DayTicker/";
        let daysOrMonths = (months === 0 ? days + "d" : months + "M");
        fetch(url + this.props.symbol + "/" + hours + "h/" + daysOrMonths)
            .then(result => result.json())
            .then((json) => {
                let info = this.getCandleStickData(json);
                let seriesData = [{
                    data: info,
                }];
                if (info != null && info.length > 0) {
                    //the data is formatted on the 'y' value as: open, high, low, close
                    //we are looking for the open of the first array element as the start value,
                    // and the close of the end of the array element as the end value
                    this.startValue = info[0].y[0];
                    this.endValue = info[info.length - 1].y[3];
                }
                this.setState({series: seriesData});
            }).catch(err => {
            if (err.name === 'AbortError') {
                console.log("error catch: " + err);
                return;
            }
            throw err;
        });
    }

    componentDidMount() {
        this.retrieveChartData(this.props.hours, this.props.days, this.props.months);
    }

    getChartOptions() {
        let startVal = this.startValue;
        let endVal = this.endValue;

        function getSubtitleText() {
            if (startVal === 0.0) {
                return "";
            }
            let value;
            if (startVal > endVal) {
                value = -((startVal - endVal) / startVal) * 100;
            } else {
                value = ((endVal - startVal) / startVal) * 100;
            }
            return value.toFixed(2) + '%';
        }

        function getSubtitleColor() {
            if (startVal > endVal) {
                return '#E91E63';
            }
            return '#18c12c';
        }

        return ({
            chart: {
                group: "DataCharts",
                animations: {
                    enabled: true
                },
                zoom: {
                    type: "x",
                    enabled: true,
                    autoScaleYaxis: true
                },
                toolbar: {
                    show: true,
                    tools: {
                        download: false,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                    },
                    autoSelected: 'zoom'
                },
                background: "#fff",
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                style: 'hollow'
            },
            title: {
                text: "Price Chart for " + this.props.coin,
                style: {
                    fontSize: "32px"
                },
                align: "middle",
                offsetY: 30
            },
            subtitle: {
                text: getSubtitleText(),
                style: {
                    fontSize: "16px",
                    fontWeight: "bolder",
                    color: getSubtitleColor()
                },
                offsetY: 70,
                align: "middle",
            },
            xaxis: {
                axisTicks: {show: true},
                axisBorder: {
                    show: true,
                    color: '#000000',
                    height: 1,
                    width: '100%',
                    offsetX: 0,
                    offsetY: 0
                },
                type: "datetime",
                labels: {
                    style: {
                        colors: [],
                        fontSize: '16px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        cssClass: 'apexcharts-xaxis-label',
                    },
                    offsetX: 0,
                    offsetY: 0
                },
            },
            yaxis: [
                {
                    min: function (min) {
                        return (min < 0 ? 0 : min);
                    },
                    axisTicks: {show: true},
                    axisBorder: {
                        show: true,
                        color: '#000000',
                        height: 1,
                        width: '100%',
                        offsetX: 0,
                        offsetY: 0
                    },
                    labels: {
                        show: true,
                        minWidth: 60,
                        style: {
                            fontSize: '16px'
                        }
                    },
                    title: {
                        text: "Price in " + this.props.quote,
                        rotate: 90,
                        offsetX: -7,
                        offsetY: 0,
                        style: {
                            color: undefined,
                            fontSize: '24px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            cssClass: 'apexcharts-yaxis-title',
                        },
                    },
                    tooltip: {enabled: true}
                },
            ],
            stroke: {
                width: 2.5,
                curve: 'straight'
            },
            legend: {
                show: true
            },
            tooltip: {
                enabled: true,
                shared: true,
                theme: "dark",
                x: {
                    format: "MM/dd/yyyy HH:mm",
                },
                show: true,
                y: {
                    title: this.props.coin,
                },
            }
        });
    }

    render() {
        let options = this.getChartOptions();
        return (
            <div style={{width: "100%", height: "100%"}}>
                <ReactApexChart
                    options={options}
                    series={this.state.series}
                    type={"candlestick"}
                    height="100%"
                    width="100%"
                />
            </div>
        );
    }
}

CandleStickChart.propTypes = {
    symbol: PropTypes.string,
    quote: PropTypes.string,
    coin: PropTypes.string,
    hours: PropTypes.number,
    days: PropTypes.number,
    months: PropTypes.number,
};
export default CandleStickChart;
