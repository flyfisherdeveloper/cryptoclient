import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

class LineGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: 4,
            days: 7,
            months: 0,
            isArea: true,
            options: {
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
                        shadeIntensity: 0.8,
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
                        //offsetX: -20,
                        offsetX: 0,
                        offsetY: 0
                    },
                },
                yaxis: [
                    {
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
                        format: "MM/dd/yyyy HH:mm"
                    },
                    y: {
                        title: {
                            formatter: () => this.props.isQuoteVolume ? this.props.quote : this.props.coin,
                        }
                    }
                }
            },

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
        this.setState({hours: hours, days: days, months: months}, () => {
            this.retrieveChartData();
        });
    }

    updateChartType(isArea) {
        this.setState({isArea: isArea}, () => {
            //todo: save json data to avoid round trip?
            this.retrieveChartData();
        });
    }

    getAreaData(json) {
        let info = json.map((data) => {
            let date = new Date(data.closeTime);
            date.setMinutes(date.getMinutes() + 1);
            let value = 0.0;
            if (this.props.isQuoteVolume) {
                value = data.quoteAssetVolume.toPrecision(2);
            } else if (this.props.isPrice) {
                value = data.close;
            } else {
                value = data.volume.toPrecision(2);
            }
            return [date.toLocaleString(), value];
        });
        console.log(info);
        return info;
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

    retrieveChartData() {
        const url = "http://localhost:8080/api/v1/binance/DayTicker/";
        let daysOrMonths = (this.state.months === 0 ? this.state.days + "d" : this.state.months + "M");
        fetch(url + this.props.symbol + "/" + this.state.hours + "h/" + daysOrMonths)
            .then(result => result.json())
            .then((json) => {
                let info = null;
                let isArea = this.state.isArea;
                if (isArea) {
                    info = this.getAreaData(json);
                } else {
                    info = this.getCandleStickData(json);
                }
                let seriesData = [{
                    data: info,
                    type: (isArea ? "area" : "candlestick"),
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
        this.retrieveChartData();
    }

    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Chart
                    options={this.state.options}
                    series={this.state.series}
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
