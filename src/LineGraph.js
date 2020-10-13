import React from "react";
import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import urlObject from "./UrlObject";

class LineGraph extends React.Component {
    chart = null;
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

    getTitle() {
        return this.getPriceOrVolumeString() + " Chart for " + this.props.coin;
    }

    getPriceOrVolumeString() {
        return (this.props.isPrice ? "Price" : "Volume");
    }

    updateChart(hours, days, months) {
        this.retrieveChartData(hours, days, months);
    }

    getAreaData(json) {
        function roundNear(value, decimalPlaces) {
            return Math.floor(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        }

        let info = json.map((data) => {
            let date = new Date(data.closeTime);
            date.setMinutes(date.getMinutes() + 1);
            let value = 0.0;
            if (this.props.isQuoteVolume) {
                value = roundNear(data.quoteAssetVolume, 2);
            } else if (this.props.isPrice) {
                value = data.close;
            } else {
                value = roundNear(data.volume, 2);
            }
            return [date.toLocaleString(), value];
        });
        return info;
    }

    retrieveChartData(hours, days, months) {
        const url = urlObject.apiHost + "/DayTicker/";
        let daysOrMonths = (months === 0 ? days + "d" : months + "M");
        fetch(url + this.props.symbol + "/" + hours + "h/" + daysOrMonths)
            .then(result => result.json())
            .then((json) => {
                let info = null;
                info = this.getAreaData(json);
                let seriesData = [{
                    data: info,
                    type: this.props.isArea ? "area" : "line"
                }];
                if (info != null && info.length > 0) {
                    this.startValue = info[0][1];
                    this.endValue = info[info.length - 1][1];
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
        let isPrice = this.props.isPrice;
        let isQuoteVolume = this.props.isQuoteVolume;
        let quote = this.props.quote;
        let coin = this.props.coin;

        //this function sets the area/line color based on price: if price is lower, then red, else green
        function getColors() {
            if (isPrice) {
                if (startVal > endVal) {
                    return ['#E91E63'];
                }
                return ['#18c12c'];

            }
            //if not a price chart (volume chart), then just set color to light blue
            return ['#2E93fA'];
        }

        function getSubtitleColor() {
            if (isPrice) {
                let colors = getColors();
                return colors[0];
            }
            return '#000000';
        }

        function getYAxisText() {
            if (isPrice) {
                return "Price in " + quote;
            }
            return "Volume in " + (isQuoteVolume ? quote : coin);
        }

        function getSubtitleText() {
            if (isPrice) {
                let value = 0.0;
                if (startVal > endVal) {
                    value = -((startVal - endVal) / startVal) * 100;
                } else {
                    value = ((endVal - startVal) / startVal) * 100;
                }
                return value.toFixed(2) + '%';

            }
            return "(Volume in " + (isQuoteVolume ? quote : coin) + ")";
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
            fill: {
                type: 'gradient',
                gradient: {
                    shade: "dark",
                    type: "vertical",
                    shadeIntensity: 0.4,
                }
            },
            colors: getColors(),
            title: {
                text: this.getTitle(),
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
                        text: getYAxisText(),
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
                    show: false,
                },
                show: true,
                y: {
                    title: {
                        formatter: () => this.props.isQuoteVolume ? this.props.quote : this.props.coin,
                    }
                },
            }
        })
    }

    render() {
        let options = this.getChartOptions();
        this.chart =
            <div style={{width: "100%", height: "100%"}}>
                <ReactApexChart
                    options={options}
                    series={this.state.series}
                    height="100%"
                    width="100%"
                />
            </div>;
        return this.chart;
    }
}

LineGraph.propTypes = {
    symbol: PropTypes.string,
    quote: PropTypes.string,
    coin: PropTypes.string,
    isQuoteVolume: PropTypes.bool,
    isPrice: PropTypes.bool,
    isArea: PropTypes.bool,
    isLine: PropTypes.bool,
    hours: PropTypes.number,
    days: PropTypes.number,
    months: PropTypes.number,
};
export default LineGraph;
