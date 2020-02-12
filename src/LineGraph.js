import React from "react";
import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import urlObject from "./UrlObject";

class LineGraph extends React.Component {
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

    getYAxisText() {
        if (this.props.isPrice) {
            return "Price in " + this.props.quote;
        }
        return "Volume in " + (this.props.isQuoteVolume ? this.props.quote : this.props.coin);
    }

    getSubtitleText() {
        if (this.props.isPrice) {
            return "(Price in " + this.props.quote + ")";
        }
        return "(" + this.getYAxisText() + ")";
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
                }];
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
            title: {
                text: this.getTitle(),
                style: {
                    fontSize: "32px"
                },
                align: "middle",
                offsetY: 30
            },
            subtitle: {
                text: this.getSubtitleText(),
                style: {
                    fontSize: "16px"
                },
                offsetY: 70,
                align: "middle"
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
                        text: this.getYAxisText(),
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
        console.log("render LineGraph");
        let options = this.getChartOptions();
        return (
            <div style={{width: "100%", height: "100%"}}>
                <ReactApexChart
                    options={options}
                    series={this.state.series}
                    type={"area"}
                    height="100%"
                    width="100%"
                />
            </div>
        );
    }
}

LineGraph.propTypes = {
    symbol: PropTypes.string,
    quote: PropTypes.string,
    coin: PropTypes.string,
    isQuoteVolume: PropTypes.bool,
    isPrice: PropTypes.bool,
    hours: PropTypes.number,
    days: PropTypes.number,
    months: PropTypes.number,
};
export default LineGraph;
